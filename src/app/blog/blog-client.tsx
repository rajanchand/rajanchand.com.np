"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, ArrowRight, Search } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionHeader } from "@/components/ui/section-header";

interface BlogPostItem {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  content?: string;
}

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

export function BlogClient({ initialPosts }: { initialPosts: BlogPostItem[] }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(initialPosts.map((post) => post.category)))];
  }, [initialPosts]);

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [initialPosts, selectedCategory, searchQuery]);

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 md:pb-28">
      <ScrollReveal>
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:underline mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
        <SectionHeader
          label="Insights & Articles"
          title="Academic Research & Tech Blog"
          description="My thoughts and publications on network engineering, cybersecurity, and information technology systems."
          center={false}
        />
      </ScrollReveal>

      {/* Filter and Search Controls */}
      <ScrollReveal delay={0.1}>
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center mb-12 -mt-4">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white border-transparent shadow-[0_0_12px_var(--glow-primary)]"
                    : "bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--primary)]/30"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
        </div>
      </ScrollReveal>

      {/* Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl">
          <p className="text-base font-medium text-[var(--muted-foreground)]">
            No articles found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, i) => (
            <ScrollReveal key={post.slug} delay={Math.min(i * 0.05, 0.3)} className="content-visibility-auto">
              <Link href={`/blog/${post.slug}`} className="group block h-full">
                <article className="glass rounded-2xl overflow-hidden h-full flex flex-col hover:border-[var(--primary)]/40 hover:shadow-lg transition-all duration-300 transform-gpu">
                  {/* Decorative Header */}
                  <div className="h-32 bg-gradient-to-br from-[var(--primary)]/20 via-[var(--accent)]/10 to-transparent relative group-hover:from-[var(--primary)]/30 group-hover:via-[var(--accent)]/20 transition-all duration-300 flex items-end p-6 border-b border-[var(--glass-border)]">
                    <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                      {post.category}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)] mb-3">
                        <time dateTime={post.date}>{formatDate(post.date)}</time>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readTime}
                        </span>
                      </div>

                      <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)] text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors line-clamp-2 mb-3">
                        {post.title}
                      </h2>

                      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed line-clamp-3 mb-6">
                        {post.excerpt}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] group-hover:text-[var(--accent)] transition-colors self-start">
                      Read Article
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </article>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}

