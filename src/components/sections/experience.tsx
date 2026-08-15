"use client";

import { experience as defaultExperience, projects as defaultProjects } from "@/lib/data";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { companiesMatch } from "@/lib/portfolio-validation";
import { ArrowDown, ExternalLink, Github, FolderKanban } from "lucide-react";

interface ExperienceItem {
  type: string;
  period: string;
  title: string;
  company: string;
  companyUrl?: string;
  description: string;
  bullets?: string[];
  tags?: string[];
}

interface ProjectItem {
  title: string;
  role?: string;
  company?: string;
  description?: string;
  tags?: string[] | string;
  githubUrl?: string;
  github?: string;
  websiteUrl?: string;
  demo?: string;
  impact?: string[];
}

function parsePeriodYears(period: string): { start: number; end: number } {
  const normalized = (period || "").trim().toUpperCase();

  if (normalized === "CURRENT" || normalized === "PRESENT") {
    return { start: 9999, end: 9999 };
  }

  const years = normalized.match(/\b(19|20)\d{2}\b/g);
  if (!years || years.length === 0) {
    return { start: 0, end: 0 };
  }

  const start = parseInt(years[0], 10);
  let end = start;

  if (years.length > 1) {
    end = parseInt(years[1], 10);
  } else if (normalized.includes("CURRENT") || normalized.includes("PRESENT") || normalized.includes("NOW")) {
    end = 9999;
  }

  return { start, end };
}

function parseTags(tags?: unknown): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return Array.from(
      new Set(
        tags.flatMap((tag) =>
          String(tag)
            .replace(/([a-z])([A-Z])/g, "$1, $2")
            .split(/,|\n/)
            .map((value) => value.trim())
            .filter(Boolean)
        )
      )
    );
  }
  if (typeof tags === "string") {
    return Array.from(
      new Set(
        tags
          .replace(/([a-z])([A-Z])/g, "$1, $2")
          .split(/,|\n/)
          .map((value) => value.trim())
          .filter(Boolean)
      )
    );
  }
  return [];
}

