"use client";

import { siteConfig, socialLinks } from "@/lib/data";
import { getIcon } from "@/lib/icons";
import { Mail, Globe, Radio } from "lucide-react";

const links = [
  {
    title: "Browse",
    items: [
      { title: "Projects", href: "#projects" },
      { title: "Resources", href: "#" },
      { title: "Work Experience", href: "#experience" },
      { title: "Recent Posts", href: "#articles" },
    ],
  },
  {
    title: "Recommended Platforms",
    items: [
      { title: "ChatGPT", href: "https://chat.openai.com/chat" },
      { title: "Partners", href: "#" },
      { title: "Atom", href: "#" },
      { title: "Electron", href: "#" },
    ],
  },
  {
    title: "Communities",
    items: [
      { title: "Rotaract Club of Dillibazar Kathmandu", href: "https://www.rotary.org/en/about-rotary" },
      { title: "Robotics Association of Nepal", href: "https://roboticsassociationofnepal.business.site/" },
    ],
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-zinc-950 z-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-12 gap-4 gap-y-8 sm:gap-8 py-8 md:py-12">
          {/* Column 1 — Brand info */}
          <div className="col-span-12 lg:col-span-4">
            <div className="mb-2">
              <a className="inline-block font-bold text-xl text-gray-900 dark:text-gray-100" href="/">
                {siteConfig.name}
              </a>
            </div>
            <div className="text-sm text-gray-600 dark:text-slate-400">
              <a
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition duration-150 ease-in-out"
                href="#"
              >
                {siteConfig.title}
              </a>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 my-4">
              {siteConfig.location} | {siteConfig.locationOrigin}
            </div>
          </div>

          {/* Links lists */}
          {links.map(({ title, items }) => (
            <div key={title} className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-2">
              <div className="text-gray-800 dark:text-gray-300 font-bold text-sm mb-3">
                {title}
              </div>
              <ul className="text-sm space-y-2">
                {items.map((item) => (
                  <li key={item.title}>
                    <a
                      className="text-gray-600 hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-white transition duration-150 ease-in-out"
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Social bar & Copyright */}
        <div className="md:flex md:items-center md:justify-between py-6 md:py-8 border-t border-gray-100 dark:border-slate-800/80">
          <ul className="flex mb-4 md:order-1 -ml-2 md:ml-4 md:mb-0 gap-1.5">
            {socialLinks.map((social) => {
              const Icon = getIcon(social.icon) || Mail;
              return (
                <li key={social.name}>
                  <a
                    className="text-blue-500 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 inline-flex items-center"
                    aria-label={social.name}
                    href={social.url === "#" ? `mailto:${siteConfig.email}` : social.url}
                    target={social.url === "#" ? undefined : "_blank"}
                    rel={social.url === "#" ? undefined : "noopener noreferrer"}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="text-xs text-gray-500 mr-4 dark:text-slate-400">
            &copy; {siteConfig.shortName.toLowerCase()}cs | {currentYear}
          </div>
        </div>
      </div>
    </footer>
  );
}
