"use client";

import { useState } from "react";
import { siteConfig, socialLinks } from "@/lib/data";
import { SectionHeader } from "@/components/ui/section-header";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Send, Mail, MapPin, Globe, Calendar, CheckCircle } from "lucide-react";
import { getIcon } from "@/lib/icons";

export function Contact() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormState({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  return (
    <section id="contact" className="relative z-10 py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="glass rounded-3xl p-8 md:p-12 lg:p-16 relative overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute -top-1/2 -right-1/4 w-[400px] h-[400px] bg-[var(--primary)] rounded-full opacity-[0.04] blur-[100px] pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
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

                <div className="space-y-5 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                    <div>
                      <span className="text-xs text-[var(--muted-foreground)] block">Email</span>
                      <a href={`mailto:${siteConfig.email}`} className="text-sm font-medium hover:text-[var(--accent)] transition-colors">
                        {siteConfig.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                    <div>
                      <span className="text-xs text-[var(--muted-foreground)] block">Location</span>
                      <span className="text-sm font-medium">{siteConfig.location}</span>
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

                {/* Hire Me */}
                <a
                  href={siteConfig.calendlyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
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
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <input
                    type="text"
                    id="contact-name"
                    placeholder="Your Name"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full px-5 py-3.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    id="contact-email"
                    placeholder="Your Email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full px-5 py-3.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    id="contact-subject"
                    placeholder="Subject"
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    className="w-full px-5 py-3.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <textarea
                    id="contact-message"
                    placeholder="Your Message"
                    required
                    rows={5}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full px-5 py-3.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-y min-h-[120px]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitted}
                  className={`inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 cursor-pointer ${
                    submitted
                      ? "bg-gradient-to-r from-emerald-500 to-[var(--accent)]"
                      : "bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:shadow-[0_0_35px_var(--glow-primary)] hover:-translate-y-0.5"
                  }`}
                >
                  {submitted ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Message Sent!
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
