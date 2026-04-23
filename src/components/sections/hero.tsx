"use client";

import React, { useState, useEffect } from "react";
import { siteConfig } from "@/lib/data";
import { Mail, ArrowRight } from "lucide-react";

// Typing animation to match the React Typing widget in ssg-personal-blog
function TypingAnimation({ text }: { text: string }) {
  const [typedText, setTypedText] = useState("");
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setTypedText(text.substring(0, currentTextIndex + 1));
      setCurrentTextIndex((currentIndex) =>
        currentIndex === text.length - 1 ? 0 : currentIndex + 1
      );
    }, 150); // Natural 150ms typing speed for high-end feel

    return () => clearTimeout(timerId);
  }, [currentTextIndex, text]);

  return (
    <span className="relative inline-block min-h-[40px]">
      <span>Hi I&apos;m, {typedText}</span>
      <span className="inline-block w-1.5 h-7 ml-1 bg-gray-400 dark:bg-zinc-500 animate-pulse align-middle" />
    </span>
  );
}

export function Hero() {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12">
          {/* Left Column — Picture (Moves to top on mobile) */}
          <div className="w-full lg:w-1/3 flex justify-center lg:justify-start">
            <div className="relative max-w-[220px] sm:max-w-[240px]">
              <img
                src={siteConfig.profileImage || "/images/profile.jpg"}
                className="rounded-full w-48 h-48 sm:w-56 sm:h-56 border-8 border-slate-100 dark:border-zinc-800 shadow-inner bg-gradient-to-r from-slate-100 to-white dark:from-gray-900 dark:to-zinc-900 object-cover"
                alt="Rajan Prakash Chand"
                loading="eager"
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
                As a network engineer and researcher, I am driven by my curiosity and desire to push the boundaries of what is possible
                with network architecture. With over five years of experience working in the industry, I have gained a deep
                understanding of infrastructure design, scalability, and security protocols, as well as expertise in various system
                configurations and cloud technologies.
                <br />
                <br />
                Throughout my career, I have worked on a variety of network deployments that have challenged me to think creatively and
                develop redundant, high-uptime solutions for large-scale operations. What sets me apart as a network engineer is my passion
                for using technology to improve user experiences and ensure secure, seamless connectivity across large infrastructures.
                <br />
                <br />
                I believe that diversity and deep technical research are essential to creating truly innovative solutions, and I am committed
                to bringing my unique operational background and research-driven perspective to every project I work on.
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
                  href={`mailto:${siteConfig.email}`}
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
