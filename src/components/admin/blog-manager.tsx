"use client";

import { useState, useMemo, useRef } from "react";
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

export function BlogManager({ blogPosts = [], onUpdatePosts }: BlogManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editorMode, setEditorMode] = useState<"write" | "split" | "preview" | "seo">("write");

  // Temporary edit state when modal/panel is open
  const [currentPost, setCurrentPost] = useState<BlogPostItem | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Extract categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(blogPosts.map((p) => p.category).filter(Boolean)));
    return ["All", ...cats];
  }, [blogPosts]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesCat = selectedCategory === "All" || post.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        (post.slug && post.slug.toLowerCase().includes(q));

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
  };

  // Open editor for existing post
  const handleEdit = (idx: number) => {
    setCurrentPost({ ...blogPosts[idx] });
    setEditingIndex(idx);
    setEditorMode("write");
  };

  // Save post changes
  const handleSaveCurrent = () => {
    if (!currentPost) return;

    if (!currentPost.title.trim()) {
      alert("Please enter an article title.");
      return;
    }

    const autoSlug = currentPost.slug || currentPost.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const autoReadTime = `${stats.readTimeMins} min read`;

    const finalPost: BlogPostItem = {
      ...currentPost,
      slug: autoSlug,
      readTime: autoReadTime
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
    setEditingIndex(null);
    setCurrentPost(null);
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

  // Selection formatting helper for Word-like toolbar
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

  // Render markdown for preview
  const renderMarkdownPreview = (text: string) => {
    if (!text) return <p className="text-sm italic text-gray-400">No article content written yet.</p>;

    const lines = text.split("\n");
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("# ")) {
        return <h1 key={i} className="text-2xl font-bold font-display mt-6 mb-3 text-white">{trimmed.substring(2)}</h1>;
      }
      if (trimmed.startsWith("## ")) {
        return <h2 key={i} className="text-xl font-bold font-display mt-5 mb-2 text-white border-b border-gray-800 pb-1">{trimmed.substring(3)}</h2>;
      }
      if (trimmed.startsWith("### ")) {
        return <h3 key={i} className="text-lg font-bold font-display mt-4 mb-2 text-gray-200">{trimmed.substring(4)}</h3>;
      }
      if (trimmed.startsWith("> ")) {
        return <blockquote key={i} className="border-l-4 border-purple-500 pl-4 py-1.5 my-3 italic text-gray-300 bg-purple-500/10 rounded-r">{trimmed.substring(2)}</blockquote>;
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return <li key={i} className="ml-5 list-disc text-sm text-gray-300 my-1">{trimmed.substring(2)}</li>;
      }
      if (trimmed.startsWith("```")) {
        return <pre key={i} className="bg-gray-950 p-3 rounded-lg text-xs font-mono text-purple-300 my-3 overflow-x-auto border border-gray-800"><code>{trimmed.replace(/```/g, "")}</code></pre>;
      }
      if (trimmed === "") return <div key={i} className="h-3" />;
      return <p key={i} className="text-sm text-gray-300 leading-relaxed mb-3">{line}</p>;
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-[var(--foreground)]">Blog Article Manager</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Compose, edit, formatting toolbar & Google SEO preview</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-xs font-mono font-bold">
            {blogPosts.length} Articles
          </span>
          <button
            onClick={handleCreateNew}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" /> Compose New Article
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-purple-500 text-white border-transparent shadow-sm"
                  : "bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Article Cards Grid */}
      {filteredPosts.length === 0 ? (
        <div className="p-12 border-2 border-dashed border-[var(--glass-border)] rounded-2xl text-center space-y-3">
          <BookOpen className="w-10 h-10 text-purple-400/50 mx-auto" />
          <p className="text-sm font-semibold text-[var(--muted-foreground)]">No articles found matching criteria</p>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Create New Article
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post) => {
            const origIdx = blogPosts.findIndex((p) => p.slug === post.slug || p.title === post.title);
            return (
              <div
                key={post.slug || post.title}
                className="group glass rounded-2xl p-5 border border-[var(--glass-border)] hover:border-purple-500/40 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold uppercase rounded-full">
                      {post.category || "General"}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--muted-foreground)] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime || "5 min"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold font-display text-[var(--foreground)] group-hover:text-purple-400 transition-colors line-clamp-2">
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
                        className="p-1.5 bg-[var(--glass-bg)] hover:bg-purple-500/20 text-[var(--muted-foreground)] hover:text-purple-400 border border-[var(--glass-border)] rounded-lg transition-colors cursor-pointer"
                        title="Preview Public Article"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDuplicate(origIdx)}
                      className="p-1.5 bg-[var(--glass-bg)] hover:bg-purple-500/20 text-[var(--muted-foreground)] hover:text-purple-400 border border-[var(--glass-border)] rounded-lg transition-colors cursor-pointer"
                      title="Duplicate Article"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleEdit(origIdx)}
                      className="p-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold px-2.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(origIdx)}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL MS-WORD / MEDIUM STYLE EDITOR MODAL */}
      {currentPost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-6xl max-h-[94vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    {editingIndex === -1 ? "Create New Article" : "Edit Article Studio"}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    MS Word-Style Editor with Live Preview & SEO Optimizer
                  </p>
                </div>
              </div>

              {/* Editor View Modes Switcher */}
              <div className="flex items-center gap-2">
                <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
                  <button
                    onClick={() => setEditorMode("write")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      editorMode === "write" ? "bg-purple-600 text-white shadow-sm" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Write
                  </button>
                  <button
                    onClick={() => setEditorMode("split")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      editorMode === "split" ? "bg-purple-600 text-white shadow-sm" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" /> Split
                  </button>
                  <button
                    onClick={() => setEditorMode("preview")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      editorMode === "preview" ? "bg-purple-600 text-white shadow-sm" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <button
                    onClick={() => setEditorMode("seo")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      editorMode === "seo" ? "bg-purple-600 text-white shadow-sm" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" /> SEO
                  </button>
                </div>

                <button
                  onClick={() => {
                    setCurrentPost(null);
                    setEditingIndex(null);
                  }}
                  className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Title & Metadata Top Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Article Title */}
                <div className="lg:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Article Title
                  </label>
                  <input
                    type="text"
                    value={currentPost.title}
                    onChange={(e) => {
                      const titleVal = e.target.value;
                      const slugVal = titleVal.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                      setCurrentPost({ ...currentPost, title: titleVal, slug: currentPost.slug ? currentPost.slug : slugVal });
                    }}
                    placeholder="Enter descriptive article title..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* Category & Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" /> Category
                    </label>
                    <input
                      type="text"
                      value={currentPost.category}
                      onChange={(e) => setCurrentPost({ ...currentPost, category: e.target.value })}
                      placeholder="Category"
                      className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Publish Date
                    </label>
                    <input
                      type="date"
                      value={currentPost.date}
                      onChange={(e) => setCurrentPost({ ...currentPost, date: e.target.value })}
                      className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Slug Route & Excerpt */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> URL Slug Route
                  </label>
                  <input
                    type="text"
                    value={currentPost.slug}
                    onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                    placeholder="article-url-slug"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-purple-300 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div className="lg:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Excerpt / Summary (Short preview text)
                  </label>
                  <input
                    type="text"
                    value={currentPost.excerpt}
                    onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                    placeholder="Short 1-2 sentence overview for card list and search meta..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {/* VIEW MODES RENDERING */}
              {editorMode === "seo" ? (
                /* GOOGLE SERP PREVIEW MODE */
                <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-6">
                  <div className="flex items-center gap-2 text-purple-400 text-sm font-bold">
                    <Globe className="w-4 h-4" /> Google Search SERP Result Snippet Preview
                  </div>

                  {/* Google Card Simulation */}
                  <div className="p-5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl max-w-2xl space-y-1 shadow-sm">
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono truncate">
                      https://rajanchand.com.np › blog › {currentPost.slug || "article-slug"}
                    </div>
                    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer line-clamp-1">
                      {currentPost.title || "Article Title Preview"} — Rajan Prakash Chand
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {currentPost.excerpt || "Please add a concise excerpt summary to display here on Google search results."}
                    </p>
                  </div>

                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs text-purple-300 space-y-2">
                    <p className="font-bold flex items-center gap-1">
                      <Check className="w-4 h-4 text-emerald-400" /> SEO Checklist Optimization:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-300">
                      <li>Title length: <span className="font-mono text-purple-400">{currentPost.title.length} characters</span> (Optimal: 40–60 chars)</li>
                      <li>Meta description: <span className="font-mono text-purple-400">{currentPost.excerpt.length} characters</span> (Optimal: 120–160 chars)</li>
                      <li>URL structure: <span className="font-mono text-purple-400">/blog/{currentPost.slug}</span></li>
                    </ul>
                  </div>
                </div>
              ) : (
                /* WRITE / SPLIT / PREVIEW MODES */
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="font-bold text-purple-400 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> Word-Style Article Editor
                    </span>
                    <div className="flex items-center gap-3 font-mono text-[11px] text-gray-400">
                      <span>{stats.words} words</span>
                      <span>{stats.chars} chars</span>
                      <span className="text-purple-400 font-bold">{stats.readTimeMins} min read</span>
                    </div>
                  </div>

                  {/* MS-Word Style Toolbar */}
                  {(editorMode === "write" || editorMode === "split") && (
                    <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-950 border border-slate-800 rounded-t-2xl border-b-0">
                      {/* Bold */}
                      <button
                        type="button"
                        onClick={() => insertFormatting("**", "**")}
                        className="p-1.5 hover:bg-slate-800 text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Bold (Ctrl+B)"
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      {/* Italic */}
                      <button
                        type="button"
                        onClick={() => insertFormatting("*", "*")}
                        className="p-1.5 hover:bg-slate-800 text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Italic (Ctrl+I)"
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      {/* Underline */}
                      <button
                        type="button"
                        onClick={() => insertFormatting("<u>", "</u>")}
                        className="p-1.5 hover:bg-slate-800 text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Underline"
                      >
                        <Underline className="w-4 h-4" />
                      </button>
                      {/* Strikethrough */}
                      <button
                        type="button"
                        onClick={() => insertFormatting("~~", "~~")}
                        className="p-1.5 hover:bg-slate-800 text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Strikethrough"
                      >
                        <Strikethrough className="w-4 h-4" />
                      </button>

                      <div className="w-[1px] h-5 bg-slate-800 mx-1" />

                      {/* Headings */}
                      <button
                        type="button"
                        onClick={() => insertFormatting("\n# ", "\n")}
                        className="p-1.5 hover:bg-slate-800 text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Heading 1"
                      >
                        <Heading1 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("\n## ", "\n")}
                        className="p-1.5 hover:bg-slate-800 text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Heading 2"
                      >
                        <Heading2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("\n### ", "\n")}
                        className="p-1.5 hover:bg-slate-800 text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Heading 3"
                      >
                        <Heading3 className="w-4 h-4" />
                      </button>

                      <div className="w-[1px] h-5 bg-slate-800 mx-1" />

                      {/* Lists & Quotes */}
                      <button
                        type="button"
                        onClick={() => insertFormatting("\n- ", "\n")}
                        className="p-1.5 hover:bg-slate-800 text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Bulleted List"
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("\n1. ", "\n")}
                        className="p-1.5 hover:bg-slate-800 text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Numbered List"
                      >
                        <ListOrdered className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("\n> ", "\n")}
                        className="p-1.5 hover:bg-slate-800 text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Blockquote"
                      >
                        <Quote className="w-4 h-4" />
                      </button>

                      <div className="w-[1px] h-5 bg-slate-800 mx-1" />

                      {/* Code Block */}
                      <button
                        type="button"
                        onClick={() => insertFormatting("\n```\n", "\n```\n")}
                        className="p-1.5 hover:bg-slate-800 text-purple-400 hover:text-purple-300 rounded-lg transition-colors cursor-pointer"
                        title="Code Block"
                      >
                        <Code className="w-4 h-4" />
                      </button>
                      {/* Link */}
                      <button
                        type="button"
                        onClick={() => insertFormatting("[", "](https://)")}
                        className="p-1.5 hover:bg-slate-800 text-purple-400 hover:text-purple-300 rounded-lg transition-colors cursor-pointer"
                        title="Add Link"
                      >
                        <Link2 className="w-4 h-4" />
                      </button>
                      {/* Table */}
                      <button
                        type="button"
                        onClick={() => insertFormatting("\n| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n")}
                        className="p-1.5 hover:bg-slate-800 text-purple-400 hover:text-purple-300 rounded-lg transition-colors cursor-pointer"
                        title="Insert Table Template"
                      >
                        <TableIcon className="w-4 h-4" />
                      </button>

                      <div className="w-[1px] h-5 bg-slate-800 mx-1" />

                      {/* File Uploader */}
                      <label className="p-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold">
                        <Upload className="w-4 h-4" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.webp,.svg,.pdf,.doc,.docx"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            const formData = new FormData();
                            formData.append("file", file);
                            try {
                              const res = await fetch("/api/admin/upload", {
                                method: "POST",
                                body: formData
                              });
                              if (res.ok) {
                                const result = await res.json();
                                if (result.success) {
                                  const isImg = [".png", ".jpg", ".jpeg", ".webp", ".svg"].some((ext) =>
                                    result.url.toLowerCase().endsWith(ext)
                                  );
                                  const isPdf = result.url.toLowerCase().endsWith(".pdf");
                                  const markdown = isImg
                                    ? `\n![${result.name}](${result.url})\n`
                                    : isPdf
                                    ? `\n[📕 PDF Document: ${result.name}](${result.url})\n`
                                    : `\n[📄 Attachment: ${result.name}](${result.url})\n`;
                                  insertFormatting(markdown);
                                } else {
                                  alert(result.error || "Upload failed");
                                }
                              } else {
                                const err = await res.json();
                                alert(err.error || "Upload failed");
                              }
                            } catch (error) {
                              console.error(error);
                              alert("Network error uploading file");
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}

                  {/* Main Editor Body: Write vs Split vs Preview */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {(editorMode === "write" || editorMode === "split") && (
                      <div className={editorMode === "write" ? "lg:col-span-2" : ""}>
                        <textarea
                          ref={textareaRef}
                          rows={16}
                          value={currentPost.content}
                          onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                          placeholder="Type your article body here... Use Markdown formatting or the toolbar buttons above."
                          className={`w-full p-4 bg-slate-950 border border-slate-800 ${
                            editorMode === "split" ? "rounded-2xl" : "rounded-b-2xl"
                          } text-sm font-mono text-gray-200 focus:outline-none focus:border-purple-500 transition-colors leading-relaxed`}
                        />
                      </div>
                    )}

                    {(editorMode === "preview" || editorMode === "split") && (
                      <div
                        className={`p-6 bg-slate-950 border border-slate-800 rounded-2xl overflow-y-auto max-h-[500px] ${
                          editorMode === "preview" ? "lg:col-span-2" : ""
                        }`}
                      >
                        <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2 flex items-center justify-between">
                          <span>Live Article Preview</span>
                          <span className="font-normal text-gray-400">{currentPost.category}</span>
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

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <AlertCircle className="w-4 h-4 text-purple-400" />
                <span>Changes will be updated when saved to database</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPost(null);
                    setEditingIndex(null);
                  }}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-gray-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCurrent}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                >
                  <Check className="w-4 h-4" /> Save Article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
