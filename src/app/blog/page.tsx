import type { Metadata } from "next";
import { blogPosts, loadPortfolioData } from "@/lib/data";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BackgroundOrbs } from "@/components/background-orbs";
import { BlogClient } from "./blog-client";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights, tutorials, and in-depth articles on network engineering, cybersecurity, ISP infrastructure, and IT research by Rajan Prakash Chand.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog — Rajan Prakash Chand",
    description:
      "Read articles on networking, Zero Trust security, ISP operations, and IT research.",
    url: "/blog",
    type: "website",
  },
};

interface BlogPostItem {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  content?: string;
}

export default async function BlogListing() {
  const data = await loadPortfolioData();
  const posts = (data?.blogPosts || blogPosts) as BlogPostItem[];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)]/30 relative overflow-hidden">
      <BackgroundOrbs />
      <Navbar siteConfig={data?.siteConfig} />
      <BlogClient initialPosts={posts} />
      <Footer siteConfig={data?.siteConfig} socialLinks={data?.socialLinks} />
    </main>
  );
}
