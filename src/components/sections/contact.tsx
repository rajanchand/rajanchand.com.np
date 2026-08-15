"use client";

import { useState } from "react";
import { siteConfig as defaultSiteConfig, socialLinks as defaultSocialLinks } from "@/lib/data";
import { SectionHeader } from "@/components/ui/section-header";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Send, Mail, MapPin, Globe, Calendar, CheckCircle, ShieldAlert } from "lucide-react";
import { getIcon } from "@/lib/icons";

interface ContactProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  siteConfig?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socialLinks?: any[];
}

export function Contact({ siteConfig: customSiteConfig, socialLinks: customSocialLinks }: ContactProps = {}) {
  const siteConfig = customSiteConfig || defaultSiteConfig;
  const socialLinks = customSocialLinks || defaultSocialLinks;
  const contactEmail = siteConfig.email || "rajanchand48@gmail.com";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: (formData.get("name") as string) || "",
      email: (formData.get("email") as string) || "",
      subject: (formData.get("subject") as string) || "",
      message: (formData.get("message") as string) || "",
      // Honeypot — hidden from real visitors, bots tend to fill every field
      company: (formData.get("company") as string) || "",
    };

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't send your message. Please try again.");
        return;
      }

      if (data.success) {
        setSuccess(true);
        form.reset();
        setTimeout(() => setSuccess(false), 6000);
      } else {
        setError(data.error || "Couldn't send your message. Please try again.");
      }
    } catch {
      setError("Couldn't send your message. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="relative z-10 py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="glass rounded-3xl p-5 sm:p-8 md:p-12 lg:p-14 relative overflow-hidden shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            {/* Decorative glow */}
            <div className="absolute -top-1/2 -right-1/4 w-[400px] h-[400px] bg-[var(--primary)] rounded-full opacity-[0.04] blur-[100px] pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16">
              {/* Left — Info */}
              <div>
                <SectionHeader
                  label="Get in Touch"
                  title="Let's Work Together"
                  center={false}
                />

                <p className="text-[var(--muted-foreground)] text-sm leading-relaxed mb-8 -mt-8">
                  Have a project in mind or an opportunity to discuss? I&apos;d love to hear from you. Let&apos;s build something great together.
                </p>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                    <div>
                      <span className="text-xs text-[var(--muted-foreground)] block">Email</span>
                      <a href={`mailto:${contactEmail}`} className="text-sm font-medium hover:text-[var(--accent)] transition-colors">
                        {contactEmail}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                    <div>
                      <span className="text-xs text-[var(--muted-foreground)] block">Location</span>
                      <span className="text-sm font-medium">
                        {siteConfig.location}
                        {siteConfig.locationOrigin ? ` · Originally from ${siteConfig.locationOrigin}` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                      <Globe className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                    <div>
                      <span className="text-xs text-[var(--muted-foreground)] block">Website</span>
                      <a href={siteConfig.url || "https://rajanchand.com.np"} className="text-sm font-medium hover:text-[var(--accent)] transition-colors">
                        {(siteConfig.url || "rajanchand.com.np").replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  </div>

                </div>

                {/* Availability Status */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Open to Opportunities
                  </span>
                </div>

                {/* Hire Me */}
                <a
                  href={siteConfig.calendlyUrl || "#contact"}
                  target={siteConfig.calendlyUrl ? "_blank" : undefined}
                  rel={siteConfig.calendlyUrl ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-2 px-6 py-3 glass rounded-xl text-sm font-semibold hover:border-[var(--primary)]/30 hover:-translate-y-0.5 transition-all duration-300 mb-8"
                >
                  <Calendar className="w-4 h-4 text-[var(--accent)]" />
                  Schedule a Call — Hire Me
                </a>

                {/* Social */}
                <div className="flex gap-3">
                  {socialLinks.map((social) => {
                    const IconComponent = getIcon(social.icon);
                    return (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.name}
                        className="w-11 h-11 rounded-xl flex items-center justify-center glass hover:bg-gradient-to-r hover:from-[var(--primary)] hover:to-[var(--accent)] hover:border-transparent hover:-translate-y-1 hover:shadow-[0_0_25px_var(--glow-primary)] transition-all duration-300 group"
                      >
                        {IconComponent && <IconComponent className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-white transition-colors" />}
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Right — Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)]/40 p-4 sm:p-6" aria-label="Contact form">
                {/* Honeypot — invisible to real visitors, bots fill every field */}
                <input
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute -left-[9999px] w-px h-px opacity-0"
                />
                <div>
                  <label htmlFor="contact-name" className="mb-2 block text-xs font-semibold text-[var(--foreground)]">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="contact-name"
                    placeholder="Your name"
                    required
                    disabled={loading}
                    className="w-full px-5 py-3.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors disabled:opacity-60"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="mb-2 block text-xs font-semibold text-[var(--foreground)]">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="contact-email"
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                    className="w-full px-5 py-3.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors disabled:opacity-60"
                  />
                </div>
                <div>
                  <label htmlFor="contact-subject" className="mb-2 block text-xs font-semibold text-[var(--foreground)]">
                    Subject <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    id="contact-subject"
                    placeholder="What would you like to discuss?"
                    disabled={loading}
                    className="w-full px-5 py-3.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors disabled:opacity-60"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="mb-2 block text-xs font-semibold text-[var(--foreground)]">
                    Message
                  </label>
                  <textarea
                    name="message"
                    id="contact-message"
                    placeholder="Share a few details about your project or opportunity..."
                    required
                    disabled={loading}
                    rows={5}
                    minLength={10}
                    className="w-full px-5 py-3.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-y min-h-[120px] disabled:opacity-60"
                  />
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-sm text-rose-500">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="p-4.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-1 text-sm text-emerald-500 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2 font-bold text-base">
                      <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500" />
                      <span>Thank you for contacting!</span>
                    </div>
                    <p className="text-xs text-emerald-500/90 pl-7">
                      An automated email response has been sent to your inbox. We will review your message and inform you shortly.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 cursor-pointer bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:shadow-[0_0_35px_var(--glow-primary)] hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  <Send className="w-4 h-4" />
                  {loading ? "Sending..." : "Send Message"}
                </button>
                <p className="text-[10px] text-[var(--muted-foreground)] text-center -mt-2">
                  Or email me directly at {contactEmail}
                </p>
              </form>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
