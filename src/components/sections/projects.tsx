"use client";

import { projects } from "@/lib/data";
import { getIcon } from "@/lib/icons";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { FolderGit2 } from "lucide-react";

export function Projects() {
  return (
    <section className="relative scroll-mt-16 py-16" id="projects">
      {/* Background shape */}
      <div className="absolute inset-0 bg-blue-50/40 dark:bg-zinc-900/50 pointer-events-none mb-32" aria-hidden="true" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 z-10">
        <div className="py-4 pt-8 sm:py-6 lg:py-8 lg:pt-12">
          {/* Header */}
          <ScrollReveal>
            <div className="mb-8 text-center">
              <p className="text-base text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase">
                Projects
              </p>
              <h2 className="text-4xl md:text-4xl font-extrabold leading-tighter tracking-tighter mb-4 font-[family-name:var(--font-inter)] text-gray-900 dark:text-gray-100">
                Take a look into these cool softwares !
              </h2>
              <p className="max-w-3xl mx-auto text-center text-xl text-gray-600 dark:text-slate-400">
                Web, Mobile and Desktop applications
              </p>
            </div>
          </ScrollReveal>

          {/* Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start my-12 text-gray-900 dark:text-white">
            {projects.map((proj, i) => {
              const Icon = getIcon(proj.icon || "FolderGit2") || FolderGit2;
              return (
                <ScrollReveal key={proj.title} delay={i * 0.1}>
                  <div className="relative flex flex-col p-6 bg-white dark:bg-zinc-900 rounded shadow-xl hover:shadow-lg transition border border-gray-100 dark:border-slate-800/80 h-[280px]">
                    <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-zinc-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="ml-4 text-lg font-bold line-clamp-1">{proj.title}</div>
                      </div>
                    </a>
                    
                    <p className="text-gray-500 dark:text-gray-400 text-sm flex-1 leading-relaxed overflow-y-auto pr-1 text-justify custom-scrollbar">
                      {proj.description}
                    </p>
                    
                    <ul className="list-none flex flex-wrap gap-2 text-gray-500 dark:text-gray-400 text-xs mt-4">
                      {proj.tags?.map((tag) => (
                        <li key={tag} className="bg-gray-200 dark:bg-slate-700 px-2 py-0.5 rounded text-gray-700 dark:text-slate-300 font-medium">
                          {tag}
                        </li>
                      ))}
                    </ul>
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
