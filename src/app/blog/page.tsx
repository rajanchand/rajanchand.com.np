import { blogPosts, loadPortfolioData } from "@/lib/data";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BackgroundOrbs } from "@/components/background-orbs";
import { BlogClient } from "./blog-client";

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
      <Navbar />
      <BlogClient initialPosts={posts} />
      <Footer />
    </main>
  );
}
