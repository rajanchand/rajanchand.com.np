"use client";

import { certifications as defaultCertifications } from "@/lib/data";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Award, Eye, X, ExternalLink, Calendar, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";

interface CertificationItem {
  title?: string;
  name?: string;
  issuer: string;
  photo?: string;
  date?: string;
  credentialId?: string;
  url?: string;
  description?: string;
}

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
    <section className={`relative pt-16 pb-20 md:pt-24 md:pb-28 bg-[var(--background)] section-pattern ${selectedPhoto ? 'z-[60]' : 'z-10'}`} id="certifications">
      {/* Background radial gradient glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--primary)]/5 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[var(--accent)]/5 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />

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

        {/* Clean Aligned Grid of Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {typedCertifications.map((cert, i) => {
            const certTitle = cert.title || cert.name || "Certification Title";
            if (!certTitle.trim() && !cert.issuer.trim()) return null;

            const hasPhoto = !!cert.photo;
            return (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="group h-full flex flex-col justify-between rounded-[24px] bg-white/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.015)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 hover:border-[var(--primary)]/30 hover:shadow-[0_20px_40px_rgba(59,130,246,0.05)] dark:hover:shadow-[0_20px_40px_rgba(59,130,246,0.12)] transition-all duration-300 ease-out overflow-hidden relative backdrop-blur-md">
                  
                  {/* Photo Thumbnail Header (if present) */}
                  {hasPhoto ? (
                    <div className="h-48 relative overflow-hidden bg-slate-100 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800/60 cursor-zoom-in" onClick={() => setSelectedPhoto(cert.photo ?? null)}>
                      <img
                        src={cert.photo}
                        alt={`${certTitle} preview`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-white rounded-full text-xs font-bold shadow-md">
                          <Eye className="w-3.5 h-3.5" /> View Certificate
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-24 bg-gradient-to-tr from-[var(--primary)]/5 to-[var(--accent)]/5 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-center">
                      <Award className="w-8 h-8 text-[var(--primary)]/40" />
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      {/* Issuer & Date Row */}
                      <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--muted-foreground)]">
                        <span className="px-2.5 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full truncate max-w-[150px]">
                          {cert.issuer}
                        </span>
                        {cert.date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {cert.date}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-snug tracking-tight font-[var(--font-display)]">
                        {certTitle}
                      </h3>

                      {/* Description */}
                      {cert.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                          {cert.description}
                        </p>
                      )}

                      {/* Credential ID */}
                      {cert.credentialId && (
                        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 dark:text-slate-500 pt-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>ID: {cert.credentialId}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Verification Link (if present) */}
                    {cert.url && (
                      <div className="pt-2">
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] hover:text-[var(--accent)] transition-colors group/link"
                        >
                          Verify Credential
                          <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>

      {/* Modern Lightbox Modal for certificate view */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close certificate"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedPhoto}
              alt="Certificate Credential"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl p-2"
            />
          </div>
        </div>
      )}
    </section>
  );
}
