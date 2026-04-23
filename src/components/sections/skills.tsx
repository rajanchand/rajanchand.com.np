"use client";

import { skills } from "@/lib/data";
import { getIcon } from "@/lib/icons";
import { SectionHeader } from "@/components/ui/section-header";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function Skills() {
  return (
    <section id="skills" className="relative z-10 py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            label="Tech Stack"
            title="Skills & Technologies"
            description="My toolkit of technologies, platforms, and tools I use to build and manage reliable infrastructure."
          />
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {skills.map((skill, i) => {
            const Icon = getIcon(skill.icon);
            return (
              <ScrollReveal key={skill.name} delay={i * 0.05}>
                <div className="group glass rounded-xl p-5 flex flex-col items-center gap-3 hover:-translate-y-2 hover:border-[var(--primary)]/30 hover:shadow-[0_10px_30px_var(--glow-primary)] transition-all duration-500 cursor-default">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {Icon && <Icon className="w-5 h-5 text-white" />}
                  </div>
                  <span className="text-xs font-semibold text-center text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">
                    {skill.name}
                  </span>
                  <span className="text-[10px] text-[var(--accent)] font-medium">{skill.category}</span>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
