"use client";

import { siteConfig as defaultSiteConfig } from "@/lib/data";
import { ArrowDown, CheckCircle2, FileText, Linkedin, MapPin, MessageCircle } from "lucide-react";
import Image from "next/image";

const WHATSAPP_NUMBER = "447570731478";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Hero({ siteConfig: customSiteConfig }: { siteConfig?: any } = {}) {
  const siteConfig = customSiteConfig || defaultSiteConfig;
  const linkedInUrl =
    siteConfig.linkedin ||
    "https://www.linkedin.com/in/rajanprakashchand/";
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber || WHATSAPP_NUMBER}`;

  return (
    <section id="home" className="relative z-10 overflow-hidden pt-28 pb-12 sm:pt-32 md:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass relative overflow-hidden rounded-[2rem] px-5 py-9 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-9 sm:py-12 lg:px-14">
          <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[var(--primary)]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[var(--accent)]/10 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
            <div className="surface-enter order-2 text-center lg:order-1 lg:text-left">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Open to network engineering opportunities
              </div>

              <h1 className="text-balance text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl font-[family-name:var(--font-outfit)]">
                Hi, I&apos;m <span className="gradient-text">{siteConfig.name}</span>
              </h1>
              <h2 className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-200 sm:text-xl">
                Network Engineer &amp; MSc IT Researcher
              </h2>

              <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base lg:mx-0">
                I design and operate resilient ISP infrastructure serving 500,000+ users, with
                hands-on expertise in routing, switching, wireless systems, and Zero Trust
                security research.
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400 lg:justify-start">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[var(--primary)]" /> 5+ years in production networks
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-[var(--primary)]" /> {siteConfig.location}
                </span>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
                <a
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--glow-primary)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_28px_var(--glow-primary)]"
                  href={siteConfig.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="mr-2 h-4 w-4" /> View CV
                </a>
                <a
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5"
                  href={linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="mr-2 h-4 w-4" /> LinkedIn
                </a>
                <a
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400 transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:bg-emerald-500/15"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                </a>
                <a
                  className="inline-flex min-h-12 items-center justify-center gap-2 px-3 py-3 text-sm font-semibold text-[var(--primary)] transition-colors hover:text-[var(--accent)]"
                  href="#experience"
                >
                  Explore my work <ArrowDown className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="surface-enter order-1 flex justify-center lg:order-2">
              <div className="relative h-56 w-56 sm:h-64 sm:w-64 lg:h-72 lg:w-72">
                <div className="absolute -inset-3 rounded-[2.2rem] bg-gradient-to-br from-[var(--primary)]/25 to-[var(--accent)]/10 blur-sm" />
                <div className="absolute -inset-1 rounded-[2rem] border border-white/50 bg-[var(--glass-bg)] shadow-2xl dark:border-white/10" />
                <Image
                  src={siteConfig.profileImage || "/images/profile.jpg"}
                  className="rounded-[1.8rem] object-cover"
                  alt="Rajan Prakash Chand — Network Engineer & MSc IT Researcher"
                  fill
                  sizes="(max-width: 640px) 224px, 288px"
                  priority
                />
                <div className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-xl border border-[var(--glass-border)] bg-[var(--card)]/95 px-4 py-2.5 text-xs font-bold shadow-xl backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Reliable systems, practical outcomes
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
