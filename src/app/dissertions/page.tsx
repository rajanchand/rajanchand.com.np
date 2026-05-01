"use client";

import { dissertions, updatePortfolioData } from "@/lib/data";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BackgroundOrbs } from "@/components/background-orbs";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface DissertionItem {
  title: string;
  description: string;
  type: string;
  published: string;
  url: string;
  websiteUrl?: string;
  githubUrl?: string;
}

export default function DissertionsListing() {
  const [dataList, setDataList] = useState<DissertionItem[]>(dissertions as DissertionItem[]);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.dissertions) {
          setDataList(data.dissertions);
          updatePortfolioData(data);
        }
      })
      .catch((err) => console.error("Error syncing dissertions:", err));
  }, []);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)]/30 relative overflow-hidden">
      <BackgroundOrbs />
      <Navbar />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 md:pb-28">
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
            label="Research & Publications"
            title="Academic and Professional Papers"
            description="A list of my academic project reports, research papers, and industrial publications bridging the gap between networking theory and practice."
            center={false}
          />
        </ScrollReveal>

        {/* Papers list */}
        <div className="space-y-8 mt-12">
          {dataList.map((doc, i) => (
            <ScrollReveal key={i} delay={i * 0.12}>
              <div className="glass rounded-3xl p-6 md:p-8 relative overflow-hidden hover:border-[var(--primary)]/25 hover:shadow-[0_8px_40px_var(--glow-primary)] transition-all duration-500 group">
                <div className="absolute -top-1/2 -right-1/4 w-[250px] h-[250px] bg-[var(--primary)] rounded-full opacity-[0.03] blur-[80px] pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                        {doc.type}
                      </span>
                      <span className="text-xs text-[var(--muted-foreground)] font-mono">
                        Published: {doc.published}
                      </span>
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold font-[family-name:var(--font-outfit)] text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                      {doc.title}
                    </h2>

                    <p className="text-sm md:text-base text-[var(--muted-foreground)] leading-relaxed">
                      {doc.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3.5 self-start shrink-0">
                    {doc.url && doc.url !== "#" && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:shadow-[0_0_20px_var(--glow-primary)] text-white rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer"
                      >
                        View Document
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {doc.websiteUrl && doc.websiteUrl !== "" && (
                      <a
                        href={doc.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 glass rounded-xl text-xs font-semibold hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/10 transition-all duration-300 cursor-pointer"
                      >
                        Website
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {doc.githubUrl && doc.githubUrl !== "" && (
                      <a
                        href={doc.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 glass rounded-xl text-xs font-semibold hover:border-[#333]/30 dark:hover:border-white/20 hover:bg-black/10 dark:hover:bg-white/5 transition-all duration-300 cursor-pointer"
                      >
                        GitHub
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
