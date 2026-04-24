"use client";

import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, Github, Rss } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { siteConfig } from "@/lib/data";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isBlog = pathname?.startsWith("/blog") || pathname?.startsWith("/dissertions") || pathname?.startsWith("/admin");

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 flex-none mx-auto w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-zinc-900/95 border-b border-gray-150 dark:border-zinc-800/80 shadow-md md:backdrop-blur-sm"
          : "bg-white md:bg-white/90 dark:bg-zinc-900 dark:md:bg-zinc-900/90 md:backdrop-blur-sm"
      }`}
      id="header"
    >
      <div className="pt-3 pb-3 px-3 mx-auto w-full md:flex md:justify-between max-w-7xl md:px-4 items-center">
        {/* Brand/Logo */}
        <div className="flex justify-between items-center">
          <Link className="flex items-center gap-2" href="/">
            {/* Custom SVG logo matching subashcs logo */}
            <svg
              version="1.1"
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              className="text-blue-500 dark:text-blue-400 shrink-0"
              viewBox="0 0 392.699 392.699"
              width="36"
              height="22"
              fill="currentColor"
            >
              <path style={{ fill: "#56ACE0" }} d="M293.707,131.592l-53.075,31.16c9.18,7.887,23.467,11.119,37.56,3.232 C290.475,158.808,296.293,144.844,293.707,131.592z" />
              <g>
                <path style={{ fill: "#FFC10D" }} d="M245.158,39.6c-0.065-0.065-0.065-0.129-0.129-0.259c-11.119-16.743-29.156-22.691-48.549-12.671 c-10.214,6.982-16.097,15.386-17.131,25.341l25.729-14.481c5.236-2.909,11.895-1.099,14.869,4.202 c2.909,5.236,1.099,11.895-4.202,14.869l-32.194,18.101c0.065,0.129,0.129,0.323,0.259,0.517c3.685,6.335,6.659,13.123,8.727,20.17 l10.02-5.495c5.301-2.844,11.895-0.905,14.739,4.396s0.905,11.895-4.396,14.739l-16.679,9.05c0,0.711,0.776,44.8,0.776,44.8 l117.915-69.172l-37.042-21.463C264.487,64.359,253.174,53.111,245.158,39.6z" />
                <path style={{ fill: "#FFC10D" }} d="M77.723,111.745c-6.012,0-10.925,4.848-10.925,10.925s4.848,10.925,10.925,10.925 c6.788,0,11.055-5.947,10.925-10.925C88.648,116.594,83.735,111.745,77.723,111.745z" />
                <path style={{ fill: "#FFC10D" }} d="M197.642,324.238c-3.62-6.853-10.796-11.636-19.135-11.636s-15.515,4.784-19.135,11.636 c6.206-0.517,12.606-0.84,19.135-0.84S191.436,323.721,197.642,324.238z" />
              </g>
              <path style={{ fill: "#56ACE0" }} d="M178.507,345.184c-40.663,0-73.18,12.024-85.01,25.665h170.02 C251.687,357.337,219.17,345.184,178.507,345.184z" />
              <path style={{ fill: "#194F82" }} d="M172.366,104.376c1.293,5.236,2.133,10.667,2.263,16.097l1.034,61.414 c-0.129,7.176,7.952,13.77,16.485,9.18l28.962-17.002c17.713,20.04,46.933,23.337,68.137,10.602 c21.398-12.671,32.582-39.176,24.048-64.646l28.962-17.002c7.24-4.461,7.24-14.481,0-18.877L289.117,53.24 c-10.408-6.012-19.071-14.739-25.212-25.083c-0.065-0.065-0.065-0.129-0.129-0.259C245.222-0.675,211.218-7.075,185.489,7.664 c-28.962,18.554-35.103,48.42-21.463,76.347l-60.121,18.877c-5.947-7.952-15.451-13.123-26.117-13.123 c-18.101,0-32.776,14.675-32.776,32.776s14.675,32.776,32.776,32.776c1.164,0,2.327-0.065,3.426-0.129L150.58,301.03 c-7.887,6.659-13.382,15.968-14.998,26.57c-41.05,8.404-68.719,28.962-68.719,54.174c0,6.012,4.848,10.925,10.925,10.925h201.438 c0.065,0,0.065,0,0.065,0c6.012,0,10.925-4.848,10.925-10.925c-0.646-17.455-10.667-28.897-26.57-38.529v-14.287 c0-6.012-4.848-10.925-10.925-10.925c-6.012,0-10.925,4.848-10.925,10.925v4.008c-6.335-2.133-13.123-4.073-20.299-5.56 c-3.232-20.816-21.269-36.848-42.99-36.848c-2.844,0-5.624,0.323-8.275,0.776l-69.301-145.778 c5.624-5.624,9.244-13.382,9.568-21.915L172.366,104.376z M278.192,165.984c-14.093,7.887-28.38,4.655-37.56-3.232l53.075-31.16 C296.293,144.844,290.475,158.808,278.192,165.984z M196.479,26.671c19.394-10.02,37.43-4.073,48.549,12.671 c0.065,0.065,0.065,0.129,0.129,0.259c7.952,13.511,19.329,24.824,32.905,32.711l37.042,21.463L197.19,162.945 c0,0-0.776-44.154-0.776-44.8l16.679-9.051c5.301-2.844,7.24-9.503,4.396-14.739c-2.844-5.236-9.503-7.24-14.739-4.396l-10.02,5.495 c-2.069-7.046-5.042-13.834-8.727-20.17c-0.065-0.129-0.129-0.323-0.259-0.517l32.194-18.101c5.236-2.909,7.111-9.568,4.202-14.804 c-2.909-5.236-9.568-7.111-14.869-4.202l-25.729,14.481C180.446,42.121,186.329,33.717,196.479,26.671z M263.517,370.913H93.497 c11.83-13.576,44.347-25.665,85.01-25.665S251.687,357.337,263.517,370.913z M178.507,312.602c8.339,0,15.515,4.784,19.135,11.636 c-6.206-0.517-12.606-0.84-19.135-0.84s-12.929,0.323-19.135,0.84C162.992,317.386,170.168,312.602,178.507,312.602z M77.723,133.596c-6.012,0-10.925-4.848-10.925-10.925c0-6.012,4.848-10.925,10.925-10.925s10.925,4.848,10.925,10.925 C88.778,127.648,84.511,133.596,77.723,133.596z" />
            </svg>
            <span className="self-center ml-1 text-lg font-bold text-gray-900 whitespace-nowrap dark:text-white font-[family-name:var(--font-inter)] tracking-tight">
              {siteConfig.name.split(" ")[0]}CS
            </span>
          </Link>

          {/* Toggle triggers for mobile menu */}
          <div className="flex items-center md:hidden gap-1">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg"
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav
          className="items-center w-full md:w-auto hidden md:flex text-gray-600 dark:text-slate-200"
          aria-label="Main navigation"
        >
          <ul className="flex flex-col md:flex-row md:self-center w-full md:w-auto text-base md:items-center gap-1">
            <li>
              <Link
                className="font-medium hover:text-gray-900 dark:hover:text-white px-4 py-3 flex items-center transition duration-150 ease-in-out cursor-pointer"
                href={isBlog ? "/#home" : "#home"}
                onClick={() => {
                  if (!isBlog) {
                    document.querySelector("#home")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                className="font-medium hover:text-gray-900 dark:hover:text-white px-4 py-3 flex items-center transition duration-150 ease-in-out cursor-pointer"
                href={isBlog ? "/#projects" : "#projects"}
                onClick={() => {
                  if (!isBlog) {
                    document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                Projects
              </Link>
            </li>
            <li>
              <Link
                className="font-medium hover:text-gray-900 dark:hover:text-white px-4 py-3 flex items-center transition duration-150 ease-in-out cursor-pointer"
                href="/blog"
              >
                Blogs
              </Link>
            </li>

            {/* Documents Dropdown */}
            <li
              className="relative"
              onMouseEnter={() => setDocsOpen(true)}
              onMouseLeave={() => setDocsOpen(false)}
            >
              <button className="font-medium hover:text-gray-900 dark:hover:text-white px-4 py-3 flex items-center transition duration-150 ease-in-out gap-1 cursor-pointer">
                Documents
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${docsOpen ? "rotate-180 text-blue-600" : ""}`} />
              </button>
              {docsOpen && (
                <ul className="absolute top-full left-0 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-lg py-1.5 shadow-xl min-w-[180px] z-50">
                  <li>
                    <a
                      href={siteConfig.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-xs font-semibold text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition duration-150 cursor-pointer"
                    >
                      Resume
                    </a>
                  </li>
                  <li>
                    <Link
                      href="/dissertions"
                      className="block px-4 py-2 text-xs font-semibold text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition duration-150 cursor-pointer"
                    >
                      Dissertations
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Rightside Actions */}
            <div className="md:self-center flex items-center ml-4 gap-1.5">
              <ThemeToggle />
              <a
                className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 focus:outline-none rounded-lg text-sm p-2 flex items-center transition-colors"
                aria-label="RSS Feed"
                href="#"
              >
                <Rss className="w-5 h-5" />
              </a>
              <a
                href={siteConfig.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 focus:outline-none rounded-lg text-sm p-2 flex items-center transition-colors"
                aria-label="Rajan Chand Github"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </ul>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <nav className="md:hidden bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 w-full">
          <ul className="flex flex-col px-4 py-4 space-y-2 text-base font-semibold text-gray-700 dark:text-slate-300">
            <li>
              <Link
                href={isBlog ? "/#home" : "#home"}
                onClick={() => {
                  setMobileOpen(false);
                  if (!isBlog) {
                    document.querySelector("#home")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="block py-2.5 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href={isBlog ? "/#projects" : "#projects"}
                onClick={() => {
                  setMobileOpen(false);
                  if (!isBlog) {
                    document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="block py-2.5 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Projects
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                onClick={() => setMobileOpen(false)}
                className="block py-2.5 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Blogs
              </Link>
            </li>
            <div className="border-t border-gray-100 dark:border-zinc-800/80 pt-2 space-y-1">
              <span className="block px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                Documents
              </span>
              <a
                href={siteConfig.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="block px-8 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Resume
              </a>
              <Link
                href="/dissertions"
                onClick={() => setMobileOpen(false)}
                className="block px-8 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Dissertations
              </Link>
            </div>
          </ul>
        </nav>
      )}
    </header>
  );
}