function safeExternalUrl(value?: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

const sortDescending = (a: ExperienceItem, b: ExperienceItem) => {
  const aYears = parsePeriodYears(a.period);
  const bYears = parsePeriodYears(b.period);
  if (aYears.start !== bYears.start) return bYears.start - aYears.start;
  return bYears.end - aYears.end;
};

function ProjectCards({
  projects,
  accent = "primary",
}: {
  projects: ProjectItem[];
  accent?: "primary" | "accent";
}) {
  if (!projects.length) return null;

  const accentVar = accent === "primary" ? "var(--primary)" : "var(--accent)";
  const pillClass =
    accent === "primary"
      ? "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20"
      : "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20";

  return (
    <div className="mt-5 space-y-3">
      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <FolderKanban className="w-4 h-4" style={{ color: accentVar }} />
        Projects:
      </p>
      <div className="space-y-3">
        {projects.map((proj) => {
          const tags = parseTags(proj.tags);
          const github = safeExternalUrl(proj.githubUrl || proj.github);
          const live = safeExternalUrl(proj.websiteUrl || proj.demo);

          return (
            <div
              key={`${proj.company ?? "project"}-${proj.title}`}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-4 md:p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <h5 className="text-[15px] font-bold text-slate-900 dark:text-white leading-snug">
                  {proj.title}
                </h5>
                {(github || live) && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {github && (
                      <a
                        href={github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-[var(--primary)] hover:border-[var(--primary)]/40 transition-colors"
                        aria-label={`${proj.title} GitHub`}
                      >
                        <Github className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {live && (
                      <a
                        href={live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-[var(--primary)] hover:border-[var(--primary)]/40 transition-colors"
                        aria-label={`${proj.title} live demo`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {proj.role && (
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                  {proj.role}
                </p>
              )}

              {proj.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                  {proj.description}
                </p>
              )}

              {proj.impact && proj.impact.length > 0 && (
                <ul className="mb-3 space-y-1.5">
                  {proj.impact.slice(0, 2).map((metric) => (
                    <li
                      key={metric}
                      className="text-xs text-slate-500 dark:text-slate-400 flex gap-2 items-start"
                    >
                      <span
                        className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                        style={{ background: accentVar }}
                      />
                      <span>{metric}</span>
                    </li>
                  ))}
                </ul>
              )}

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {tags.map((tag, tagIndex) => (
                    <span
                      key={tag}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                        tagIndex < 2
                          ? pillClass
                          : "bg-transparent text-slate-500 dark:text-slate-400 border-transparent"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExperienceEntry({
  item,
  projects,
  accent,
  delay,
}: {
  item: ExperienceItem;
  projects: ProjectItem[];
  accent: "primary" | "accent";
  delay: number;
}) {
  const accentVar = accent === "primary" ? "var(--primary)" : "var(--accent)";
  const periodClass =
    accent === "primary"
      ? "text-[var(--primary)] bg-[var(--primary)]/10 border-[var(--primary)]/20"
      : "text-[var(--accent)] bg-[var(--accent)]/10 border-[var(--accent)]/20";
  const bulletClass = accent === "primary" ? "bg-[var(--primary)]/80" : "bg-[var(--accent)]/80";
  const tags = parseTags(item.tags);
  const companyUrl = safeExternalUrl(item.companyUrl);

  return (
    <ScrollReveal delay={delay}>
      <div className="relative pl-8 md:pl-10">
        <div
          className="absolute left-0 -translate-x-1/2 top-1.5 flex items-center justify-center w-9 h-9 rounded-full border-2 bg-white dark:bg-slate-950 shadow-sm shrink-0"
          style={{ borderColor: accentVar }}
        >
          <ArrowDown className="w-4 h-4" style={{ color: accentVar }} />
        </div>

        <div>
          <span
            className={`inline-block px-3 py-1 mb-2.5 text-[10px] font-bold tracking-wider border rounded-lg font-mono uppercase ${periodClass}`}
          >
            {item.period}
          </span>

          <h4 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white font-[var(--font-display)] leading-snug">
            {item.title}
          </h4>

          {companyUrl ? (
            <a
              href={companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1 mb-3 text-[15px] font-medium text-slate-600 dark:text-slate-300 hover:opacity-80 transition-opacity"
            >
              <span className="hover:underline decoration-[var(--primary)]/40 underline-offset-2">
                {item.company}
              </span>
            </a>
          ) : (
            <span className="inline-block mt-1 mb-3 text-[15px] font-medium text-slate-600 dark:text-slate-300">
              {item.company}
            </span>
          )}

          {item.description ? (
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3 max-w-3xl">
              {item.description}
            </p>
          ) : null}

          {item.bullets && item.bullets.length > 0 && (
            <ul className="space-y-2 mb-1 pl-0.5 text-slate-600 dark:text-slate-400 max-w-3xl">
              {item.bullets.map((bullet) => (
                <li key={bullet} className="text-sm flex gap-2.5 leading-relaxed items-start">
                  <span className={`w-1.5 h-1.5 rounded-full ${bulletClass} shrink-0 mt-2`} />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-[10px] md:text-xs font-semibold rounded-md bg-slate-50 dark:bg-slate-900/55 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800/80"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <ProjectCards projects={projects} accent={accent} />
        </div>
      </div>
    </ScrollReveal>
  );
}

export function Experience({
  experience: customExperience,
  projects: customProjects,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  experience?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  projects?: any[];
} = {}) {
  const experience = (customExperience || defaultExperience) as ExperienceItem[];
  const allProjects = (customProjects || defaultProjects) as ProjectItem[];

  const workExperience = experience.filter((item) => item.type === "work").sort(sortDescending);
  const educationExperience = experience
    .filter((item) => item.type === "education")
    .sort(sortDescending);

  const projectOwnerFor = (item: ExperienceItem) =>
    [...experience]
      .sort(sortDescending)
      .find((candidate) => companiesMatch(candidate.company, item.company));

  const projectsFor = (item: ExperienceItem) =>
    projectOwnerFor(item) === item
      ? allProjects.filter((proj) => companiesMatch(proj.company, item.company))
      : [];

  return (
    <section
      id="experience"
      className="px-4 py-10 sm:px-6 mx-auto lg:px-8 md:py-14 max-w-7xl z-10 relative bg-[var(--background)]"
    >
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12 select-none">
            <span className="inline-flex items-center justify-center gap-4 text-xs font-bold tracking-[0.25em] uppercase text-[var(--primary)] mb-4 font-mono">
              <span className="w-8 h-[1.5px] bg-[var(--primary)]/30 rounded-full" />
              HISTORY
              <span className="w-8 h-[1.5px] bg-[var(--primary)]/30 rounded-full" />
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-5 font-[var(--font-display)] leading-tight">
              Work &{" "}
              <span className="relative inline-block pb-1">
                Education
                <span className="absolute bottom-0 left-0 w-full h-[3.5px] bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-full" />
              </span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-[15px] max-w-2xl mx-auto leading-relaxed">
              Roles, responsibilities, and the projects delivered at each company and institution —
              so recruiters can see exactly what was built where.
            </p>
          </div>
        </ScrollReveal>

        {/* Work Experience */}
        <div className="mb-16">
          <ScrollReveal>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 mb-8 font-[var(--font-display)] border-b border-gray-200 dark:border-slate-800/80 pb-3">
              <span className="w-1.5 h-6 bg-[var(--primary)] rounded-full" />
              Professional Work Experience
            </h3>
          </ScrollReveal>

          <div className="relative border-l border-gray-200 dark:border-slate-800 ml-4 space-y-12">
            {workExperience.map((item, index) => (
              <ExperienceEntry
                key={`work-${item.company}-${item.title}-${item.period}`}
                item={item}
                projects={projectsFor(item)}
                accent="primary"
                delay={index * 0.08}
              />
            ))}
          </div>
        </div>

        {/* Education */}
        <div>
          <ScrollReveal>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 mb-8 font-[var(--font-display)] border-b border-gray-200 dark:border-slate-800/80 pb-3">
              <span className="w-1.5 h-6 bg-[var(--accent)] rounded-full" />
              Academic & Education Details
            </h3>
          </ScrollReveal>

          <div className="relative border-l border-gray-200 dark:border-slate-800 ml-4 space-y-12">
            {educationExperience.map((item, index) => (
              <ExperienceEntry
                key={`edu-${item.company}-${item.title}-${item.period}`}
                item={item}
                projects={projectsFor(item)}
                accent="accent"
                delay={index * 0.08}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
