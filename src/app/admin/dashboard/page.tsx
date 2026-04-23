"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  LogOut,
  Plus,
  Trash2,
  Edit,
  User,
  Briefcase,
  Layers,
  Award,
  BookOpen,
  Settings,
  Activity,
  ChevronRight,
  Sparkles,
  Link2,
  Upload
} from "lucide-react";
import { BackgroundOrbs } from "@/components/background-orbs";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ success: false, message: "" });
  const [activeTab, setActiveTab] = useState("profile");
  const router = useRouter();

  // Load portfolio data from API
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/admin");
        if (res.status === 401) {
          router.push("/admin");
          return;
        }
        const jsonData = await res.json();
        setData(jsonData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading admin data:", err);
      }
    }
    loadData();
  }, [router]);

  // Handle logging out
  const handleLogout = async () => {
    // Clear cookies by calling an empty API or just writing direct cookie cleanup in js
    document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/admin");
  };

  // Handle updating direct config fields
  const handleConfigChange = (field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      siteConfig: {
        ...prev.siteConfig,
        [field]: value
      }
    }));
  };

  // Save changes to API
  const handleSave = async () => {
    setSaving(true);
    setSaveStatus({ success: false, message: "" });

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (res.ok) {
        setSaveStatus({ success: true, message: resData.message || "Saved successfully!" });
        setTimeout(() => setSaveStatus({ success: false, message: "" }), 4000);
      } else {
        setSaveStatus({ success: false, message: resData.error || "Failed to save data" });
      }
    } catch (err: any) {
      setSaveStatus({ success: false, message: err.message || "An error occurred" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <BackgroundOrbs />
        <div className="text-center relative z-10">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[var(--muted-foreground)]">Loading Portfolio Console...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)]/30 relative overflow-hidden">
      <BackgroundOrbs />

      {/* Header bar */}
      <header className="sticky top-0 z-30 w-full border-b border-[var(--glass-border)] bg-[var(--background)]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-[0_0_15px_var(--glow-primary)]">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm block">Rajan Chand Portfolio</span>
              <span className="text-[10px] text-emerald-400 font-mono block flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> CMS Live Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:shadow-[0_0_25px_var(--glow-primary)] text-white text-xs font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              onClick={handleLogout}
              className="p-2 border border-[var(--glass-border)] hover:border-rose-500/30 hover:bg-rose-500/10 text-[var(--muted-foreground)] hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        {saveStatus.message && (
          <div
            className={`p-4 rounded-xl mb-6 border text-sm max-w-xl mx-auto ${
              saveStatus.success
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            }`}
          >
            {saveStatus.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Side navigation */}
          <div className="lg:col-span-1 space-y-2">
            <div className="glass rounded-2xl p-4 space-y-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "profile"
                    ? "bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--glass-border)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" /> Profile Info
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTab("experience")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "experience"
                    ? "bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--glass-border)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Experience Timeline
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTab("projects")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "projects"
                    ? "bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--glass-border)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Projects Grid
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTab("skills")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "skills"
                    ? "bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--glass-border)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Technical Skills
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTab("blogs")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "blogs"
                    ? "bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--glass-border)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Blog Articles
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTab("certifications")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "certifications"
                    ? "bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--glass-border)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" /> Certifications
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTab("dissertions")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "dissertions"
                    ? "bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--glass-border)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Dissertations
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 bg-[var(--primary)]/5 border border-[var(--primary)]/10 rounded-2xl text-[10px] leading-relaxed text-[var(--muted-foreground)]">
              💡 <strong>Pro-Tip</strong>: After configuring details, click <strong>Save Changes</strong> above to push changes live and instantly re-render static routes.
            </div>
          </div>

          {/* Main workspace */}
          <div className="lg:col-span-3">
            <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
              {/* === PROFILE TAB === */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="border-b border-[var(--glass-border)] pb-4">
                    <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)]">Site Configuration</h2>
                    <p className="text-xs text-[var(--muted-foreground)]">General settings and brand data</p>
                  </div>

                  {/* Profile Photo Uploader */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-5 border border-[var(--glass-border)] bg-[var(--glass-bg)] rounded-2xl">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border border-[var(--glass-border)] shrink-0 bg-zinc-800 flex items-center justify-center">
                      {data.siteConfig.profileImage ? (
                        <img
                          src={data.siteConfig.profileImage}
                          alt="Profile Headshot"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-[var(--muted-foreground)]" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <h4 className="text-sm font-bold">Profile Picture</h4>
                      <p className="text-xs text-[var(--muted-foreground)]">Upload a high-quality square headshot (PNG, JPG, WEBP, SVG)</p>
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        <label className="px-3 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          Choose File
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              
                              const formData = new FormData();
                              formData.append("file", file);
                              
                              try {
                                setSaving(true);
                                const res = await fetch("/api/admin/upload", {
                                  method: "POST",
                                  body: formData
                                });
                                const uploadData = await res.json();
                                if (res.ok && uploadData.url) {
                                  handleConfigChange("profileImage", uploadData.url);
                                  setSaveStatus({ success: true, message: "Avatar uploaded successfully! Click 'Save Changes' to apply." });
                                  setTimeout(() => setSaveStatus({ success: false, message: "" }), 4000);
                                } else {
                                  setSaveStatus({ success: false, message: uploadData.error || "Failed to upload image" });
                                }
                              } catch (err: any) {
                                setSaveStatus({ success: false, message: err.message || "An error occurred during upload" });
                              } finally {
                                setSaving(false);
                              }
                            }}
                          />
                        </label>
                        {data.siteConfig.profileImage && (
                          <button
                            type="button"
                            onClick={() => handleConfigChange("profileImage", "")}
                            className="px-3 py-1.5 border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            Remove Image
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold tracking-wider uppercase text-[var(--muted-foreground)]">Full Name</label>
                      <input
                        type="text"
                        value={data.siteConfig.name}
                        onChange={(e) => handleConfigChange("name", e.target.value)}
                        className="w-full px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold tracking-wider uppercase text-[var(--muted-foreground)]">Short Initials</label>
                      <input
                        type="text"
                        value={data.siteConfig.shortName}
                        onChange={(e) => handleConfigChange("shortName", e.target.value)}
                        className="w-full px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-bold tracking-wider uppercase text-[var(--muted-foreground)]">Professional Title</label>
                      <input
                        type="text"
                        value={data.siteConfig.title}
                        onChange={(e) => handleConfigChange("title", e.target.value)}
                        className="w-full px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-bold tracking-wider uppercase text-[var(--muted-foreground)]">Professional Summary</label>
                      <textarea
                        value={data.siteConfig.description}
                        onChange={(e) => handleConfigChange("description", e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-y"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold tracking-wider uppercase text-[var(--muted-foreground)]">Contact Email</label>
                      <input
                        type="email"
                        value={data.siteConfig.email}
                        onChange={(e) => handleConfigChange("email", e.target.value)}
                        className="w-full px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold tracking-wider uppercase text-[var(--muted-foreground)]">Calendly CTA URL</label>
                      <input
                        type="text"
                        value={data.siteConfig.calendlyUrl}
                        onChange={(e) => handleConfigChange("calendlyUrl", e.target.value)}
                        className="w-full px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold tracking-wider uppercase text-[var(--muted-foreground)]">Location (Base)</label>
                      <input
                        type="text"
                        value={data.siteConfig.location}
                        onChange={(e) => handleConfigChange("location", e.target.value)}
                        className="w-full px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold tracking-wider uppercase text-[var(--muted-foreground)]">Location (Origin)</label>
                      <input
                        type="text"
                        value={data.siteConfig.locationOrigin}
                        onChange={(e) => handleConfigChange("locationOrigin", e.target.value)}
                        className="w-full px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-bold tracking-wider uppercase text-[var(--muted-foreground)]">Resume PDF link (or #)</label>
                      <input
                        type="text"
                        value={data.siteConfig.resumeUrl}
                        onChange={(e) => handleConfigChange("resumeUrl", e.target.value)}
                        className="w-full px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Social links */}
                  <div className="space-y-4 pt-4 border-t border-[var(--glass-border)]">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Social Media Profiles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.socialLinks.map((link: any, index: number) => (
                        <div key={link.name} className="space-y-1">
                          <label className="text-[10px] text-[var(--muted-foreground)] font-semibold flex items-center gap-1">
                            <Link2 className="w-3 h-3 text-[var(--accent)]" /> {link.name} URL
                          </label>
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => {
                              const updated = [...data.socialLinks];
                              updated[index].url = e.target.value;
                              setData((prev: any) => ({ ...prev, socialLinks: updated }));
                            }}
                            className="w-full px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* === EXPERIENCE TAB === */}
              {activeTab === "experience" && (
                <div className="space-y-6">
                  <div className="border-b border-[var(--glass-border)] pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)]">Experience Timeline</h2>
                      <p className="text-xs text-[var(--muted-foreground)]">Manage professional and academic history</p>
                    </div>
                    <button
                      onClick={() => {
                        const newExp = {
                          period: "2026",
                          title: "New Role",
                          company: "Company Name",
                          companyUrl: "https://",
                          type: "work",
                          description: "Role overview goes here.",
                          bullets: ["Key responsibility or accomplishment"],
                          tags: ["Tag1", "Tag2"]
                        };
                        setData((prev: any) => ({
                          ...prev,
                          experience: [newExp, ...prev.experience]
                        }));
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-[var(--primary)]/20 hover:border-[var(--primary)]/50 text-[var(--primary)] rounded-lg text-xs font-semibold transition-all cursor-pointer bg-[var(--primary)]/5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Experience
                    </button>
                  </div>

                  <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {data.experience.map((item: any, idx: number) => (
                      <div key={idx} className="p-5 border border-[var(--glass-border)] rounded-2xl relative space-y-4 bg-[var(--glass-bg)]">
                        <button
                          onClick={() => {
                            const updated = data.experience.filter((_: any, i: number) => i !== idx);
                            setData((prev: any) => ({ ...prev, experience: updated }));
                          }}
                          className="absolute top-4 right-4 p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Period</label>
                            <input
                              type="text"
                              value={item.period}
                              onChange={(e) => {
                                const updated = [...data.experience];
                                updated[idx].period = e.target.value;
                                setData((prev: any) => ({ ...prev, experience: updated }));
                              }}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Title</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const updated = [...data.experience];
                                updated[idx].title = e.target.value;
                                setData((prev: any) => ({ ...prev, experience: updated }));
                              }}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Type</label>
                            <select
                              value={item.type}
                              onChange={(e) => {
                                const updated = [...data.experience];
                                updated[idx].type = e.target.value;
                                setData((prev: any) => ({ ...prev, experience: updated }));
                              }}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)]"
                            >
                              <option value="work">Work Experience</option>
                              <option value="education">Education</option>
                            </select>
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Company Name</label>
                            <input
                              type="text"
                              value={item.company}
                              onChange={(e) => {
                                const updated = [...data.experience];
                                updated[idx].company = e.target.value;
                                setData((prev: any) => ({ ...prev, experience: updated }));
                              }}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Company Website</label>
                            <input
                              type="text"
                              value={item.companyUrl}
                              onChange={(e) => {
                                const updated = [...data.experience];
                                updated[idx].companyUrl = e.target.value;
                                setData((prev: any) => ({ ...prev, experience: updated }));
                              }}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs"
                            />
                          </div>

                          <div className="space-y-1 md:col-span-3">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Description</label>
                            <textarea
                              value={item.description}
                              onChange={(e) => {
                                const updated = [...data.experience];
                                updated[idx].description = e.target.value;
                                setData((prev: any) => ({ ...prev, experience: updated }));
                              }}
                              rows={2}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs"
                            />
                          </div>

                          {/* Bullet highlights editor */}
                          <div className="space-y-2 md:col-span-3 pt-2">
                            <div className="flex items-center justify-between border-b border-[var(--glass-border)]/50 pb-1">
                              <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Key Highlights / Bullet Points</label>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...data.experience];
                                  if (!updated[idx].bullets) updated[idx].bullets = [];
                                  updated[idx].bullets.push("New highlight point");
                                  setData((prev: any) => ({ ...prev, experience: updated }));
                                }}
                                className="inline-flex items-center gap-1 text-[10px] text-[var(--primary)] hover:underline font-semibold cursor-pointer"
                              >
                                <Plus className="w-3 h-3" /> Add Highlight
                              </button>
                            </div>
                            
                            <div className="space-y-2">
                              {item.bullets && item.bullets.map((bullet: string, bIdx: number) => (
                                <div key={bIdx} className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0" />
                                  <input
                                    type="text"
                                    value={bullet}
                                    onChange={(e) => {
                                      const updated = [...data.experience];
                                      updated[idx].bullets[bIdx] = e.target.value;
                                      setData((prev: any) => ({ ...prev, experience: updated }));
                                    }}
                                    className="flex-1 px-3 py-1.5 bg-[var(--background)] border border-[var(--glass-border)] rounded-lg text-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...data.experience];
                                      updated[idx].bullets = updated[idx].bullets.filter((_: any, i: number) => i !== bIdx);
                                      setData((prev: any) => ({ ...prev, experience: updated }));
                                    }}
                                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                              {(!item.bullets || item.bullets.length === 0) && (
                                <p className="text-[10px] text-[var(--muted-foreground)] italic">No highlights added yet. Click &quot;Add Highlight&quot; above to add list details.</p>
                              )}
                            </div>
                          </div>

                          {/* Tags editor */}
                          <div className="space-y-1 md:col-span-3">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Tags (comma separated)</label>
                            <input
                              type="text"
                              value={item.tags ? item.tags.join(", ") : ""}
                              onChange={(e) => {
                                const updated = [...data.experience];
                                updated[idx].tags = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                                setData((prev: any) => ({ ...prev, experience: updated }));
                              }}
                              placeholder="e.g. Cisco, Security, Routing"
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* === PROJECTS TAB === */}
              {activeTab === "projects" && (
                <div className="space-y-6">
                  <div className="border-b border-[var(--glass-border)] pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)]">Projects</h2>
                      <p className="text-xs text-[var(--muted-foreground)]">Manage your showcase projects</p>
                    </div>
                    <button
                      onClick={() => {
                        const newProj = {
                          title: "New Project",
                          role: "Lead Engineer",
                          category: "Networking",
                          description: "Short description of accomplishments.",
                          impact: ["Metric or impact milestone"],
                          tags: ["Python", "Cisco"],
                          icon: "Network"
                        };
                        setData((prev: any) => ({
                          ...prev,
                          projects: [newProj, ...prev.projects]
                        }));
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-[var(--primary)]/20 hover:border-[var(--primary)]/50 text-[var(--primary)] rounded-lg text-xs font-semibold transition-all cursor-pointer bg-[var(--primary)]/5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Project
                    </button>
                  </div>

                  <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {data.projects.map((proj: any, idx: number) => (
                      <div key={idx} className="p-5 border border-[var(--glass-border)] rounded-2xl relative space-y-4 bg-[var(--glass-bg)]">
                        <button
                          onClick={() => {
                            const updated = data.projects.filter((_: any, i: number) => i !== idx);
                            setData((prev: any) => ({ ...prev, projects: updated }));
                          }}
                          className="absolute top-4 right-4 p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Project Title</label>
                            <input
                              type="text"
                              value={proj.title}
                              onChange={(e) => {
                                const updated = [...data.projects];
                                updated[idx].title = e.target.value;
                                setData((prev: any) => ({ ...prev, projects: updated }));
                              }}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Role</label>
                            <input
                              type="text"
                              value={proj.role}
                              onChange={(e) => {
                                const updated = [...data.projects];
                                updated[idx].role = e.target.value;
                                setData((prev: any) => ({ ...prev, projects: updated }));
                              }}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Category</label>
                            <select
                              value={proj.category}
                              onChange={(e) => {
                                const updated = [...data.projects];
                                updated[idx].category = e.target.value;
                                setData((prev: any) => ({ ...prev, projects: updated }));
                              }}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)]"
                            >
                              <option value="Networking">Networking</option>
                              <option value="Security">Security</option>
                              <option value="Academic">Academic</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Icon Key</label>
                            <select
                              value={proj.icon}
                              onChange={(e) => {
                                const updated = [...data.projects];
                                updated[idx].icon = e.target.value;
                                setData((prev: any) => ({ ...prev, projects: updated }));
                              }}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)]"
                            >
                              <option value="Network">Network</option>
                              <option value="ShieldCheck">ShieldCheck</option>
                              <option value="Bell">Bell</option>
                              <option value="Wifi">Wifi</option>
                              <option value="Tv">Tv</option>
                            </select>
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Description</label>
                            <textarea
                              value={proj.description}
                              onChange={(e) => {
                                const updated = [...data.projects];
                                updated[idx].description = e.target.value;
                                setData((prev: any) => ({ ...prev, projects: updated }));
                              }}
                              rows={2}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs"
                            />
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Impact Metrics (comma separated)</label>
                            <input
                              type="text"
                              value={proj.impact ? proj.impact.join(", ") : ""}
                              onChange={(e) => {
                                const updated = [...data.projects];
                                updated[idx].impact = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                                setData((prev: any) => ({ ...prev, projects: updated }));
                              }}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs"
                            />
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Tags (comma separated)</label>
                            <input
                              type="text"
                              value={proj.tags ? proj.tags.join(", ") : ""}
                              onChange={(e) => {
                                const updated = [...data.projects];
                                updated[idx].tags = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                                setData((prev: any) => ({ ...prev, projects: updated }));
                              }}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* === SKILLS TAB === */}
              {activeTab === "skills" && (
                <div className="space-y-6">
                  <div className="border-b border-[var(--glass-border)] pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)]">Technical Skills</h2>
                      <p className="text-xs text-[var(--muted-foreground)]">Manage your skills grid</p>
                    </div>
                    <button
                      onClick={() => {
                        const newSkill = {
                          name: "New Skill",
                          category: "Networking",
                          icon: "Router"
                        };
                        setData((prev: any) => ({
                          ...prev,
                          skills: [newSkill, ...prev.skills]
                        }));
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-[var(--primary)]/20 hover:border-[var(--primary)]/50 text-[var(--primary)] rounded-lg text-xs font-semibold transition-all cursor-pointer bg-[var(--primary)]/5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Skill
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {data.skills.map((skill: any, idx: number) => (
                      <div key={idx} className="p-4 border border-[var(--glass-border)] rounded-xl relative flex items-center gap-3 bg-[var(--glass-bg)]">
                        <button
                          onClick={() => {
                            const updated = data.skills.filter((_: any, i: number) => i !== idx);
                            setData((prev: any) => ({ ...prev, skills: updated }));
                          }}
                          className="absolute top-2 right-2 p-1 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex-1 grid grid-cols-3 gap-2 pt-2">
                          <input
                            type="text"
                            value={skill.name}
                            onChange={(e) => {
                              const updated = [...data.skills];
                              updated[idx].name = e.target.value;
                              setData((prev: any) => ({ ...prev, skills: updated }));
                            }}
                            placeholder="Skill Name"
                            className="px-2 py-1.5 bg-[var(--background)] border border-[var(--glass-border)] rounded-lg text-xs col-span-2"
                          />
                          <select
                            value={skill.category}
                            onChange={(e) => {
                              const updated = [...data.skills];
                              updated[idx].category = e.target.value;
                              setData((prev: any) => ({ ...prev, skills: updated }));
                            }}
                            className="px-2 py-1.5 bg-[var(--background)] border border-[var(--glass-border)] rounded-lg text-xs text-[var(--foreground)]"
                          >
                            <option value="Networking">Networking</option>
                            <option value="Security">Security</option>
                            <option value="Systems">Systems</option>
                            <option value="Monitoring">Monitoring</option>
                            <option value="Programming">Programming</option>
                            <option value="Cloud">Cloud</option>
                            <option value="Tools">Tools</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* === BLOGS TAB === */}
              {activeTab === "blogs" && (
                <div className="space-y-6">
                  <div className="border-b border-[var(--glass-border)] pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)]">Academic & Tech Blog Posts</h2>
                      <p className="text-xs text-[var(--muted-foreground)]">Publish, draft, and edit articles</p>
                    </div>
                    <button
                      onClick={() => {
                        const newPost = {
                          slug: "new-article-" + Math.floor(Math.random() * 1000),
                          title: "Untitled Article",
                          excerpt: "Overview of what this article covers.",
                          date: new Date().toISOString().split("T")[0],
                          category: "Networking",
                          readTime: "5 min read",
                          content: "# Heading 1\n\nWrite article content in Markdown here."
                        };
                        setData((prev: any) => ({
                          ...prev,
                          blogPosts: [newPost, ...prev.blogPosts]
                        }));
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-[var(--primary)]/20 hover:border-[var(--primary)]/50 text-[var(--primary)] rounded-lg text-xs font-semibold transition-all cursor-pointer bg-[var(--primary)]/5"
                    >
                      <Plus className="w-3.5 h-3.5" /> New Article
                    </button>
                  </div>

                  <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {data.blogPosts.map((post: any, idx: number) => (
                      <div key={idx} className="p-5 border border-[var(--glass-border)] rounded-2xl relative space-y-4 bg-[var(--glass-bg)]">
                        <button
                          onClick={() => {
                            const updated = data.blogPosts.filter((_: any, i: number) => i !== idx);
                            setData((prev: any) => ({ ...prev, blogPosts: updated }));
                          }}
                          className="absolute top-4 right-4 p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Article Title</label>
                            <input
                              type="text"
                              value={post.title}
                              onChange={(e) => {
                                const updated = [...data.blogPosts];
                                updated[idx].title = e.target.value;
                                setData((prev: any) => ({ ...prev, blogPosts: updated }));
                              }}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">URL Slug</label>
                            <input
                              type="text"
                              value={post.slug}
                              onChange={(e) => {
                                const updated = [...data.blogPosts];
                                updated[idx].slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
                                setData((prev: any) => ({ ...prev, blogPosts: updated }));
                              }}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Publish Date</label>
                            <input
                              type="text"
                              value={post.date}
                              onChange={(e) => {
                                const updated = [...data.blogPosts];
                                updated[idx].date = e.target.value;
                                setData((prev: any) => ({ ...prev, blogPosts: updated }));
                              }}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Read Time</label>
                            <input
                              type="text"
                              value={post.readTime}
                              onChange={(e) => {
                                const updated = [...data.blogPosts];
                                updated[idx].readTime = e.target.value;
                                setData((prev: any) => ({ ...prev, blogPosts: updated }));
                              }}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Category</label>
                            <input
                              type="text"
                              value={post.category}
                              onChange={(e) => {
                                const updated = [...data.blogPosts];
                                updated[idx].category = e.target.value;
                                setData((prev: any) => ({ ...prev, blogPosts: updated }));
                              }}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs"
                            />
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Excerpt</label>
                            <textarea
                              value={post.excerpt}
                              onChange={(e) => {
                                const updated = [...data.blogPosts];
                                updated[idx].excerpt = e.target.value;
                                setData((prev: any) => ({ ...prev, blogPosts: updated }));
                              }}
                              rows={2}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs"
                            />
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Content (Markdown supported)</label>
                            <textarea
                              value={post.content}
                              onChange={(e) => {
                                const updated = [...data.blogPosts];
                                updated[idx].content = e.target.value;
                                setData((prev: any) => ({ ...prev, blogPosts: updated }));
                              }}
                              rows={10}
                              placeholder="Write your article in Markdown..."
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs font-mono resize-y"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* === DISSERTIONS TAB === */}
              {activeTab === "dissertions" && (
                <div className="space-y-6">
                  <div className="border-b border-[var(--glass-border)] pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)]">Academic & Professional Papers</h2>
                      <p className="text-xs text-[var(--muted-foreground)]">Manage published reports and dissertations</p>
                    </div>
                    <button
                      onClick={() => {
                        const newDoc = {
                          title: "New Research Paper",
                          description: "Detailed summary of the methodology, design, and findings.",
                          type: "Academic Research Paper",
                          published: "May 2026",
                          url: "#"
                        };
                        setData((prev: any) => ({
                          ...prev,
                          dissertions: [newDoc, ...(prev.dissertions || [])]
                        }));
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-[var(--primary)]/20 hover:border-[var(--primary)]/50 text-[var(--primary)] rounded-lg text-xs font-semibold transition-all cursor-pointer bg-[var(--primary)]/5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Document
                    </button>
                  </div>

                  <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {(data.dissertions || []).map((doc: any, idx: number) => (
                      <div key={idx} className="p-5 border border-[var(--glass-border)] rounded-2xl relative space-y-4 bg-[var(--glass-bg)]">
                        <button
                          onClick={() => {
                            const updated = data.dissertions.filter((_: any, i: number) => i !== idx);
                            setData((prev: any) => ({ ...prev, dissertions: updated }));
                          }}
                          className="absolute top-4 right-4 p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Document Title</label>
                            <input
                              type="text"
                              value={doc.title}
                              onChange={(e) => {
                                const updated = [...data.dissertions];
                                updated[idx].title = e.target.value;
                                setData((prev: any) => ({ ...prev, dissertions: updated }));
                              }}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Document Type</label>
                            <input
                              type="text"
                              value={doc.type}
                              onChange={(e) => {
                                const updated = [...data.dissertions];
                                updated[idx].type = e.target.value;
                                setData((prev: any) => ({ ...prev, dissertions: updated }));
                              }}
                              placeholder="e.g. MSc IT Research Dissertation"
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Date Published</label>
                            <input
                              type="text"
                              value={doc.published}
                              onChange={(e) => {
                                const updated = [...data.dissertions];
                                updated[idx].published = e.target.value;
                                setData((prev: any) => ({ ...prev, dissertions: updated }));
                              }}
                              placeholder="e.g. May 2026"
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs"
                            />
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Document link / URL</label>
                            <input
                              type="text"
                              value={doc.url}
                              onChange={(e) => {
                                const updated = [...data.dissertions];
                                updated[idx].url = e.target.value;
                                setData((prev: any) => ({ ...prev, dissertions: updated }));
                              }}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs"
                            />
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Summary / Description</label>
                            <textarea
                              value={doc.description}
                              onChange={(e) => {
                                const updated = [...data.dissertions];
                                updated[idx].description = e.target.value;
                                setData((prev: any) => ({ ...prev, dissertions: updated }));
                              }}
                              rows={3}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* === CERTIFICATIONS TAB === */}
              {activeTab === "certifications" && (
                <div className="space-y-6">
                  <div className="border-b border-[var(--glass-border)] pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)]">Certifications & Credentials</h2>
                      <p className="text-xs text-[var(--muted-foreground)]">Manage your certifications and upload verification scans</p>
                    </div>
                    <button
                      onClick={() => {
                        const newCert = {
                          title: "New Certification",
                          issuer: "Issuing Organization",
                          photo: ""
                        };
                        setData((prev: any) => ({
                          ...prev,
                          certifications: [newCert, ...(prev.certifications || [])]
                        }));
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-[var(--primary)]/20 hover:border-[var(--primary)]/50 text-[var(--primary)] rounded-lg text-xs font-semibold transition-all cursor-pointer bg-[var(--primary)]/5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Certification
                    </button>
                  </div>

                  <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {(data.certifications || []).map((cert: any, idx: number) => (
                      <div key={idx} className="p-5 border border-[var(--glass-border)] rounded-2xl relative space-y-4 bg-[var(--glass-bg)]">
                        <button
                          onClick={() => {
                            const updated = data.certifications.filter((_: any, i: number) => i !== idx);
                            setData((prev: any) => ({ ...prev, certifications: updated }));
                          }}
                          className="absolute top-4 right-4 p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Certification Title</label>
                            <input
                              type="text"
                              value={cert.title}
                              onChange={(e) => {
                                const updated = [...data.certifications];
                                updated[idx].title = e.target.value;
                                setData((prev: any) => ({ ...prev, certifications: updated }));
                              }}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase">Issuer</label>
                            <input
                              type="text"
                              value={cert.issuer}
                              onChange={(e) => {
                                const updated = [...data.certifications];
                                updated[idx].issuer = e.target.value;
                                setData((prev: any) => ({ ...prev, certifications: updated }));
                              }}
                              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--glass-border)] rounded-xl text-xs"
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase block">Credential Image / Scan</label>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 border border-[var(--glass-border)] rounded-xl bg-[var(--background)]/40">
                              {cert.photo ? (
                                <div className="relative w-16 h-12 rounded border border-[var(--glass-border)] overflow-hidden shrink-0 bg-zinc-800">
                                  <img src={cert.photo} alt="Scan preview" className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="w-16 h-12 rounded border border-dashed border-[var(--glass-border)] flex items-center justify-center shrink-0 text-[10px] text-[var(--muted-foreground)]">
                                  No Photo
                                </div>
                              )}
                              <div className="flex-1 space-y-1">
                                <input
                                  type="text"
                                  value={cert.photo || ""}
                                  onChange={(e) => {
                                    const updated = [...data.certifications];
                                    updated[idx].photo = e.target.value;
                                    setData((prev: any) => ({ ...prev, certifications: updated }));
                                  }}
                                  placeholder="Paste Image URL or upload one ->"
                                  className="w-full px-2 py-1 bg-[var(--background)] border border-[var(--glass-border)] rounded-lg text-xs"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="px-3 py-1.5 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 border border-[var(--primary)]/20 text-[var(--primary)] text-xs font-semibold rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1.5 shrink-0">
                                  <Upload className="w-3.5 h-3.5" />
                                  Upload Photo
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      
                                      const formData = new FormData();
                                      formData.append("file", file);
                                      
                                      try {
                                        setSaving(true);
                                        const res = await fetch("/api/admin/upload", {
                                          method: "POST",
                                          body: formData
                                        });
                                        const uploadData = await res.json();
                                        if (res.ok && uploadData.url) {
                                          const updated = [...data.certifications];
                                          updated[idx].photo = uploadData.url;
                                          setData((prev: any) => ({ ...prev, certifications: updated }));
                                          setSaveStatus({ success: true, message: "Certificate photo uploaded successfully!" });
                                          setTimeout(() => setSaveStatus({ success: false, message: "" }), 4000);
                                        } else {
                                          setSaveStatus({ success: false, message: uploadData.error || "Failed to upload image" });
                                        }
                                      } catch (err: any) {
                                        setSaveStatus({ success: false, message: err.message || "An error occurred during upload" });
                                      } finally {
                                        setSaving(false);
                                      }
                                    }}
                                  />
                                </label>
                                {cert.photo && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...data.certifications];
                                      updated[idx].photo = "";
                                      setData((prev: any) => ({ ...prev, certifications: updated }));
                                    }}
                                    className="px-2 py-1.5 border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                  >
                                    Clear
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
