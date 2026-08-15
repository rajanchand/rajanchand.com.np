"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  Eye,
  Columns,
  Code,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Upload,
  Loader2,
  Clock,
  Calendar,
  Layers,
  FileText,
  Check,
  Globe,
  Sparkles,
  X,
  Copy,
  Table as TableIcon,
  AlertCircle
} from "lucide-react";

interface BlogPostItem {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  content?: string;
  tags?: string[];
  status?: "published" | "draft";
  coverImage?: string;
}

interface BlogManagerProps {
  blogPosts: BlogPostItem[];
  onUpdatePosts: (posts: BlogPostItem[]) => void;
}

const FIELD_CLASS =
  "w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/60 focus:outline-none focus:border-[var(--primary)] transition-colors";

const LABEL_CLASS =
  "text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5";

const TOOL_BUTTON_CLASS =
  "p-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors cursor-pointer";

const EDITOR_MODES = [
  { id: "write", label: "Write", icon: Edit3 },
  { id: "split", label: "Split", icon: Columns },
  { id: "preview", label: "Preview", icon: Eye },
  { id: "seo", label: "SEO", icon: Globe },
] as const;

type EditorMode = (typeof EDITOR_MODES)[number]["id"];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function BlogManager({ blogPosts = [], onUpdatePosts }: BlogManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>("write");
  const [editorError, setEditorError] = useState("");
  const [uploading, setUploading] = useState(false);

  // Temporary edit state when modal/panel is open
  const [currentPost, setCurrentPost] = useState<BlogPostItem | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const closeEditor = useCallback(() => {
    setCurrentPost(null);
    setEditingIndex(null);
    setEditorError("");
    setUploading(false);
  }, []);

  // Escape to dismiss and scroll lock, matching the certifications lightbox behaviour
  useEffect(() => {
    if (!currentPost) return;
    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeEditor();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [currentPost, closeEditor]);

  // Extract categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(blogPosts.map((p) => p.category).filter(Boolean)));
    return ["All", ...cats];
  }, [blogPosts]);

  // Filtered posts keep their original index so edit/delete never act on a lookalike entry
  const filteredPosts = useMemo(() => {
    return blogPosts
      .map((post, index) => ({ post, index }))
      .filter(({ post }) => {
        const matchesCat = selectedCategory === "All" || post.category === selectedCategory;
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          (post.title || "").toLowerCase().includes(q) ||
          (post.excerpt || "").toLowerCase().includes(q) ||
          (post.category || "").toLowerCase().includes(q) ||
          (post.slug || "").toLowerCase().includes(q);

        return matchesCat && matchesSearch;
      });
  }, [blogPosts, selectedCategory, searchQuery]);

  // Word statistics helper
  const stats = useMemo(() => {
    const content = currentPost?.content || "";
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const chars = content.length;
    const readTimeMins = Math.max(1, Math.ceil(words / 200));
    return { words, chars, readTimeMins };
  }, [currentPost?.content]);

  // Open editor for new post
  const handleCreateNew = () => {
    const newPost: BlogPostItem = {
      title: "",
      slug: "",
      date: new Date().toISOString().split("T")[0],
      category: "Network Engineering",
      readTime: "5 min read",
      excerpt: "",
      content: "",
      tags: ["Tech"],
      status: "published",
      coverImage: ""
    };
    setCurrentPost(newPost);
    setEditingIndex(-1); // -1 indicates brand new post
    setEditorMode("write");
    setEditorError("");
  };

  // Open editor for existing post
  const handleEdit = (idx: number) => {
    setCurrentPost({ ...blogPosts[idx] });
    setEditingIndex(idx);
    setEditorMode("write");
    setEditorError("");
  };

  // Save post changes
  const handleSaveCurrent = () => {
    if (!currentPost) return;

    if (!currentPost.title.trim()) {
      setEditorError("Add an article title before saving.");
      return;
    }

    const autoSlug = currentPost.slug || slugify(currentPost.title);
    if (!autoSlug) {
      setEditorError("This title can't generate a URL slug. Add a slug manually.");
      return;
    }

    const slugTaken = blogPosts.some(
      (post, index) => index !== editingIndex && post.slug === autoSlug
    );
    if (slugTaken) {
      setEditorError(`The slug "${autoSlug}" is already used by another article.`);
      return;
    }

    const finalPost: BlogPostItem = {
      ...currentPost,
      slug: autoSlug,
      readTime: `${stats.readTimeMins} min read`
    };

    let updatedList: BlogPostItem[];
    if (editingIndex === -1) {
      updatedList = [finalPost, ...blogPosts];
    } else if (editingIndex !== null && editingIndex >= 0) {
      updatedList = [...blogPosts];
      updatedList[editingIndex] = finalPost;
    } else {
      updatedList = blogPosts;
    }

    onUpdatePosts(updatedList);
    closeEditor();
  };

  // Delete post
  const handleDelete = (idx: number) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    const updated = blogPosts.filter((_, i) => i !== idx);
    onUpdatePosts(updated);
  };

  // Duplicate post
  const handleDuplicate = (idx: number) => {
    const target = blogPosts[idx];
    const copy: BlogPostItem = {
      ...target,
      title: `${target.title} (Copy)`,
      slug: `${target.slug}-copy`,
      date: new Date().toISOString().split("T")[0]
    };
    const updated = [copy, ...blogPosts];
    onUpdatePosts(updated);
  };

  // Selection formatting helper for the markdown toolbar
  const insertFormatting = (prefix: string, suffix = "") => {
    const el = textareaRef.current;
    if (!el || !currentPost) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selectedText = text.substring(start, end);
    const replacement = prefix + selectedText + suffix;
    const newContent = text.substring(0, start) + replacement + text.substring(end);

    setCurrentPost({ ...currentPost, content: newContent });

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 10);
  };

  // The toolbar advertises Ctrl+B / Ctrl+I, so wire the shortcuts to the same helper
  const handleEditorShortcut = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!event.metaKey && !event.ctrlKey) return;
    const key = event.key.toLowerCase();
    if (key === "b") {
      event.preventDefault();
      insertFormatting("**", "**");
    } else if (key === "i") {
      event.preventDefault();
      insertFormatting("*", "*");
    } else if (key === "k") {
      event.preventDefault();
      insertFormatting("[", "](https://)");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setEditorError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const result = await res.json().catch(() => null);

      if (!res.ok || !result?.success) {
        setEditorError(result?.error || "Upload failed. Please try again.");
        return;
      }

      const isImg = [".png", ".jpg", ".jpeg", ".webp", ".svg"].some((ext) =>
        result.url.toLowerCase().endsWith(ext)
      );
      const isPdf = result.url.toLowerCase().endsWith(".pdf");
      const markdown = isImg
        ? `\n![${result.name}](${result.url})\n`
        : isPdf
        ? `\n[PDF document: ${result.name}](${result.url})\n`
        : `\n[Attachment: ${result.name}](${result.url})\n`;
      insertFormatting(markdown);
    } catch {
      setEditorError("Network error while uploading. Check your connection and retry.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  // Render markdown for preview
  const renderMarkdownPreview = (text: string) => {
    if (!text) {
      return (
        <p className="text-sm italic text-[var(--muted-foreground)]">
          Nothing to preview yet. Start writing in the editor to see it here.
        </p>
      );
    }

    const lines = text.split("\n");
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("# ")) {
        return <h1 key={i} className="text-2xl font-bold font-display mt-6 mb-3 text-[var(--foreground)]">{trimmed.substring(2)}</h1>;
      }
      if (trimmed.startsWith("## ")) {
        return <h2 key={i} className="text-xl font-bold font-display mt-5 mb-2 text-[var(--foreground)] border-b border-[var(--glass-border)] pb-1">{trimmed.substring(3)}</h2>;
      }
      if (trimmed.startsWith("### ")) {
        return <h3 key={i} className="text-lg font-bold font-display mt-4 mb-2 text-[var(--foreground)]">{trimmed.substring(4)}</h3>;
      }
      if (trimmed.startsWith("> ")) {
        return <blockquote key={i} className="border-l-4 border-[var(--primary)] pl-4 py-1.5 my-3 italic text-[var(--muted-foreground)] bg-[var(--primary)]/5 rounded-r">{trimmed.substring(2)}</blockquote>;
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return <li key={i} className="ml-5 list-disc text-sm text-[var(--muted-foreground)] my-1">{trimmed.substring(2)}</li>;
      }
      if (trimmed.startsWith("```")) {
        return <pre key={i} className="bg-[var(--glass-bg)] p-3 rounded-lg text-xs font-mono text-[var(--primary)] my-3 overflow-x-auto border border-[var(--glass-border)]"><code>{trimmed.replace(/```/g, "")}</code></pre>;
      }
      if (trimmed === "") return <div key={i} className="h-3" />;
      return <p key={i} className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-3">{line}</p>;
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20 border border-[var(--primary)]/20 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-[var(--foreground)]">Blog Articles</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Write, preview, and optimise articles before publishing</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 rounded-full text-xs font-mono font-bold">
            {blogPosts.length} article{blogPosts.length === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={handleCreateNew}
            className="px-5 py-2.5 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:shadow-[0_0_25px_var(--glow-primary)] text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" /> New article
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              aria-pressed={selectedCategory === cat}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[var(--primary)] text-white border-transparent shadow-sm"
                  : "bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative sm:min-w-[240px]">
          <Search aria-hidden className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
          <input
            type="search"
            aria-label="Search articles"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${FIELD_CLASS} pl-9 pr-4 py-2 text-xs`}
          />
        </div>
      </div>

      {/* Article Cards Grid */}
      {filteredPosts.length === 0 ? (
        <div className="p-10 sm:p-12 border-2 border-dashed border-[var(--glass-border)] rounded-2xl text-center space-y-3">
          <BookOpen className="w-10 h-10 text-[var(--primary)]/40 mx-auto" />
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {blogPosts.length === 0 ? "No articles yet" : "No articles match this filter"}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            {blogPosts.length === 0
              ? "Publish your first article to fill the Blog section of the site."
              : "Try a different category or clear the search box."}
          </p>
          <button
            type="button"
            onClick={handleCreateNew}
            className="px-4 py-2 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Create new article
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredPosts.map(({ post, index }) => (
            <div
              key={`${index}-${post.slug || post.title}`}
              className="group glass rounded-2xl p-5 border border-[var(--glass-border)] hover:border-[var(--primary)]/40 hover:shadow-lg transition-[border-color,box-shadow] duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 text-[10px] font-bold uppercase rounded-full truncate max-w-[60%]">
                    {post.category || "General"}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--muted-foreground)] flex items-center gap-1 shrink-0">
                    <Clock aria-hidden className="w-3 h-3" />
                    {post.readTime || "5 min"}
                  </span>
                </div>

                <h3 className="text-base font-bold font-display text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                  {post.title || "Untitled Article"}
                </h3>

                <p className="text-xs text-[var(--muted-foreground)] line-clamp-3 leading-relaxed">
                  {post.excerpt || "No summary provided."}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[var(--glass-border)] flex items-center justify-between gap-2">
                <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                  {post.date}
                </span>

                <div className="flex items-center gap-1.5">
                  {post.slug && (
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-[var(--glass-bg)] hover:bg-[var(--primary)]/10 text-[var(--muted-foreground)] hover:text-[var(--primary)] border border-[var(--glass-border)] rounded-lg transition-colors cursor-pointer"
                      aria-label={`Open published article ${post.title || post.slug}`}
                      title="Preview public article"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDuplicate(index)}
                    className="p-1.5 bg-[var(--glass-bg)] hover:bg-[var(--primary)]/10 text-[var(--muted-foreground)] hover:text-[var(--primary)] border border-[var(--glass-border)] rounded-lg transition-colors cursor-pointer"
                    aria-label={`Duplicate ${post.title || "article"}`}
                    title="Duplicate article"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEdit(index)}
                    className="p-1.5 px-2.5 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                    aria-label={`Edit ${post.title || "article"}`}
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(index)}
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-lg transition-colors cursor-pointer"
                    aria-label={`Delete ${post.title || "article"}`}
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ARTICLE COMPOSER */}
      {currentPost && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={editingIndex === -1 ? "Create new article" : "Edit article"}
        >
          <div className="surface-enter w-full max-w-6xl h-[100dvh] sm:h-auto sm:max-h-[92vh] bg-[var(--card)] border border-[var(--glass-border)] rounded-none sm:rounded-3xl overflow-hidden shadow-[0_30px_90px_rgba(15,23,42,0.28)] flex flex-col">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-[var(--glass-border)] bg-[var(--glass-bg)]/60">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-[var(--foreground)] font-display truncate">
                    {editingIndex === -1 ? "Create new article" : "Edit article"}
                  </h3>
                  <p className="text-[11px] text-[var(--muted-foreground)] truncate">
                    Markdown editor with live preview and search snippet check
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div
                  role="tablist"
                  aria-label="Editor view"
                  className="flex items-center gap-0.5 p-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl overflow-x-auto flex-1 sm:flex-none [scrollbar-width:none]"
                >
                  {EDITOR_MODES.map((mode) => {
                    const ModeIcon = mode.icon;
                    const active = editorMode === mode.id;
                    return (
                      <button
                        type="button"
                        key={mode.id}
                        role="tab"
                        aria-selected={active}
                        onClick={() => setEditorMode(mode.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                          active
                            ? "bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white shadow-sm"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        <ModeIcon className="w-3.5 h-3.5" /> {mode.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={closeEditor}
                  aria-label="Close editor"
                  className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--glass-bg)] rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-5">
              {/* Title & Metadata */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-1.5">
                  <label htmlFor="article-title" className={LABEL_CLASS}>
                    <FileText aria-hidden className="w-3.5 h-3.5" /> Article title
                  </label>
                  <input
                    id="article-title"
                    type="text"
                    value={currentPost.title}
                    onChange={(e) => {
                      const titleVal = e.target.value;
                      setCurrentPost({
                        ...currentPost,
                        title: titleVal,
                        slug: currentPost.slug ? currentPost.slug : slugify(titleVal),
                      });
                    }}
                    placeholder="A clear, descriptive headline"
                    className={`${FIELD_CLASS} px-4 py-3 text-sm font-bold`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="article-category" className={LABEL_CLASS}>
                      <Layers aria-hidden className="w-3.5 h-3.5" /> Category
                    </label>
                    <input
                      id="article-category"
                      type="text"
                      value={currentPost.category}
                      onChange={(e) => setCurrentPost({ ...currentPost, category: e.target.value })}
                      placeholder="e.g. Network Engineering"
                      className={`${FIELD_CLASS} px-3 py-3 text-xs font-semibold`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="article-date" className={LABEL_CLASS}>
                      <Calendar aria-hidden className="w-3.5 h-3.5" /> Publish date
                    </label>
                    <input
                      id="article-date"
                      type="date"
                      value={currentPost.date}
                      onChange={(e) => setCurrentPost({ ...currentPost, date: e.target.value })}
                      className={`${FIELD_CLASS} px-3 py-3 text-xs font-semibold`}
                    />
                  </div>
                </div>
              </div>

              {/* Slug & Excerpt */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="article-slug" className={LABEL_CLASS}>
                    <Globe aria-hidden className="w-3.5 h-3.5" /> URL slug
                  </label>
                  <input
                    id="article-slug"
                    type="text"
                    value={currentPost.slug}
                    onChange={(e) =>
                      setCurrentPost({
                        ...currentPost,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                      })
                    }
                    placeholder="article-url-slug"
                    className={`${FIELD_CLASS} px-4 py-2.5 text-xs font-mono text-[var(--primary)]`}
                  />
                  <p className="text-[10px] text-[var(--muted-foreground)] truncate">
                    /blog/{currentPost.slug || slugify(currentPost.title) || "article-url-slug"}
                  </p>
                </div>

                <div className="lg:col-span-2 space-y-1.5">
                  <label htmlFor="article-excerpt" className={LABEL_CLASS}>
                    <Sparkles aria-hidden className="w-3.5 h-3.5" /> Excerpt
                  </label>
                  <input
                    id="article-excerpt"
                    type="text"
                    value={currentPost.excerpt}
                    onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                    placeholder="One or two sentences shown on cards and in search results"
                    className={`${FIELD_CLASS} px-4 py-2.5 text-xs`}
                  />
                  <p className="text-[10px] text-[var(--muted-foreground)]">
                    {currentPost.excerpt.length} characters — 120 to 160 reads best in search results.
                  </p>
                </div>
              </div>

              {editorMode === "seo" ? (
                /* SEARCH RESULT PREVIEW */
                <div className="p-4 sm:p-6 bg-[var(--glass-bg)]/40 border border-[var(--glass-border)] rounded-2xl space-y-5">
                  <div className="flex items-center gap-2 text-[var(--primary)] text-sm font-bold">
                    <Globe className="w-4 h-4" /> Search result preview
                  </div>

                  <div className="p-5 bg-[var(--card)] border border-[var(--glass-border)] rounded-xl max-w-2xl space-y-1 shadow-sm">
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono truncate">
                      https://rajanchand.com.np › blog › {currentPost.slug || "article-slug"}
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--primary)] line-clamp-1">
                      {currentPost.title || "Article title preview"} — Rajan Prakash Chand
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                      {currentPost.excerpt || "Add an excerpt to control the summary shown on Google."}
                    </p>
                  </div>

                  <div className="p-4 bg-[var(--primary)]/5 border border-[var(--primary)]/15 rounded-xl text-xs space-y-2">
                    <p className="font-bold flex items-center gap-1.5 text-[var(--foreground)]">
                      <Check className="w-4 h-4 text-emerald-500" /> Optimisation checklist
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-[var(--muted-foreground)]">
                      <li>
                        Title length: <span className="font-mono text-[var(--primary)]">{currentPost.title.length} characters</span> (aim for 40–60)
                      </li>
                      <li>
                        Excerpt length: <span className="font-mono text-[var(--primary)]">{currentPost.excerpt.length} characters</span> (aim for 120–160)
                      </li>
                      <li>
                        URL: <span className="font-mono text-[var(--primary)]">/blog/{currentPost.slug || slugify(currentPost.title)}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                /* WRITE / SPLIT / PREVIEW */
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-[var(--foreground)] flex items-center gap-1.5">
                      <FileText aria-hidden className="w-3.5 h-3.5 text-[var(--primary)]" /> Article body
                    </span>
                    <div className="flex items-center gap-3 font-mono text-[11px] text-[var(--muted-foreground)]">
                      <span>{stats.words} words</span>
                      <span>{stats.chars} chars</span>
                      <span className="text-[var(--primary)] font-bold">{stats.readTimeMins} min read</span>
                    </div>
                  </div>

                  {/* Markdown toolbar */}
                  {(editorMode === "write" || editorMode === "split") && (
                    <div
                      role="toolbar"
                      aria-label="Markdown formatting"
                      className="flex flex-wrap items-center gap-1 p-2 bg-[var(--glass-bg)]/60 border border-[var(--glass-border)] rounded-t-2xl border-b-0"
                    >
                      <button type="button" onClick={() => insertFormatting("**", "**")} className={TOOL_BUTTON_CLASS} aria-label="Bold" title="Bold (Ctrl+B)">
                        <Bold className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => insertFormatting("*", "*")} className={TOOL_BUTTON_CLASS} aria-label="Italic" title="Italic (Ctrl+I)">
                        <Italic className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => insertFormatting("<u>", "</u>")} className={TOOL_BUTTON_CLASS} aria-label="Underline" title="Underline">
                        <Underline className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => insertFormatting("~~", "~~")} className={TOOL_BUTTON_CLASS} aria-label="Strikethrough" title="Strikethrough">
                        <Strikethrough className="w-4 h-4" />
                      </button>

                      <span aria-hidden className="w-px h-5 bg-[var(--glass-border)] mx-1" />

                      <button type="button" onClick={() => insertFormatting("\n# ", "\n")} className={TOOL_BUTTON_CLASS} aria-label="Heading level 1" title="Heading 1">
                        <Heading1 className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => insertFormatting("\n## ", "\n")} className={TOOL_BUTTON_CLASS} aria-label="Heading level 2" title="Heading 2">
                        <Heading2 className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => insertFormatting("\n### ", "\n")} className={TOOL_BUTTON_CLASS} aria-label="Heading level 3" title="Heading 3">
                        <Heading3 className="w-4 h-4" />
                      </button>

                      <span aria-hidden className="w-px h-5 bg-[var(--glass-border)] mx-1" />

                      <button type="button" onClick={() => insertFormatting("\n- ", "\n")} className={TOOL_BUTTON_CLASS} aria-label="Bulleted list" title="Bulleted list">
                        <List className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => insertFormatting("\n1. ", "\n")} className={TOOL_BUTTON_CLASS} aria-label="Numbered list" title="Numbered list">
                        <ListOrdered className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => insertFormatting("\n> ", "\n")} className={TOOL_BUTTON_CLASS} aria-label="Blockquote" title="Blockquote">
                        <Quote className="w-4 h-4" />
                      </button>

                      <span aria-hidden className="w-px h-5 bg-[var(--glass-border)] mx-1" />

                      <button type="button" onClick={() => insertFormatting("\n```\n", "\n```\n")} className={TOOL_BUTTON_CLASS} aria-label="Code block" title="Code block">
                        <Code className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => insertFormatting("[", "](https://)")} className={TOOL_BUTTON_CLASS} aria-label="Insert link" title="Insert link (Ctrl+K)">
                        <Link2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("\n| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n")}
                        className={TOOL_BUTTON_CLASS}
                        aria-label="Insert table"
                        title="Insert table"
                      >
                        <TableIcon className="w-4 h-4" />
                      </button>

                      <span aria-hidden className="w-px h-5 bg-[var(--glass-border)] mx-1" />

                      <label className={`ml-auto sm:ml-0 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                        uploading
                          ? "bg-[var(--glass-bg)] text-[var(--muted-foreground)] cursor-wait"
                          : "bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] cursor-pointer"
                      }`}>
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <span>{uploading ? "Uploading..." : "Upload file"}</span>
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.webp,.svg,.pdf,.doc,.docx"
                          className="hidden"
                          disabled={uploading}
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>
                  )}

                  {/* Editor / preview panes */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {(editorMode === "write" || editorMode === "split") && (
                      <div className={editorMode === "write" ? "lg:col-span-2" : ""}>
                        <label htmlFor="article-content" className="sr-only">
                          Article body in markdown
                        </label>
                        <textarea
                          id="article-content"
                          ref={textareaRef}
                          rows={16}
                          value={currentPost.content}
                          onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                          onKeyDown={handleEditorShortcut}
                          placeholder="Write your article here. Markdown works, or use the toolbar above."
                          className={`${FIELD_CLASS} p-4 text-sm font-mono leading-relaxed resize-y ${
                            editorMode === "split" ? "rounded-2xl" : "rounded-t-none rounded-b-2xl"
                          }`}
                        />
                      </div>
                    )}

                    {(editorMode === "preview" || editorMode === "split") && (
                      <div
                        className={`p-5 sm:p-6 bg-[var(--glass-bg)]/40 border border-[var(--glass-border)] rounded-2xl overflow-y-auto custom-scrollbar max-h-[500px] ${
                          editorMode === "preview" ? "lg:col-span-2" : ""
                        }`}
                      >
                        <div className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider mb-4 border-b border-[var(--glass-border)] pb-2 flex items-center justify-between gap-2">
                          <span>Live preview</span>
                          <span className="font-normal text-[var(--muted-foreground)] truncate">{currentPost.category}</span>
                        </div>
                        <div className="prose max-w-none">
                          {renderMarkdownPreview(currentPost.content || "")}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-[var(--glass-border)] bg-[var(--glass-bg)]/60">
              {editorError ? (
                <p role="alert" className="flex items-center gap-2 text-xs font-semibold text-rose-500">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {editorError}
                </p>
              ) : (
                <p className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                  <AlertCircle aria-hidden className="w-4 h-4 text-[var(--primary)]" />
                  Publishes once you save changes in the console.
                </p>
              )}

              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="px-4 py-2 border border-[var(--glass-border)] hover:bg-[var(--glass-bg)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCurrent}
                  className="px-6 py-2 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:shadow-[0_0_20px_var(--glow-primary)] text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-[box-shadow,transform] duration-200 cursor-pointer hover:-translate-y-0.5"
                >
                  <Check className="w-4 h-4" /> Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
