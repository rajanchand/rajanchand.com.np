"use client";

import { experience } from "@/lib/data";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ArrowDown, Check } from "lucide-react";

export function Experience() {
  return (
    <section id="experience" className="px-4 py-16 sm:px-6 mx-auto lg:px-8 lg:py-20 max-w-5xl z-10 relative">
      <div className="grid gap-6 row-gap-10 md:grid-cols-1">
        <div className="md:pb-6">
          {/* Timeline Title */}
          <ScrollReveal>
            <h2 className="mb-12 text-3xl lg:text-4xl font-extrabold font-[family-name:var(--font-inter)] tracking-tight text-gray-900 dark:text-gray-100">
              Professional Work Experience Highlights
            </h2>
          </ScrollReveal>

          {/* Timeline Container */}
          <div className="pl-2 md:pl-10">
            {experience.map((item: any, i: number) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="flex">
                  {/* Left Column — Line & Arrow */}
                  <div className="flex flex-col items-center mr-6">
                    <div>
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-blue-600 dark:border-blue-400 border-2">
                        <ArrowDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    {/* Line */}
                    <div className="w-px h-full bg-gray-300 dark:bg-zinc-700 min-h-[40px]" />
                  </div>

                  {/* Right Column — Job Details */}
                  <div className="pt-1 pb-10">
                    <p className="mb-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 font-mono">
                      {item.period}
                    </p>
                    <p className="mb-1 text-xl font-bold text-gray-900 dark:text-gray-100">
                      {item.title}
                    </p>
                    <a
                      href={item.companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mb-3 text-base font-semibold text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {item.company}
                    </a>
                    <p className="text-sm text-gray-600 dark:text-slate-400 text-justify leading-relaxed max-w-3xl mb-4">
                      {item.description}
                    </p>

                    {item.bullets && (
                      <ul className="space-y-1.5 mb-4 list-disc pl-5">
                        {item.bullets.map((bullet: string, j: number) => (
                          <li key={j} className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed text-justify">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2">
                      {item.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}

            {/* Final Timeline Element (Today) */}
            <ScrollReveal delay={experience.length * 0.1}>
              <div className="flex">
                <div className="flex flex-col items-center mr-6">
                  <div>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-blue-600 dark:border-blue-400 border-2 bg-blue-600 dark:bg-blue-700">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                <div className="pt-1">
                  <p className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">Today</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
