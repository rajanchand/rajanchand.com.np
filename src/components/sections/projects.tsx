"use client";

import { useState } from "react";
import { projects as defaultProjects } from "@/lib/data";
import { getIcon } from "@/lib/icons";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { FolderGit2, Building2, Github, ExternalLink, Tag, Filter } from "lucide-react";
import Image from "next/image";

// Helper to parse and sanitize tags into clean individual badge items
function parseTags(tags?: unknown): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.flatMap((t) => {
      if (typeof t === "string") {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Projects({ projects: customProjects }: { projects?: any[] } = {}) {
  const projects = customProjects || defaultProjects;
  const [activeFilter, setActiveFilter] = useState("All");

  // Extract unique categories
  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))];

  const filteredProjects = activeFilter === "All"
    ? projects
    : projects.filter((p) => p.category === activeFilter);

  return (
    <section className="relative scroll-mt-16 py-10 md:py-12 bg-[var(--background)] section-pattern" id="projects">
      {/* Background shape */}
      <div className="absolute inset-0 bg-[var(--primary)]/5 dark:bg-zinc-950/20 pointer-events-none" aria-hidden="true" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 z-10">
        <div>
          {/* Header */}
          <ScrollReveal>
            <div className="mb-10 text-center select-none">
              <span className="inline-flex items-center justify-center gap-4 text-xs font-bold tracking-[0.25em] uppercase text-[var(--primary)] mb-4 font-mono">
                <span className="w-8 h-[1.5px] bg-[var(--primary)]/30 rounded-full" />
                PORTFOLIO
                <span className="w-8 h-[1.5px] bg-[var(--primary)]/30 rounded-full" />
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-5 font-[var(--font-display)] leading-tight">
                Featured Projects &{" "}
                <span className="relative inline-block pb-1">
                  Implementations
                  <span className="absolute bottom-0 left-0 w-full h-[3.5px] bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-full" />
                </span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-[15px] max-w-2xl mx-auto leading-relaxed">
                Enterprise deployments, proof-of-concepts, and network optimizations developed across major telecommunication operators and academic research.
              </p>
            </div>
          </ScrollReveal>

          {/* Category Filter Pills */}
          {categories.length > 2 && (
            <ScrollReveal delay={0.05}>
              <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                <Filter className="w-3.5 h-3.5 text-[var(--muted-foreground)] mr-1" />
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 cursor-pointer ${
                      activeFilter === cat
                        ? "bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white border-transparent shadow-[0_0_15px_var(--glow-primary)]"
                        : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-[var(--primary)] hover:border-[var(--primary)]/30"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </ScrollReveal>
          )}

          {/* Cards Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch mt-6">
            {filteredProjects.map((proj, i) => {
              const Icon = getIcon(proj.icon || "FolderGit2") || FolderGit2;
              const formattedTags = parseTags(proj.tags);
              return (
                <ScrollReveal key={proj.title} delay={i * 0.1}>
                  <div className="group relative flex flex-col justify-between h-full bg-white dark:bg-slate-900/60 rounded-[24px] border border-slate-100 dark:border-slate-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.015)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 hover:shadow-[0_15px_45px_rgba(59,130,246,0.08)] dark:hover:shadow-[0_15px_45px_rgba(59,130,246,0.15)] transition-all duration-500 ease-out cursor-default overflow-hidden">
                    
                    {/* Project Screenshot */}
                    {proj.image && (
                      <div className="relative w-full aspect-[16/9] overflow-hidden">
                        <Image
                          src={proj.image}
                          alt={proj.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900/90 via-transparent to-transparent opacity-70" />
                        {proj.category && (
                          <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full text-[10px] font-semibold tracking-wider uppercase text-white">
                            {proj.category}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Top Content */}
                    <div className="p-6">
                      {/* Organization / Company Badge */}
                      {proj.company && (
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] md:text-xs font-bold rounded-lg border border-[var(--primary)]/20 font-mono uppercase tracking-wide">
                            <Building2 className="w-3 h-3" />
                            {proj.company}
                          </span>
                        </div>
                      )}

                      {/* Header Title & Icon */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col pt-1">
                          <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug font-[var(--font-display)]">
                            {proj.title}
                          </h4>
                          
                          {/* Role tag */}
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />
                            {proj.role}
                          </span>
                        </div>
                      </div>

                      {/* Project Short Description */}
                      <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed text-justify mt-3.5">
                        {proj.description}
                      </p>

                      {/* Impact Metric KPIs list */}
                      {proj.impact && proj.impact.length > 0 && (
                        <div className="mt-4 space-y-2 border-t border-slate-50 dark:border-slate-800/60 pt-4">
                          {proj.impact.map((metric: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 text-[11px] md:text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                              <span>{metric}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Content (Tags & optional Link Buttons) */}
                    <div className="px-6 pb-6">
                      {/* Tech Stack Badges */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formattedTags.map((tag: string, idx: number) => (
                          <span
                            key={`${tag}-${idx}`}
                            className="px-2.5 py-1 text-[10px] md:text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-900/55 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800/80"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Action Links Buttons */}
                      {(proj.githubUrl || proj.websiteUrl) && (
                        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/60">
                          {proj.githubUrl && (
                            <a
                              href={proj.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                            >
                              <Github className="w-3.5 h-3.5" />
                              <span>Code</span>
                            </a>
                          )}
                          {proj.websiteUrl && (
                            <a
                              href={proj.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Live Site</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
