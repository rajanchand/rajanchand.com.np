"use client";

import { certifications } from "@/lib/data";
import { SectionHeader } from "@/components/ui/section-header";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Award, Eye, X } from "lucide-react";
import { useState } from "react";

export function Certifications() {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  return (
    <section className="relative z-10 py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            label="Credentials"
            title="Certifications"
            description="Professional certifications validating my expertise across networking, security, and DevOps."
          />
        </ScrollReveal>

        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto mt-8">
          {certifications.map((cert: any, i: number) => {
            const hasPhoto = !!cert.photo;
            return (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div
                  onClick={() => hasPhoto && setSelectedPhoto(cert.photo)}
                  className={`glass rounded-2xl px-6 py-5 flex items-center gap-4 transition-all duration-500 border border-gray-100 dark:border-zinc-800 ${
                    hasPhoto
                      ? "hover:-translate-y-1 hover:border-blue-600/30 hover:shadow-lg cursor-pointer group"
                      : ""
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-500 dark:bg-blue-600 flex items-center justify-center shrink-0 relative overflow-hidden text-white group-hover:scale-105 transition-transform duration-300">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                      {cert.title}
                      {hasPhoto && (
                        <Eye className="w-3.5 h-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{cert.issuer}</p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>

      {/* Modern Lightbox Modal for certificate view */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative max-w-4xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            <button
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
