"use client";

import { useState, useEffect, useRef } from "react";
import { skills as defaultSkills } from "@/lib/data";
import { getIcon } from "@/lib/icons";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

interface SkillItem {
  name: string;
  category: string;
  icon: string;
}

const categoryConfigs: Record<string, {
  title: string;
  description: string;
  cardIcon: string;
  color: "blue" | "purple" | "green" | "orange";
  skillCount: number;
  themeClasses: {
    cardBg: string;
    cardBorder: string;
    iconBg: string;
    iconText: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    shadowHover: string;
    barColor: string;
  };
}> = {
  "Network Engineering": {
    title: "Network Engineering",
    description: "Core networking expertise across design, redundancy, and optimization",
    cardIcon: "Network",
    color: "blue",
    skillCount: 5,
    themeClasses: {
      cardBg: "bg-white dark:bg-slate-900/60",
      cardBorder: "border-slate-100 dark:border-slate-800/80 hover:border-blue-200/80 dark:hover:border-blue-900/50",
      iconBg: "bg-blue-500",
      iconText: "text-white",
      badgeBg: "bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/60 dark:hover:bg-blue-950/40",
      badgeBorder: "border-blue-100 dark:border-blue-900/40",
      badgeText: "text-blue-600 dark:text-blue-400",
      shadowHover: "hover:shadow-[0_15px_45px_rgba(59,130,246,0.08)] dark:hover:shadow-[0_15px_45px_rgba(59,130,246,0.15)]",
      barColor: "from-blue-500 to-blue-400",
    }
  },
  "Monitoring & Tools": {
    title: "Monitoring & Tools",
    description: "Proficient in industry-standard monitoring and analytics platforms",
    cardIcon: "Server",
    color: "purple",
    skillCount: 5,
    themeClasses: {
      cardBg: "bg-white dark:bg-slate-900/60",
      cardBorder: "border-slate-100 dark:border-slate-800/80 hover:border-purple-200/80 dark:hover:border-purple-900/50",
      iconBg: "bg-[#7c3aed]",
      iconText: "text-white",
      badgeBg: "bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100/60 dark:hover:bg-purple-950/40",
      badgeBorder: "border-purple-100 dark:border-purple-900/40",
      badgeText: "text-purple-600 dark:text-purple-400",
      shadowHover: "hover:shadow-[0_15px_45px_rgba(124,58,237,0.08)] dark:hover:shadow-[0_15px_45px_rgba(124,58,237,0.15)]",
      barColor: "from-purple-500 to-purple-400",
    }
  },
  "Technical Leadership": {
    title: "Technical Leadership",
    description: "Leading teams, managing projects, and driving continuous improvement",
    cardIcon: "Users",
    color: "green",
    skillCount: 5,
    themeClasses: {
      cardBg: "bg-white dark:bg-slate-900/60",
      cardBorder: "border-slate-100 dark:border-slate-800/80 hover:border-emerald-200/80 dark:hover:border-emerald-900/50",
      iconBg: "bg-[#10b981]",
      iconText: "text-white",
      badgeBg: "bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40",
      badgeBorder: "border-emerald-100 dark:border-emerald-900/40",
      badgeText: "text-emerald-600 dark:text-emerald-400",
      shadowHover: "hover:shadow-[0_15px_45px_rgba(16,185,129,0.08)] dark:hover:shadow-[0_15px_45px_rgba(16,185,129,0.15)]",
      barColor: "from-emerald-500 to-emerald-400",
    }
  },
  "Customer Support": {
    title: "Customer Support",
    description: "Enterprise-grade support delivery with focus on quality and SLA compliance",
    cardIcon: "Headphones",
    color: "orange",
    skillCount: 5,
    themeClasses: {
      cardBg: "bg-white dark:bg-slate-900/60",
      cardBorder: "border-slate-100 dark:border-slate-800/80 hover:border-orange-200/80 dark:hover:border-orange-900/50",
      iconBg: "bg-[#f97316]",
      iconText: "text-white",
      badgeBg: "bg-orange-50/50 dark:bg-orange-950/20 hover:bg-orange-100/60 dark:hover:bg-orange-950/40",
      badgeBorder: "border-orange-100 dark:border-orange-900/40",
      badgeText: "text-orange-600 dark:text-orange-400",
      shadowHover: "hover:shadow-[0_15px_45px_rgba(249,115,22,0.08)] dark:hover:shadow-[0_15px_45px_rgba(249,115,22,0.15)]",
      barColor: "from-orange-500 to-orange-400",
    }
  }
};

const defaultCategoryConfig = {
  title: "Other Expertise",
  description: "Additional technical capabilities and specialized solutions",
  cardIcon: "Settings",
  color: "blue" as const,
  skillCount: 5,
  themeClasses: {
    cardBg: "bg-white dark:bg-slate-900/60",
    cardBorder: "border-slate-100 dark:border-slate-800/80 hover:border-blue-200/80 dark:hover:border-blue-900/50",
    iconBg: "bg-blue-500",
    iconText: "text-white",
    badgeBg: "bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/60 dark:hover:bg-blue-950/40",
    badgeBorder: "border-blue-100 dark:border-blue-900/40",
    badgeText: "text-blue-600 dark:text-blue-400",
    shadowHover: "hover:shadow-[0_15px_45px_rgba(59,130,246,0.08)] dark:hover:shadow-[0_15px_45px_rgba(59,130,246,0.15)]",
    barColor: "from-blue-500 to-blue-400",
  }
};

