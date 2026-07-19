"use client";

import { experience as defaultExperience } from "@/lib/data";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ArrowUp } from "lucide-react";

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

// Helper to parse starting and ending years from a period string (e.g. "2013-2015", "Current")
function parsePeriodYears(period: string): { start: number; end: number } {
  const normalized = (period || "").trim().toUpperCase();
  
  if (normalized === "CURRENT" || normalized === "PRESENT") {
    // Standalone ongoing periods sort last (most recent)
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

// Helper to parse and sanitize tags into clean individual badge items
function parseTags(tags?: any): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.flatMap((t) => {
      if (typeof t === "string") {
        // Split concatenated strings by comma, or camelCase boundaries if concatenated
        return t
          .replace(/([a-z])([A-Z])/g, "$1, $2")
          .split(/,|\n/)
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return String(t);
    });
  }
  if (typeof tags === "string") {
    return tags
      .replace(/([a-z])([A-Z])/g, "$1, $2")
      .split(/,|\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

// Compare function for sorting items in descending chronological order (newest to oldest)
const sortDescending = (a: ExperienceItem, b: ExperienceItem) => {
  const aYears = parsePeriodYears(a.period);
  const bYears = parsePeriodYears(b.period);
  
  if (aYears.start !== bYears.start) {
    return bYears.start - aYears.start;
  }
  return bYears.end - aYears.end;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Experience({ experience: customExperience }: { experience?: any[] } = {}) {
  const experience = customExperience || defaultExperience;
  // Separate work and education items dynamically with type casting and sort them in descending order (newest first)
  const typedExperience = experience as ExperienceItem[];
  const workExperience = typedExperience
    .filter((item) => item.type === "work")
    .sort(sortDescending);
  const educationExperience = typedExperience
    .filter((item) => item.type === "education")
    .sort(sortDescending);

  return (
    <section id="experience" className="px-4 pt-6 pb-10 sm:px-6 mx-auto lg:px-8 lg:pt-8 lg:pb-12 max-w-7xl z-10 relative bg-[var(--background)]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <ScrollReveal>
          <div className="text-center mb-16 select-none">
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
              A comprehensive overview of my professional trajectory in network operations and my academic path in information technology.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 mt-12">
          {/* Column 1 — Work Experience */}
          <div className="space-y-8">
            <ScrollReveal>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 mb-8 font-[var(--font-display)] border-b border-gray-200 dark:border-slate-800/80 pb-3">
                <span className="w-1.5 h-6 bg-[var(--primary)] rounded-full" />
                Professional Work Experience
              </h3>
            </ScrollReveal>

            <div className="relative border-l border-gray-200 dark:border-slate-800 ml-4 space-y-10">
              {workExperience.map((item, i) => (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <div className="relative pl-8">
                    {/* Circle Indicator Centered on Line */}
                    <div className="absolute left-0 -translate-x-1/2 top-1.5 flex items-center justify-center w-9 h-9 rounded-full border-[var(--primary)] border-2 bg-white dark:bg-slate-950 shadow-sm shrink-0 hover:scale-105 transition-transform duration-300">
                      <ArrowUp className="w-4 h-4 text-[var(--primary)]" />
                    </div>

                    <div>
                      {/* Period Label */}
                      <span className="inline-block px-3 py-1 mb-2.5 text-[10px] font-bold tracking-wider text-[var(--primary)] bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-lg font-mono uppercase">
                        {item.period}
                      </span>
                      
                      {/* Job Title */}
                      <h4 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 font-[var(--font-display)] leading-snug">
                        {item.title}
                      </h4>
                      
                      {/* Company Name */}
                      {item.companyUrl ? (
                        <a
                          href={item.companyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-[var(--primary)] transition-colors"
                        >
                          {item.company}
                        </a>
                      ) : (
                        <span className="inline-block mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                          {item.company}
                        </span>
                      )}

                      {/* Description */}
                      <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mb-4 text-justify">
                        {item.description}
                      </p>

                      {/* Bullet highlights */}
                      {item.bullets && item.bullets.length > 0 && (
                        <ul className="space-y-2 mb-4 pl-4 text-slate-500 dark:text-slate-400">
                          {item.bullets.map((bullet, j) => (
                            <li key={j} className="text-xs md:text-sm flex gap-2 leading-relaxed text-justify items-start">
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]/80 shrink-0 mt-2" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Badges/Tags */}
                      {parseTags(item.tags).length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {parseTags(item.tags).map((tag, idx) => (
                            <span
                              key={`${tag}-${idx}`}
                              className="px-2.5 py-1 text-[10px] md:text-xs font-semibold rounded bg-slate-50 dark:bg-slate-900/55 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800/80"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Column 2 — Education Details */}
          <div className="space-y-8">
            <ScrollReveal>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 mb-8 font-[var(--font-display)] border-b border-gray-100 dark:border-slate-800/80 pb-3">
                <span className="w-1.5 h-6 bg-[var(--accent)] rounded-full" />
                Academic & Education Details
              </h3>
            </ScrollReveal>

            <div className="relative border-l border-gray-200 dark:border-slate-800 ml-4 space-y-10">
              {educationExperience.map((item, i) => (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <div className="relative pl-8">
                    {/* Circle Indicator Centered on Line */}
                    <div className="absolute left-0 -translate-x-1/2 top-1.5 flex items-center justify-center w-9 h-9 rounded-full border-[var(--accent)] border-2 bg-white dark:bg-slate-950 shadow-sm shrink-0 hover:scale-105 transition-transform duration-300">
                      <ArrowUp className="w-4 h-4 text-[var(--accent)]" />
                    </div>

                    <div>
                      {/* Period Label */}
                      <span className="inline-block px-3 py-1 mb-2.5 text-[10px] font-bold tracking-wider text-[var(--accent)] bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-lg font-mono uppercase">
                        {item.period}
                      </span>
                      
                      {/* Course/Degree Title */}
                      <h4 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 font-[var(--font-display)] leading-snug">
                        {item.title}
                      </h4>
                      
                      {/* Institution Name */}
                      {item.companyUrl ? (
                        <a
                          href={item.companyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-[var(--accent)] transition-colors"
                        >
                          {item.company}
                        </a>
                      ) : (
                        <span className="inline-block mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                          {item.company}
                        </span>
                      )}
                      
                      {/* Description */}
                      <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mb-4 text-justify">
                        {item.description}
                      </p>

                      {/* Bullet highlights */}
                      {item.bullets && item.bullets.length > 0 && (
                        <ul className="space-y-2 mb-4 pl-4 text-slate-500 dark:text-slate-400">
                          {item.bullets.map((bullet, j) => (
                            <li key={j} className="text-xs md:text-sm flex gap-2 leading-relaxed text-justify items-start">
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/80 shrink-0 mt-2" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Badges/Tags */}
                      {parseTags(item.tags).length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {parseTags(item.tags).map((tag, idx) => (
                            <span
                              key={`${tag}-${idx}`}
                              className="px-2.5 py-1 text-[10px] md:text-xs font-semibold rounded bg-slate-50 dark:bg-slate-900/55 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800/80"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
