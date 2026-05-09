"use client";

import React, { useState, useEffect } from "react";
import { siteConfig } from "@/lib/data";
import { Mail } from "lucide-react";
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
      <span className="inline-block w-1 h-7 ml-1 bg-blue-500 dark:bg-blue-400 animate-pulse align-middle" />
    </span>
  );
}

export function Hero() {
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
                alt="Rajan Prakash Chand"
                fill
                priority
              />
            </div>
          </div>

          {/* Right Column — Intro Text */}
          <div className="w-full lg:w-2/3 text-left">
            <h1 className="mb-4 text-2xl md:text-4xl sm:text-xl font-bold text-gray-900 dark:text-gray-100 font-[family-name:var(--font-inter)] tracking-tight">
              <TypingAnimation text={`${siteConfig.name}!`} />
            </h1>

            <div className="space-y-6">
              <p className="text-base text-gray-600 dark:text-slate-400 text-justify leading-relaxed">
                Highly motivated Network and IT Support Engineer with over 4 years of hands-on experience supporting ISP and enterprise networks, specializing in LAN/WAN, routing, switching, firewalls, VPNs, and wireless infrastructure. Promoted from L1 Technical Support to Technical Supervisor at WorldLink Communications, leading outdoor network operations, vendor escalations, and incident response. Proven ability to reduce Mean Time to Detect (MTTD) and Mean Time to Resolve (MTTR), produce clear technical documentation, and effectively communicate with technical and non-technical stakeholders. Currently pursuing an MSc in Information Technology, with hands-on research in Zero Trust Security adoption, including a prototype implementing risk-based authentication and device fingerprinting.
                <br />
                <br />
                <span className="text-sm font-medium text-gray-500 dark:text-slate-500">
                  Feel free to read and share. 🙂 <em>Enjoy 📖 !</em>
                </span>
              </p>

              {/* Action Buttons to match subashcs layout */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 sm:justify-start">
                <a
                  className="inline-flex items-center justify-center rounded-md shadow-md border-gray-400 dark:border-slate-500 border bg-transparent font-medium text-center text-sm text-gray-700 dark:text-slate-300 py-3 px-6 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:border-gray-600 dark:hover:border-slate-800 transition duration-200 cursor-pointer w-full sm:w-auto"
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${siteConfig.email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Mail className="w-4 h-4 mr-2" /> Message
                </a>
                <a
                  className="inline-flex items-center justify-center rounded-md shadow-md bg-blue-600 dark:bg-blue-700 text-white font-medium text-center text-sm py-3 px-6 hover:bg-blue-700 dark:hover:bg-blue-800 transition duration-200 cursor-pointer w-full sm:w-auto"
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
