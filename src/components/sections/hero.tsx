"use client";

import { useState, useEffect } from "react";
import { siteConfig as defaultSiteConfig } from "@/lib/data";
import { Mail, FileText } from "lucide-react";
import Image from "next/image";

// Typing animation featuring a natural type-pause-delete-loop cycle
function TypingAnimation({ text }: { text: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const speed = isDeleting ? 75 : 150; // faster deletion than typing

    if (!isDeleting && index === text.length) {
      // Pause at full text
      const pauseTimer = setTimeout(() => {
        setIsDeleting(true);
      }, 2500); // 2.5 seconds read pause
      return () => clearTimeout(pauseTimer);
    }

    if (isDeleting && index === 0) {
      // Pause before typing again
      const pauseTimer = setTimeout(() => {
        setIsDeleting(false);
      }, 500);
      return () => clearTimeout(pauseTimer);
    }

    const timer = setTimeout(() => {
      setIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, speed);

    return () => clearTimeout(timer);
  }, [index, isDeleting, text]);

  const typedText = text.substring(0, index);

  return (
    <span className="relative inline-block min-h-[44px]">
      <span>Hi, I&apos;m {typedText}</span>
      <span className="inline-block w-1 h-7 ml-1 bg-[var(--primary)] animate-pulse align-middle" />
    </span>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Hero({ siteConfig: customSiteConfig }: { siteConfig?: any } = {}) {
  const siteConfig = customSiteConfig || defaultSiteConfig;
  return (
    <section id="home" className="relative pt-24 pb-8 md:pt-32 md:pb-12 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12">
          {/* Left Column — Picture (Moves to top on mobile) */}
          <div className="w-full lg:w-1/3 flex justify-center lg:justify-start">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56">
              <Image
                src={siteConfig.profileImage || "/images/profile.jpg"}
                className="rounded-full border-8 border-slate-100 dark:border-zinc-800 shadow-inner bg-gradient-to-r from-slate-100 to-white dark:from-gray-900 dark:to-zinc-900 object-cover"
                alt="Rajan Prakash Chand — Network Engineer & MSc IT Researcher"
                fill
                sizes="(max-width: 640px) 192px, 224px"
                priority
              />
            </div>
          </div>

          {/* Right Column — Intro Text */}
          <div className="w-full lg:w-2/3 text-left">
            <h1 className="mb-2 text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 font-[family-name:var(--font-inter)] tracking-tight">
              <TypingAnimation text={`${siteConfig.name}!`} />
            </h1>
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--primary)] mb-4">
              Network Engineer & MSc IT Researcher
            </h2>

            <div className="space-y-6">
              <p className="text-base text-gray-600 dark:text-slate-400 text-justify leading-relaxed">
                Network Engineer with 5+ years building and operating large-scale ISP infrastructure at WorldLink Communications and Dish Media — supporting 500,000+ users across redundant LAN/WAN, routing, switching, and wireless systems. Currently completing MSc IT at the University of the West of Scotland, with research focused on Zero Trust Security architecture and risk-based authentication in enterprise environments.
              </p>

              {/* Action Buttons to match subashcs layout */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 sm:justify-start">
                <a
                  className="inline-flex items-center justify-center rounded-md shadow-md bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:shadow-[0_0_25px_var(--glow-primary)] text-white font-semibold text-center text-sm py-3 px-6 hover:scale-105 transition-all duration-200 cursor-pointer w-full sm:w-auto"
                  href={siteConfig.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="w-4 h-4 mr-2" /> Download CV
                </a>
                <a
                  className="inline-flex items-center justify-center rounded-md shadow-md border-gray-400 dark:border-slate-500 border bg-transparent font-medium text-center text-sm text-gray-700 dark:text-slate-300 py-3 px-6 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:border-gray-600 dark:hover:border-slate-800 transition duration-200 cursor-pointer w-full sm:w-auto hover:scale-105"
                  href={`mailto:${siteConfig.email}`}
                >
                  <Mail className="w-4 h-4 mr-2" /> Message
                </a>
                <a
                  className="inline-flex items-center justify-center rounded-md shadow-md border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold text-center text-sm text-slate-700 dark:text-slate-200 py-3 px-6 hover:-translate-y-0.5 transition duration-200 cursor-pointer w-full sm:w-auto"
                  href="#projects"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Learn more
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
