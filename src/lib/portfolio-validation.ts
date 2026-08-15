type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isHttpUrl(value: unknown): boolean {
  const candidate = text(value);
  if (!candidate) return true;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function normalizeCompanyName(value: unknown): string {
  return text(value)
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\bcommunications\b/g, "communication")
    .replace(/\b(limited|ltd|pvt|private|inc|llc|co|corp|corporation|company)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function companiesMatch(first: unknown, second: unknown): boolean {
  const firstKey = normalizeCompanyName(first);
  const secondKey = normalizeCompanyName(second);
  return Boolean(firstKey && secondKey && firstKey === secondKey);
}

export function getExperienceCompanies(data: unknown): string[] {
  if (!isRecord(data) || !Array.isArray(data.experience)) return [];

  return Array.from(
    new Set(
      data.experience
        .filter(isRecord)
        .map((item) => text(item.company))
        .filter(Boolean)
    )
  ).sort((first, second) => first.localeCompare(second));
}

function normalizeTags(value: unknown): unknown {
  if (typeof value === "string") {
    return Array.from(
      new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))
    );
  }
  if (Array.isArray(value)) {
    return Array.from(
      new Set(value.map((tag) => text(tag)).filter(Boolean))
    );
  }
  return value;
}

export function canonicalizePortfolioContent<T>(data: T): T {
  if (!isRecord(data)) return data;

  const companies = getExperienceCompanies(data);
  return {
    ...data,
    ...(Array.isArray(data.experience)
      ? {
          experience: data.experience.map((entry) =>
            isRecord(entry) ? { ...entry, tags: normalizeTags(entry.tags) } : entry
          ),
        }
      : {}),
    ...(Array.isArray(data.projects)
      ? {
          projects: data.projects.map((project) => {
            if (!isRecord(project)) return project;
            const canonicalCompany = companies.find((company) =>
              companiesMatch(company, project.company)
            );
            return {
              ...project,
              ...(canonicalCompany ? { company: canonicalCompany } : {}),
              tags: normalizeTags(project.tags),
            };
          }),
        }
      : {}),
    ...(Array.isArray(data.demos)
      ? {
          demos: data.demos.map((demo) =>
            isRecord(demo) ? { ...demo, tags: normalizeTags(demo.tags) } : demo
          ),
        }
      : {}),
  } as T;
}

export function getDuplicateExperienceCompanies(data: unknown): string[] {
  if (!isRecord(data) || !Array.isArray(data.experience)) return [];

  const companiesByKey = new Map<string, string[]>();
  data.experience.filter(isRecord).forEach((entry) => {
    const company = text(entry.company);
    const key = normalizeCompanyName(company);
    if (!key) return;
    companiesByKey.set(key, [...(companiesByKey.get(key) || []), company]);
  });

  return Array.from(companiesByKey.values())
    .filter((companies) => companies.length > 1)
    .map((companies) => companies[0]);
}

export function getPortfolioValidationIssues(data: unknown): string[] {
  if (!isRecord(data)) return ["Portfolio data is missing."];

  const issues: string[] = [];
  if (!isRecord(data.siteConfig)) issues.push("Profile settings are missing.");
  if (!Array.isArray(data.experience)) issues.push("Experience data must be a list.");
  if (!Array.isArray(data.projects)) issues.push("Projects data must be a list.");
  if (issues.length > 0) return issues;

  const experience = data.experience as unknown[];
  const projects = data.projects as unknown[];
  const companies = getExperienceCompanies(data);

  experience.forEach((entry, index) => {
    if (!isRecord(entry)) {
      issues.push(`Experience entry ${index + 1} is invalid.`);
      return;
    }

    if (!["work", "education"].includes(text(entry.type))) {
      issues.push(`Experience entry ${index + 1} needs a valid type.`);
    }
    if (!text(entry.title) && !text(entry.role)) {
      issues.push(`Experience entry ${index + 1} needs a role or degree title.`);
    }
    if (!text(entry.company)) {
      issues.push(`Experience entry ${index + 1} needs a company or institution.`);
    }
    if (!text(entry.period) && !text(entry.duration)) {
      issues.push(`Experience entry ${index + 1} needs a period.`);
    }
    if (!isHttpUrl(entry.companyUrl)) {
      issues.push(`Experience entry ${index + 1} has an invalid company website URL.`);
    }
  });

  projects.forEach((project, index) => {
    if (!isRecord(project)) {
      issues.push(`Project ${index + 1} is invalid.`);
      return;
    }

    const title = text(project.title);
    const company = text(project.company);
    if (!title) issues.push(`Project ${index + 1} needs a title.`);
    if (!company) {
      issues.push(`${title || `Project ${index + 1}`} needs a company or institution.`);
    } else if (!companies.some((candidate) => companiesMatch(candidate, company))) {
      issues.push(`${title || `Project ${index + 1}`} is not linked to an Experience company.`);
    }
    if (!isHttpUrl(project.githubUrl || project.github)) {
      issues.push(`${title || `Project ${index + 1}`} has an invalid GitHub URL.`);
    }
    if (!isHttpUrl(project.websiteUrl || project.demo)) {
      issues.push(`${title || `Project ${index + 1}`} has an invalid website URL.`);
    }
  });

  if (Array.isArray(data.demos)) {
    data.demos.forEach((demo, index) => {
      if (!isRecord(demo)) {
        issues.push(`Demo website ${index + 1} is invalid.`);
        return;
      }

      const title = text(demo.title);
      if (!title) issues.push(`Demo website ${index + 1} needs a title.`);
      if (!text(demo.summary) && !text(demo.about)) {
        issues.push(`${title || `Demo website ${index + 1}`} needs a summary or about text.`);
      }
      if (!text(demo.websiteUrl) && !text(demo.githubUrl)) {
        issues.push(`${title || `Demo website ${index + 1}`} needs a live URL or GitHub link.`);
      }
      if (!isHttpUrl(demo.websiteUrl)) {
        issues.push(`${title || `Demo website ${index + 1}`} has an invalid website URL.`);
      }
      if (!isHttpUrl(demo.githubUrl)) {
        issues.push(`${title || `Demo website ${index + 1}`} has an invalid GitHub URL.`);
      }
      if (!isHttpUrl(demo.docUrl)) {
        issues.push(`${title || `Demo website ${index + 1}`} has an invalid documentation URL.`);
      }
    });
  }

  return issues;
}
