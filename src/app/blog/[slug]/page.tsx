import type { Metadata } from "next";
import { blogPosts, siteConfig, loadPortfolioData } from "@/lib/data";

export async function generateStaticParams() {
  const data = await loadPortfolioData();
  const posts = (data?.blogPosts || blogPosts) as { slug: string }[];
  return posts.map((post) => ({ slug: post.slug }));
}
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BackgroundOrbs } from "@/components/background-orbs";
import { ArrowLeft, Clock, Calendar, User, Share2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortfolioSync } from "@/components/portfolio-sync";
import { BlogPostJsonLd } from "@/components/json-ld";

interface BlogPostItem {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  content?: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadPortfolioData();
  const posts = (data?.blogPosts || blogPosts) as BlogPostItem[];
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  const resolvedSiteConfig = data?.siteConfig || siteConfig;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      authors: [resolvedSiteConfig.name],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [resolvedSiteConfig.profileImage || "/images/rajan-jpg-1780267497062.jpg"],
    },
  };
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIdx = parseInt(month, 10) - 1;
  const formattedMonth = months[monthIdx] || month;
  return `${formattedMonth} ${parseInt(day, 10)}, ${year}`;
}

// Custom simple markdown renderer that is safe, fast, and works server-side
function renderMarkdown(content: string) {
  if (!content) return null;
  
  const lines = content.split("\n");
  const renderedElements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  const flushList = (key: number) => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${key}`} className="list-disc pl-6 mb-6 space-y-2 text-[var(--muted-foreground)] leading-relaxed">
          {listItems.map((item, i) => (
            <li key={i}>{parseInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const parseInlineMarkdown = (text: string) => {
    // Basic bold **text** and inline code `code`
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts: React.ReactNode[] = [];
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
    return parts.length > 0 ? parts : text;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      flushList(index);
      if (inCodeBlock) {
        // Close code block
        renderedElements.push(
          <pre key={`code-${index}`} className="bg-[var(--muted)] p-4 rounded-xl overflow-x-auto my-6 text-xs md:text-sm font-mono border border-[var(--glass-border)]">
            <code>{codeBlockLines.join("\n")}</code>
          </pre>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

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
    } else if (trimmed.startsWith("> ")) {
      flushList(index);
      renderedElements.push(
        <blockquote key={index} className="border-l-4 border-[var(--primary)] pl-4 py-2 my-6 italic text-[var(--muted-foreground)] bg-[var(--primary)]/5 rounded-r-lg">
          {parseInlineMarkdown(trimmed.substring(2))}
        </blockquote>
      );
    } else if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      listItems.push(trimmed.substring(2));
    } else if (trimmed === "") {
      flushList(index);
    } else {
      flushList(index);
      renderedElements.push(
        <p key={index} className="text-sm md:text-base text-[var(--muted-foreground)] leading-relaxed mb-6">
          {parseInlineMarkdown(trimmed)}
        </p>
      );
    }
  });

  flushList(lines.length);
  return renderedElements;
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const data = await loadPortfolioData();
  const posts = (data?.blogPosts || blogPosts) as BlogPostItem[];
  
  const post = posts.find((p) => p.slug === slug);
  
  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)]/30 relative overflow-hidden">
      <BlogPostJsonLd
        title={post.title}
        description={post.excerpt}
        datePublished={post.date}
        slug={post.slug}
        siteConfig={data?.siteConfig}
      />
      <PortfolioSync data={data} />
      <BackgroundOrbs />
      <Navbar siteConfig={data?.siteConfig} />

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
              <time dateTime={post.date}>{formatDate(post.date)}</time>
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
              Published by <span className="font-semibold text-[var(--foreground)]">{data?.siteConfig?.name || siteConfig.name}</span>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 glass rounded-xl text-xs font-semibold hover:border-[var(--primary)]/30 transition-all cursor-pointer">
              <Share2 className="w-3.5 h-3.5" />
              Share Article
            </button>
          </div>
        </article>
      </div>

      <Footer siteConfig={data?.siteConfig} socialLinks={data?.socialLinks} />
    </main>
  );
}
