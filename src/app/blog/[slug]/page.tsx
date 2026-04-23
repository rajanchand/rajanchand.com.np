import { blogPosts, siteConfig } from "@/lib/data";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BackgroundOrbs } from "@/components/background-orbs";
import { ArrowLeft, Clock, Calendar, User, Share2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Custom simple markdown renderer that is safe, fast, and works server-side
function renderMarkdown(content: string) {
  if (!content) return null;
  
  const lines = content.split("\n");
  let inList = false;
  const renderedElements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (key: number) => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${key}`} className="list-disc pl-6 mb-6 space-y-2 text-[var(--muted-foreground)] leading-relaxed">
          {listItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    if (trimmed.startsWith("# ")) {
      flushList(index);
      renderedElements.push(
        <h1 key={index} className="text-3xl md:text-4xl font-extrabold font-[family-name:var(--font-outfit)] mt-8 mb-4 bg-gradient-to-r from-[var(--foreground)] to-[var(--primary)] bg-clip-text text-transparent">
          {trimmed.substring(2)}
        </h1>
      );
    } else if (trimmed.startsWith("## ")) {
      flushList(index);
      renderedElements.push(
        <h2 key={index} className="text-2xl font-bold font-[family-name:var(--font-outfit)] mt-6 mb-3 text-[var(--foreground)] border-b border-[var(--glass-border)] pb-2">
          {trimmed.substring(3)}
        </h2>
      );
    } else if (trimmed.startsWith("### ")) {
      flushList(index);
      renderedElements.push(
        <h3 key={index} className="text-xl font-bold font-[family-name:var(--font-outfit)] mt-5 mb-2 text-[var(--foreground)]">
          {trimmed.substring(4)}
        </h3>
      );
    } else if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      inList = true;
      listItems.push(trimmed.substring(2));
    } else if (trimmed === "") {
      flushList(index);
    } else {
      flushList(index);
      // Process bold/italics
      let text = trimmed;
      // Basic bold transformation: **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIdx = 0;
      let match;
      
      while ((match = boldRegex.exec(text)) !== null) {
        if (match.index > lastIdx) {
          parts.push(text.substring(lastIdx, match.index));
        }
        parts.push(<strong key={match.index} className="font-bold text-[var(--foreground)]">{match[1]}</strong>);
        lastIdx = boldRegex.lastIndex;
      }
      if (lastIdx < text.length) {
        parts.push(text.substring(lastIdx));
      }

      renderedElements.push(
        <p key={index} className="text-sm md:text-base text-[var(--muted-foreground)] leading-relaxed mb-6">
          {parts.length > 0 ? parts : text}
        </p>
      );
    }
  });

  flushList(lines.length);
  return renderedElements;
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  
  const post = blogPosts.find((p: any) => p.slug === slug);
  
  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)]/30 relative overflow-hidden">
      <BackgroundOrbs />
      <Navbar />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 md:pb-28">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Articles
          </Link>
        </div>

        {/* Article Header */}
        <article className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-[300px] h-[300px] bg-[var(--primary)] rounded-full opacity-[0.03] blur-[80px] pointer-events-none" />

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs text-[var(--muted-foreground)] mb-6 border-b border-[var(--glass-border)] pb-6">
            <span className="px-3 py-1 font-bold tracking-wider uppercase rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
              {post.category}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {post.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              Rajan Chand
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-extrabold font-[family-name:var(--font-outfit)] leading-tight mb-8">
            {post.title}
          </h1>

          {/* Excerpt Banner */}
          <div className="p-4 rounded-xl bg-[var(--primary)]/5 border-l-4 border-[var(--primary)] text-sm md:text-base text-[var(--muted-foreground)] italic mb-10">
            {post.excerpt}
          </div>

          {/* Content */}
          <div className="prose max-w-none">
            {renderMarkdown(post.content || "")}
          </div>

          {/* Share / Footer */}
          <div className="mt-12 pt-8 border-t border-[var(--glass-border)] flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-[var(--muted-foreground)]">
              Published by <span className="font-semibold text-[var(--foreground)]">{siteConfig.name}</span>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 glass rounded-xl text-xs font-semibold hover:border-[var(--primary)]/30 transition-all cursor-pointer">
              <Share2 className="w-3.5 h-3.5" />
              Share Article
            </button>
          </div>
        </article>
      </div>

      <Footer />
    </main>
  );
}
