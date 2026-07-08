"use client";

import { testimonials } from "@/lib/data";
import { SectionHeader } from "@/components/ui/section-header";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Quote, ExternalLink } from "lucide-react";

export function Testimonials() {
  return (
    <section className="relative z-10 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            label="Testimonials"
            title="What People Say"
            description="Discover what colleagues and mentors have to say about their experiences working with me."
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <ScrollReveal key={i} delay={i * 0.15}>
              <div className="glass rounded-2xl p-7 hover:-translate-y-2 hover:border-[var(--primary)]/25 hover:shadow-[0_15px_40px_var(--glow-primary)] transition-all duration-500 h-full flex flex-col">
                <Quote className="w-8 h-8 text-[var(--primary)] opacity-40 mb-4" />
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed italic flex-1 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-auto">
                  {/* Avatar placeholder */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {(t.author || "?").split(" ").map((n: string) => n[0] || "").join("")}
                  </div>
                  <div className="min-w-0">
                    {t.linkedIn ? (
                      <a
                        href={t.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1"
                      >
                        {t.author}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-sm font-semibold">{t.author}</span>
                    )}
                    <p className="text-xs text-[var(--muted-foreground)] truncate">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
