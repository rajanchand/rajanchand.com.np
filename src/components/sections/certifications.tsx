"use client";

import { certifications as defaultCertifications } from "@/lib/data";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Award, Eye, X } from "lucide-react";
import { useState, useEffect } from "react";

interface CertificationItem {
  title: string;
  issuer: string;
  photo?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Certifications({ certifications: customCertifications }: { certifications?: any[] } = {}) {
  const certifications = customCertifications || defaultCertifications;
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const typedCertifications = certifications as CertificationItem[];

  // Lock body scroll and handle Escape key when lightbox is open
  useEffect(() => {
    if (!selectedPhoto) return;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedPhoto(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [selectedPhoto]);

  return (
    <section className={`relative pt-6 pb-10 md:pt-8 md:pb-12 bg-[var(--background)] section-pattern ${selectedPhoto ? 'z-[60]' : 'z-10'}`} id="certifications">
      {/* Background shape */}
      <div className="absolute inset-0 bg-[var(--primary)]/5 dark:bg-zinc-950/10 pointer-events-none mb-32" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <ScrollReveal>
          <div className="mb-16 text-center select-none">
            <span className="inline-flex items-center justify-center gap-4 text-xs font-bold tracking-[0.25em] uppercase text-[var(--primary)] mb-4 font-mono">
              <span className="w-8 h-[1.5px] bg-[var(--primary)]/30 rounded-full" />
              CREDENTIALS
              <span className="w-8 h-[1.5px] bg-[var(--primary)]/30 rounded-full" />
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-5 font-[var(--font-display)] leading-tight">
              Certifications &{" "}
              <span className="relative inline-block pb-1">
                Credentials
                <span className="absolute bottom-0 left-0 w-full h-[3.5px] bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-full" />
              </span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-[15px] max-w-2xl mx-auto leading-relaxed">
              Professional credentials validating my core expertise across modern network architectures, routing protocols, and systems engineering.
            </p>
          </div>
        </ScrollReveal>

        {/* Clean Aligned Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12">
          {typedCertifications.map((cert, i) => {
            const hasPhoto = !!cert.photo;
            return (
              <ScrollReveal key={i} delay={i * 0.05}>
                <button
                  type="button"
                  onClick={() => hasPhoto && setSelectedPhoto(cert.photo ?? null)}
                  className={`group relative flex items-center gap-4 p-5 rounded-[20px] bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.015)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:border-[var(--primary)]/30 hover:shadow-[0_15px_35px_rgba(59,130,246,0.04)] dark:hover:shadow-[0_15px_35px_rgba(59,130,246,0.1)] transition-all duration-300 ease-out select-none w-full text-left ${
                    hasPhoto ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  {/* Subtle Verify Badge on Hover */}
                  {hasPhoto && (
                    <span className="absolute top-3.5 right-3.5 text-[9px] font-bold text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1 font-mono tracking-wide uppercase">
                      <Eye className="w-3.5 h-3.5" />
                      Verify
                    </span>
                  )}

                  {/* Elegant Glassy Icon Squircle */}
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                    <Award className="w-5 h-5" />
                  </div>

                  {/* Info Label Block */}
                  <div className="flex-1 min-w-0 pr-6">
                    <h4 className="text-sm md:text-[15px] font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-snug font-[var(--font-display)] truncate">
                      {cert.title}
                    </h4>
                    <p className="text-[11px] md:text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5 truncate">
                      {cert.issuer}
                    </p>
                  </div>
                </button>
              </ScrollReveal>
            );
          })}
        </div>
      </div>

      {/* Modern Lightbox Modal for certificate view */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close certificate"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedPhoto}
              alt="Certificate Credential"
              className="max-w-full max-h-[80vh] object-contain rounded-lg p-2"
            />
          </div>
        </div>
      )}
    </section>
  );
}
