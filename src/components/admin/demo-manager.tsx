"use client";

import { ExternalLink, FileText, Github, Globe, Plus, Trash2 } from "lucide-react";

export interface DemoWebsiteItem {
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

interface DemoManagerProps {
  demos?: DemoWebsiteItem[];
  onUpdateDemos: (demos: DemoWebsiteItem[]) => void;
}

function tagsToInput(tags: DemoWebsiteItem["tags"]): string {
  if (Array.isArray(tags)) return tags.join(", ");
  return typeof tags === "string" ? tags : "";
}

function parseTags(value: string): string[] {
  return Array.from(
    new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))
  );
}

function safeHttpUrl(value?: string): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function DemoManager({ demos = [], onUpdateDemos }: DemoManagerProps) {
  const updateDemo = (index: number, patch: Partial<DemoWebsiteItem>) => {
    const updated = demos.map((demo, i) => (i === index ? { ...demo, ...patch } : demo));
    onUpdateDemos(updated);
  };

  const addDemo = () => {
    onUpdateDemos([
      {
        title: "",
        summary: "",
        about: "",
        websiteUrl: "",
        githubUrl: "",
        docUrl: "",
        docs: "",
        tags: [],
        status: "live",
      },
      ...demos,
    ]);
  };

  const deleteDemo = (index: number) => {
    if (!window.confirm("Delete this demo website? This cannot be undone.")) return;
    onUpdateDemos(demos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--glass-border)] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20 border border-[var(--primary)]/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display">Demo Websites</h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              Publish live demos with GitHub, docs, summary, and about details
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg text-[10px] font-mono font-bold text-[var(--muted-foreground)]">
            {demos.length} demo{demos.length === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={addDemo}
            className="px-4 py-2 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-shadow hover:shadow-[0_0_20px_var(--glow-primary)]"
          >
            <Plus className="w-3.5 h-3.5" /> Add Demo
          </button>
        </div>
      </div>

      {demos.length === 0 && (
        <div className="p-12 border-2 border-dashed border-[var(--glass-border)] rounded-2xl text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 border border-[var(--primary)]/20 flex items-center justify-center">
            <Globe className="w-8 h-8 text-[var(--primary)]/50" />
          </div>
          <p className="text-sm font-semibold text-[var(--muted-foreground)]">No demo websites yet</p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Click &quot;Add Demo&quot; to publish a live site with GitHub and documentation links.
          </p>
        </div>
      )}

      <div className="space-y-5">
        {demos.map((demo, idx) => {
          const websiteLink = safeHttpUrl(demo.websiteUrl);
          const githubLink = safeHttpUrl(demo.githubUrl);
          const docLink = safeHttpUrl(demo.docUrl);
          const tagsVal = tagsToInput(demo.tags);

          return (
            <div
              key={idx}
              className="border border-[var(--glass-border)] bg-[var(--glass-bg)]/10 rounded-2xl overflow-hidden hover:border-[var(--primary)]/20 transition-colors"
            >
              <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--accent)]/5 border-b border-[var(--glass-border)]">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[10px] font-mono font-bold bg-[var(--glass-bg)] px-2 py-0.5 rounded border border-[var(--glass-border)] text-[var(--muted-foreground)]">
                    #{idx + 1}
                  </span>
                  <h4 className="text-sm font-bold truncate">{demo.title || "Untitled demo"}</h4>
                  {demo.status && (
                    <span className="hidden sm:inline-flex px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold uppercase rounded-full">
                      {demo.status}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {websiteLink && (
                    <a
                      href={websiteLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open live demo for ${demo.title || "website"}`}
                      className="p-1.5 border border-[var(--glass-border)] hover:border-[var(--primary)]/30 text-[var(--muted-foreground)] hover:text-[var(--primary)] rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    type="button"
                    aria-label={`Delete ${demo.title || `demo ${idx + 1}`}`}
                    onClick={() => deleteDemo(idx)}
                    className="p-1.5 border border-[var(--glass-border)] hover:border-rose-500/20 text-[var(--muted-foreground)] hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor={`demo-title-${idx}`} className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">
                      Title
                    </label>
                    <input
                      id={`demo-title-${idx}`}
                      type="text"
                      value={demo.title || ""}
                      onChange={(e) => updateDemo(idx, { title: e.target.value })}
                      placeholder="e.g., Zero Trust Security Demo"
                      className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs font-semibold focus:outline-none focus-visible:border-[var(--primary)]/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor={`demo-status-${idx}`} className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">
                      Status
                    </label>
                    <select
                      id={`demo-status-${idx}`}
                      value={demo.status || "live"}
                      onChange={(e) => updateDemo(idx, { status: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs focus:outline-none focus-visible:border-[var(--primary)]/50 cursor-pointer"
                    >
                      <option value="live">Live</option>
                      <option value="prototype">Prototype</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`demo-summary-${idx}`} className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">
                    Summary
                  </label>
                  <input
                    id={`demo-summary-${idx}`}
                    type="text"
                    value={demo.summary || ""}
                    onChange={(e) => updateDemo(idx, { summary: e.target.value })}
                    placeholder="One-line summary shown on cards"
                    className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs focus:outline-none focus-visible:border-[var(--primary)]/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`demo-about-${idx}`} className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">
                    About
                  </label>
                  <textarea
                    id={`demo-about-${idx}`}
                    rows={3}
                    value={demo.about || ""}
                    onChange={(e) => updateDemo(idx, { about: e.target.value })}
                    placeholder="Longer description of what the demo shows and why it matters"
                    className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs focus:outline-none focus-visible:border-[var(--primary)]/50 resize-y leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor={`demo-website-${idx}`} className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Live website URL
                    </label>
                    <input
                      id={`demo-website-${idx}`}
                      type="url"
                      value={demo.websiteUrl || ""}
                      onChange={(e) => updateDemo(idx, { websiteUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs focus:outline-none focus-visible:border-[var(--primary)]/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor={`demo-github-${idx}`} className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                      <Github className="w-3 h-3" /> GitHub link
                    </label>
                    <input
                      id={`demo-github-${idx}`}
                      type="url"
                      value={demo.githubUrl || ""}
                      onChange={(e) => updateDemo(idx, { githubUrl: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs focus:outline-none focus-visible:border-[var(--primary)]/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor={`demo-docurl-${idx}`} className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Docs URL
                    </label>
                    <input
                      id={`demo-docurl-${idx}`}
                      type="url"
                      value={demo.docUrl || ""}
                      onChange={(e) => updateDemo(idx, { docUrl: e.target.value })}
                      placeholder="README, Notion, or PDF link"
                      className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs focus:outline-none focus-visible:border-[var(--primary)]/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`demo-tags-${idx}`} className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">
                    Tags (comma-separated)
                  </label>
                  <input
                    id={`demo-tags-${idx}`}
                    type="text"
                    value={tagsVal}
                    onChange={(e) => updateDemo(idx, { tags: e.target.value })}
                    onBlur={(e) => updateDemo(idx, { tags: parseTags(e.target.value) })}
                    placeholder="e.g., Security, Zero Trust, Next.js"
                    className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs focus:outline-none focus-visible:border-[var(--primary)]/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`demo-docs-${idx}`} className="text-[9px] uppercase font-bold text-[var(--muted-foreground)]">
                    Documentation (Markdown supported)
                  </label>
                  <textarea
                    id={`demo-docs-${idx}`}
                    rows={6}
                    value={demo.docs || ""}
                    onChange={(e) => updateDemo(idx, { docs: e.target.value })}
                    placeholder={"## Setup\n1. Clone the repo\n2. Install dependencies\n3. Run the demo"}
                    className="w-full px-4 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs font-mono focus:outline-none focus-visible:border-[var(--primary)]/50 resize-y leading-relaxed"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {websiteLink && (
                    <a href={websiteLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--glass-border)] text-[10px] font-semibold text-[var(--primary)]">
                      <Globe className="w-3 h-3" /> Live site
                    </a>
                  )}
                  {githubLink && (
                    <a href={githubLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--glass-border)] text-[10px] font-semibold text-[var(--primary)]">
                      <Github className="w-3 h-3" /> GitHub
                    </a>
                  )}
                  {docLink && (
                    <a href={docLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--glass-border)] text-[10px] font-semibold text-[var(--primary)]">
                      <FileText className="w-3 h-3" /> Docs link
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