// Animated progress bar that fills when visible
function AnimatedBar({ width, barColor, delay }: { width: number; barColor: string; delay: number }) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setAnimated(true), delay * 100);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800/60 overflow-hidden mt-2">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-1000 ease-out`}
        style={{ width: animated ? `${width}%` : "0%" }}
      />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Skills({ skills: customSkills }: { skills?: any[] } = {}) {
  const skills = customSkills || defaultSkills;
  // Group skills dynamically
  const groupedSkills: Record<string, SkillItem[]> = {};
  skills.forEach((skill) => {
    if (!groupedSkills[skill.category]) {
      groupedSkills[skill.category] = [];
    }
    groupedSkills[skill.category].push(skill);
  });

  // Determine categories to render, making sure our core 4 categories are present and ordered first if they have data
  const orderedKeys = [
    "Network Engineering",
    "Monitoring & Tools",
    "Technical Leadership",
    "Customer Support"
  ];

  const activeCategories = [
    ...orderedKeys.filter((key) => groupedSkills[key] && groupedSkills[key].length > 0),
    ...Object.keys(groupedSkills).filter((key) => !orderedKeys.includes(key))
  ];

  return (
    <section id="skills" className="relative z-10 py-10 md:py-12 bg-[var(--background)] section-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-10 select-none">
            {/* EXPERTISE Centered with accent lines */}
            <span className="inline-flex items-center justify-center gap-4 text-xs font-bold tracking-[0.25em] uppercase text-blue-500 dark:text-blue-400 mb-4 font-mono">
              <span className="w-8 h-[1.5px] bg-blue-500/30 dark:bg-blue-400/30 rounded-full" />
              EXPERTISE
              <span className="w-8 h-[1.5px] bg-blue-500/30 dark:bg-blue-400/30 rounded-full" />
            </span>
            
            {/* Skills & Proficiencies header with stylized underline */}
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-5 font-[var(--font-display)] leading-tight">
              Skills &{" "}
              <span className="relative inline-block pb-1">
                Proficiencies
                <span className="absolute bottom-0 left-0 w-full h-[3.5px] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
              </span>
            </h2>
            
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-[15px] max-w-2xl mx-auto leading-relaxed">
              Discover the proficiencies that allow me to deliver reliable, scalable solutions across network engineering and IT leadership.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {activeCategories.map((category, i) => {
            const config = categoryConfigs[category] || {
              ...defaultCategoryConfig,
              title: category
            };
            const items = groupedSkills[category] || [];
            const CardIcon = getIcon(config.cardIcon);
            const classes = config.themeClasses;

            return (
              <ScrollReveal key={category} delay={i * 0.1}>
                <div className={`group flex flex-col justify-between h-full p-6 md:p-8 rounded-[24px] border ${classes.cardBg} ${classes.cardBorder} ${classes.shadowHover} transition-all duration-500 ease-out hover:-translate-y-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.015)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.1)]`}>
                  
                  {/* Card Content */}
                  <div>
                    {/* Header */}
                    <div className="flex gap-4 items-start mb-6">
                      <div className={`w-14 h-14 rounded-2xl ${classes.iconBg} ${classes.iconText} flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300`}>
                        {CardIcon && <CardIcon className="w-6 h-6" />}
                      </div>
                      <div className="flex flex-col pt-1 flex-1">
                        <h3 className="text-[17px] font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-snug font-[var(--font-display)]">
                          {config.title}
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 leading-normal mt-1">
                          {config.description}
                        </p>
                      </div>

                      {/* Skill count badge */}
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-full px-2.5 py-1 shrink-0">
                        {items.length} skills
                      </span>
                    </div>

                    {/* Badge Tags Container */}
                    <div className="flex flex-wrap gap-2.5">
                      {items.map((item) => {
                        const SkillIcon = getIcon(item.icon);
                        return (
                          <div
                            key={item.name}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border font-semibold text-[11px] md:text-xs tracking-wide transition-all duration-300 cursor-default select-none ${classes.badgeBg} ${classes.badgeBorder} ${classes.badgeText}`}
                          >
                            {SkillIcon && (
                              <span className="shrink-0 group-hover:rotate-6 transition-transform duration-300">
                                <SkillIcon className="w-3.5 h-3.5" />
                              </span>
                            )}
                            <span>{item.name}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Animated Proficiency Bar */}
                    <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/60">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Proficiency
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {items.length} / {config.skillCount + items.length} technologies
                        </span>
                      </div>
                      <AnimatedBar
                        width={Math.min(95, 60 + items.length * 7)}
                        barColor={classes.barColor}
                        delay={i}
                      />
                    </div>
                  </div>

                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
