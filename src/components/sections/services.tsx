"use client";

import { services } from "@/lib/data";
import { getIcon } from "@/lib/icons";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function Services() {
  // Split expertise items into 2 columns like in Expertise.astro
  const column1 = services.slice(0, 2);
  const column2 = services.slice(2, 4);

  return (
    <section id="services" className="scroll-mt-16 py-16 md:py-20 z-10">
      <div className="px-4 py-16 mx-auto max-w-7xl lg:px-8 lg:py-20">
        {/* Section Header */}
        <ScrollReveal>
          <div className="mb-10 md:mx-auto sm:text-center md:mb-12 max-w-3xl">
            <p className="text-base text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase">
              Technical Knowledge
            </p>
            <h2 className="text-4xl md:text-4xl font-extrabold leading-tighter tracking-tighter mb-4 font-[family-name:var(--font-inter)] text-gray-900 dark:text-gray-100">
              <span className="whitespace-nowrap">View my Expertise</span>
            </h2>
          </div>
        </ScrollReveal>

        {/* Expertise Grid */}
        <div className="grid mx-auto space-y-6 md:grid-cols-2 md:space-y-0 pt-6">
          {/* Column 1 */}
          <ScrollReveal delay={0.1} className="space-y-8 sm:px-8">
            {column1.map((service) => {
              const Icon = getIcon(service.icon);
              return (
                <div key={service.title} className="flex flex-row max-w-md">
                  <div className="mb-4 mr-4 shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 dark:bg-blue-600 text-white">
                      {Icon && <Icon className="w-6 h-6" />}
                    </div>
                  </div>
                  <div className="min-h-[100px]">
                    <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </ScrollReveal>

          {/* Column 2 */}
          <ScrollReveal delay={0.2} className="space-y-8 sm:px-8">
            {column2.map((service) => {
              const Icon = getIcon(service.icon);
              return (
                <div key={service.title} className="flex flex-row max-w-md">
                  <div className="mb-4 mr-4 shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 dark:bg-blue-600 text-white">
                      {Icon && <Icon className="w-6 h-6" />}
                    </div>
                  </div>
                  <div className="min-h-[100px]">
                    <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
