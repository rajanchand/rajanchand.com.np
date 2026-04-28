"use client";

import { blogPosts, updatePortfolioData } from "@/lib/data";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BackgroundOrbs } from "@/components/background-orbs";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { ArrowLeft, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

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

export default function BlogListing() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [postsList, setPostsList] = useState<BlogPostItem[]>(blogPosts as BlogPostItem[]);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.blogPosts) {
          setPostsList(data.blogPosts);
          updatePortfolioData(data);
        }
      })
      .catch((err) => console.error("Error syncing blog posts:", err));
  }, []);

  const categories = ["All", ...Array.from(new Set(postsList.map((post) => post.category)))];

  const filteredPosts =
    selectedCategory === "All"
      ? postsList
      : postsList.filter((post) => post.category === selectedCategory);


  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)]/30 relative overflow-hidden">
      <BackgroundOrbs />
      <Navbar />

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

        {/* Categories */}
        <ScrollReveal delay={0.1}>
          <div className="flex flex-wrap gap-2 mb-12 -mt-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-300 cursor-pointer ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white border-transparent shadow-[0_0_15px_var(--glow-primary)]"
                    : "bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--primary)]/20"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, i) => (
            <ScrollReveal key={post.slug} delay={i * 0.1}>
              <Link href={`/blog/${post.slug}`} className="group block h-full">
                <article className="glass rounded-2xl overflow-hidden h-full flex flex-col hover:border-[var(--primary)]/25 hover:shadow-[0_8px_40px_var(--glow-primary)] transition-all duration-500">
                  {/* Decorative Header */}
                  <div className="h-32 bg-gradient-to-br from-[var(--primary)]/20 via-[var(--accent)]/10 to-transparent relative group-hover:from-[var(--primary)]/30 group-hover:via-[var(--accent)]/20 transition-all duration-500 flex items-end p-6 border-b border-[var(--glass-border)]">
                    <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                      {post.category}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)] mb-3">
                        <time>{formatDate(post.date)}</time>
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
      </div>

      <Footer />
    </main>
  );
}
