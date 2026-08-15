import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  GitBranch,
  Globe,
  LayoutTemplate,
} from "lucide-react";
import { demos as defaultDemos, loadPortfolioData } from "@/lib/data";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BackgroundOrbs } from "@/components/background-orbs";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { BreadcrumbJsonLd } from "@/components/json-ld";
import { ScrollToTop } from "@/components/scroll-to-top";

export const metadata: Metadata = {
  title: "Demo Websites",
  description:
    "Live demo websites by Rajan Prakash Chand — explore interactive projects with source code, documentation, and summaries.",
  alternates: {
    canonical: "/demos",
  },
  openGraph: {
    title: "Demo Websites — Rajan Prakash Chand",
    description:
      "Browse interactive demo websites with GitHub repositories, documentation, and project summaries.",
    url: "/demos",
    type: "website",
  },
};

interface DemoItem {
  title?: string;
  summary?: string;
  about?: string;
  websiteUrl?: string;
  githubUrl?: string;
  docUrl?: string;
  docs?: string;
  tags?: string[] | string;
  status?: string;
}

function parseTags(tags: DemoItem["tags"]): string[] {
  if (Array.isArray(tags)) return tags.map((tag) => String(tag).trim()).filter(Boolean);
  if (typeof tags === "string") {
    return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  }
  return [];
}

function renderDocs(markdown: string) {
  return markdown
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line, index, lines) => !(line === "" && lines[index - 1] === ""))
    .map((line, index) => {
      if (line.startsWith("### ")) {
        return (
          <h4 key={index} className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-4 mb-1">
            {line.slice(4)}
          </h4>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h3 key={index} className="text-base font-bold text-slate-900 dark:text-white mt-5 mb-2">
            {line.slice(3)}
          </h3>
        );
      }
      if (line.startsWith("# ")) {
        return (
          <h2 key={index} className="text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2">
            {line.slice(2)}
          </h2>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <p key={index} className="text-sm text-slate-600 dark:text-slate-300 pl-1 leading-relaxed">
            {line}
          </p>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <p key={index} className="text-sm text-slate-600 dark:text-slate-300 pl-1 leading-relaxed">
            • {line.slice(2)}
          </p>
        );
      }
      if (!line) return <div key={index} className="h-2" />;
      return (
        <p key={index} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {line}
        </p>
      );
    });
}

export default async function DemosPage() {
  const data = await loadPortfolioData();
  const rawList = ((data?.demos || defaultDemos) as DemoItem[]) || [];

  const demos = rawList
    .filter((item) => {
      const title = (item.title || "").trim();
      if (!title) return false;
      return Boolean(
        (item.summary || "").trim() ||
          (item.about || "").trim() ||
          (item.websiteUrl || "").trim() ||
          (item.githubUrl || "").trim()
      );
    })
    .map((item) => ({
      title: item.title!.trim(),
      summary: (item.summary || "").trim(),
      about: (item.about || "").trim(),
      websiteUrl: (item.websiteUrl || "").trim(),
      githubUrl: (item.githubUrl || "").trim(),
      docUrl: (item.docUrl || "").trim(),
      docs: (item.docs || "").trim(),
      tags: parseTags(item.tags),
      status: (item.status || "live").trim(),
    }));

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)]/30 relative overflow-hidden">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Demo Websites", url: "/demos" },
        ]}
      />
      <BackgroundOrbs />
      <Navbar siteConfig={data?.siteConfig} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16 md:pb-24">
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
            label="Interactive Demos"
            title="Demo Websites"
            description="Live projects you can open, inspect, and reuse — each with source code, documentation, and a clear project summary."
            center={false}
          />
        </ScrollReveal>

        <div className="space-y-8 mt-10">
          {demos.length === 0 ? (
            <ScrollReveal>
              <div className="glass rounded-3xl p-8 sm:p-12 text-center">
                <LayoutTemplate className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold">No demos published yet</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Add demo websites from the admin console to showcase live work here.
                </p>
              </div>
            </ScrollReveal>
          ) : (
            demos.map((demo, i) => (
              <ScrollReveal key={`${demo.title}-${i}`} delay={i * 0.08}>
                <article className="glass shadow-sm hover:shadow-md hover:border-[var(--primary)]/30 transition-[box-shadow,border-color,transform] duration-300 rounded-3xl p-5 sm:p-6 md:p-8 relative overflow-hidden hover:-translate-y-0.5">
                  <div className="absolute top-0 right-0 w-[280px] h-[280px] bg-[var(--primary)]/5 rounded-full blur-[80px] pointer-events-none" />

                  <div className="space-y-5 relative">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                          {demo.status}
                        </span>
                        {demo.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <h2 className="text-xl md:text-2xl font-bold font-[family-name:var(--font-outfit)] tracking-tight text-slate-900 dark:text-white leading-snug">
                        {demo.title}
                      </h2>

                      {demo.summary && (
                        <p className="text-sm md:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                          {demo.summary}
                        </p>
                      )}
                    </div>

                    {demo.about && (
                      <div className="bg-slate-50 dark:bg-slate-950/40 border-l-4 border-[var(--primary)] p-5 rounded-r-2xl">
                        <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                          About
                        </h3>
                        <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                          {demo.about}
                        </p>
                      </div>
                    )}

                    {demo.docs && (
                      <details className="group rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)]/40 open:bg-[var(--glass-bg)]/70 transition-colors">
                        <summary className="cursor-pointer list-none flex items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                          <span className="inline-flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[var(--primary)]" />
                            Documentation
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 group-open:hidden">
                            Expand
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 hidden group-open:inline">
                            Collapse
                          </span>
                        </summary>
                        <div className="px-4 pb-4 border-t border-[var(--glass-border)] pt-3 space-y-1">
                          {renderDocs(demo.docs)}
                        </div>
                      </details>
                    )}

                    <div className="flex flex-wrap gap-3 pt-1">
                      {demo.websiteUrl && (
                        <a
                          href={demo.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary)]/90 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-150"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          Open demo
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {demo.githubUrl && (
                        <a
                          href={demo.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 px-5 py-2.5 border border-[var(--glass-border)] bg-[var(--glass-bg)] rounded-xl text-xs font-semibold hover:border-[var(--primary)]/30 transition-colors"
                        >
                          <GitBranch className="w-3.5 h-3.5" />
                          GitHub
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {demo.docUrl && (
                        <a
                          href={demo.docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 px-5 py-2.5 border border-[var(--glass-border)] bg-[var(--glass-bg)] rounded-xl text-xs font-semibold hover:border-[var(--primary)]/30 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Docs
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
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
