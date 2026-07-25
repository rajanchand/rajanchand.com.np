"use client";

import { blogPosts as defaultBlogPosts } from "@/lib/data";
import { SectionHeader } from "@/components/ui/section-header";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

const gradients = [
  "from-[#6d28d9] to-[#06b6d4]",
  "from-[#06b6d4] to-[#10b981]",
  "from-[#a855f7] to-[#ec4899]",
];

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIdx = parseInt(month, 10) - 1;
  const formattedMonth = months[monthIdx] || month;
  return `${formattedMonth} ${parseInt(day, 10)}, ${year}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Articles({ blogPosts: customBlogPosts }: { blogPosts?: any[] } = {}) {
  const blogPosts = customBlogPosts || defaultBlogPosts;
  return (
    <section id="articles" className="relative z-10 py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            label="Blog"
            title="Featured Articles"
            description="Insights, tutorials, and thoughts on networking, technology, and my academic journey."
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, i) => (
            <ScrollReveal key={post.slug} delay={i * 0.12}>
              <Link href={`/blog/${post.slug}`} className="block h-full">
              <article className="group glass rounded-2xl overflow-hidden hover:-translate-y-2 hover:border-[var(--accent)]/30 hover:shadow-[0_20px_50px_var(--glow-accent)] transition-all duration-500 h-full flex flex-col">
                {/* Gradient header */}
                <div className={`relative h-44 bg-gradient-to-br ${gradients[i % gradients.length]} overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-transparent to-transparent opacity-60" />
                  <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[10px] font-semibold tracking-wider uppercase text-[var(--accent)]">
                    {post.category}
                  </span>

                  {/* Abstract pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id={`dots-${i}`} width="20" height="20" patternUnits="userSpaceOnUse">
                          <circle cx="2" cy="2" r="1" fill="white" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#dots-${i})`} />
                    </svg>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] mb-3">
                    <span>{formatDate(post.date)}</span>
                    <span className="w-1 h-1 rounded-full bg-[var(--muted-foreground)]" />
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="text-base font-bold font-[family-name:var(--font-outfit)] text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-[var(--accent)] transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed flex-1 mb-4">
                    {post.excerpt}
                  </p>

                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--primary)] group-hover:gap-3 transition-all duration-300 mt-auto">
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </article>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
