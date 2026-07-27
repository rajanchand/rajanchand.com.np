import type { Metadata } from "next";
import { dissertions, loadPortfolioData } from "@/lib/data";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BackgroundOrbs } from "@/components/background-orbs";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { BreadcrumbJsonLd } from "@/components/json-ld";
import { ScrollToTop } from "@/components/scroll-to-top";
import { 
  ArrowLeft, 
  ExternalLink, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  User, 
  Globe,
  GitBranch
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Research & Publications",
  description:
    "Academic thesis, research papers, and technical dissertations by Rajan Prakash Chand — bridging network engineering with Zero Trust security and IT research.",
  alternates: {
    canonical: "/dissertions",
  },
  openGraph: {
    title: "Research & Publications — Rajan Prakash Chand",
    description:
      "Explore academic research papers on Zero Trust security, network engineering, and ISP infrastructure.",
    url: "/dissertions",
    type: "website",
  },
};

interface DissertionItem {
  title?: string;
  description?: string;
  type?: string;
  published?: string;
  url?: string;
  websiteUrl?: string;
  githubUrl?: string;
  author?: string;
  institution?: string;
  year?: string;
  abstract?: string;
  pdfUrl?: string;
}

export default async function DissertionsListing() {
  const data = await loadPortfolioData();
  const rawList = (data?.dissertations || dissertions) as DissertionItem[];

  // Hide unfinished CMS drafts / accidental placeholders from the public page
  const dataList = (rawList || [])
    .filter((item) => {
      const title = (item.title || "").trim();
      const abstract = (item.abstract || item.description || "").trim();
      if (!title || title === "Thesis Title") return false;
      if (!abstract || abstract === "Abstract...") return false;
      return true;
    })
    .map((item) => ({
      title: item.title || "Untitled Research Paper",
      author: item.author || "Rajan Prakash Chand",
      institution: item.institution || item.type || "Academic Research",
      year: item.year || item.published || "2026",
      abstract: item.abstract || item.description || "No abstract description provided.",
      pdfUrl: item.pdfUrl || item.url || "",
      websiteUrl: item.websiteUrl || "",
      githubUrl: item.githubUrl || "",
    }));

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 selection:bg-[var(--primary)]/30 relative overflow-hidden transition-colors duration-300">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Dissertations", url: "/dissertions" },
        ]}
      />
      <BackgroundOrbs />
      <Navbar siteConfig={data?.siteConfig} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 md:pb-28">
        <ScrollReveal>
          <div className="mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:text-[var(--accent)] transition-colors group mb-6"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Home
            </Link>
          </div>
          <SectionHeader
            label="Research & Publications"
            title="Academic & Professional Papers"
            description="Explore my academic thesis, research papers, and technical dissertations bridging network infrastructure engineering with security protocols."
            center={false}
          />
        </ScrollReveal>

        {/* Papers list */}
        <div className="space-y-8 mt-10">
          {dataList.length === 0 ? (
            <ScrollReveal>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
                <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold">No publications found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Check back later or add new dissertations via the admin dashboard console.
                </p>
              </div>
            </ScrollReveal>
          ) : (
            dataList.map((doc, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:border-[var(--primary)]/30 transition-all duration-300 rounded-3xl p-6 md:p-8 relative overflow-hidden backdrop-blur-md">
                  <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[var(--primary)]/5 rounded-full blur-[80px] pointer-events-none" />

                  <div className="space-y-5">
                    {/* Header: Title and top metadata */}
                    <div className="space-y-3">
                      <h2 className="text-xl md:text-2xl font-bold font-[family-name:var(--font-outfit)] tracking-tight text-slate-900 dark:text-white leading-snug">
                        {doc.title}
                      </h2>

                      {/* Meta Tags Row */}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/50 pb-4">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                          <span><span className="font-semibold text-slate-700 dark:text-slate-300">Author:</span> {doc.author}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                          <span><span className="font-semibold text-slate-700 dark:text-slate-300">Institution:</span> {doc.institution}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                          <span><span className="font-semibold text-slate-700 dark:text-slate-300">Year:</span> {doc.year}</span>
                        </div>
                      </div>
                    </div>

                    {/* Abstract block */}
                    <div className="bg-slate-50 dark:bg-slate-950/40 border-l-4 border-[var(--primary)] p-5 rounded-r-2xl">
                      <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                        Abstract / Executive Summary
                      </h3>
                      <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                        {doc.abstract}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3 pt-2">
                      {doc.pdfUrl && doc.pdfUrl !== "#" && doc.pdfUrl !== "" && (
                        <a
                          href={doc.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary)]/90 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-150 cursor-pointer"
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
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150 cursor-pointer"
                        >
                          <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                          Website
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {doc.githubUrl && doc.githubUrl !== "" && (
                        <a
                          href={doc.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150 cursor-pointer"
                        >
                          <GitBranch className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                          GitHub
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))
          )}
        </div>
      </div>

      <Footer siteConfig={data?.siteConfig} socialLinks={data?.socialLinks} />
      <ScrollToTop />
    </main>
  );
}
