"use client";

import { stats } from "@/lib/data";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function Stats() {
  return (
    <section className="px-4 py-8 md:py-16 sm:px-6 mx-auto md:px-24 lg:px-8 lg:py-20 max-w-7xl z-10 relative">
      <ScrollReveal>
        <div className="grid grid-cols-2 row-gap-8 md:grid-cols-4 text-center">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`mb-10 md:mb-0 ${
                i !== stats.length - 1 ? "md:border-r border-gray-200 dark:border-zinc-700" : ""
              }`}
            >
              <div className="text-4xl font-extrabold lg:text-4xl xl:text-6xl text-blue-600 dark:text-blue-400 font-[family-name:var(--font-inter)]">
                {stat.value || ""}{stat.suffix}
              </div>
              <p className="text-xs font-bold tracking-widest text-gray-800 dark:text-slate-400 uppercase lg:text-sm mt-2">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
