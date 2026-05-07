"use client";

import { siteConfig, socialLinks } from "@/lib/data";
import { SectionHeader } from "@/components/ui/section-header";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Send, Mail, MapPin, Globe, Calendar } from "lucide-react";
import { getIcon } from "@/lib/icons";

export function Contact() {
  const contactEmail = siteConfig.email || "rajanchand48@gmail.com";

  // Build Gmail compose URL with pre-filled fields
  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = (formData.get("name") as string) || "";
    const email = (formData.get("email") as string) || "";
    const subject = (formData.get("subject") as string) || "";
    const message = (formData.get("message") as string) || "";

    const body = `Hi Rajan,\n\n${message}\n\n---\nFrom: ${name}\nEmail: ${email}`;

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contactEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.open(gmailUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="contact" className="relative z-10 py-12 md:py-16">
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
                      <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contactEmail)}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-[var(--accent)] transition-colors">
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
              <form onSubmit={handleSendMessage} className="flex flex-col gap-5">
                <div>
                  <input
                    type="text"
                    name="name"
                    id="contact-name"
                    placeholder="Your Name"
                    required
                    className="w-full px-5 py-3.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    id="contact-email"
                    placeholder="Your Email"
                    required
                    className="w-full px-5 py-3.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="subject"
                    id="contact-subject"
                    placeholder="Subject"
                    className="w-full px-5 py-3.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <textarea
                    name="message"
                    id="contact-message"
                    placeholder="Your Message"
                    required
                    rows={5}
                    className="w-full px-5 py-3.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-y min-h-[120px]"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 cursor-pointer bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:shadow-[0_0_35px_var(--glow-primary)] hover:-translate-y-0.5"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
                <p className="text-[10px] text-[var(--muted-foreground)] text-center -mt-2">
                  Opens Gmail with your message pre-filled
                </p>
              </form>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
