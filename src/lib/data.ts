import { cache } from "react";
import staticData from "./data.json";

let data = staticData;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedMemoryData: any = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds
const FETCH_TIMEOUT_MS = 2500; // 2.5 seconds max wait for Supabase

// On the server, read the file dynamically to bypass the Node.js module cache
// and ensure fresh values propagate immediately on revalidatePath
if (typeof window === "undefined") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("path");
    const dataFilePath = path.join(process.cwd(), "src/lib/data.json");
    if (fs.existsSync(dataFilePath)) {
      const fileContent = fs.readFileSync(dataFilePath, "utf8");
      data = JSON.parse(fileContent);
    }
  } catch (err) {
    console.error("Error reading fresh data.json dynamically:", err);
  }
}

export const siteConfig = { ...data.siteConfig };
export const stats = [...data.stats];
export const services = [...data.services];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const experience = [...(data.experience || [])] as any[];
export const projects = [...(data.projects || [])];
export const skills = [...(data.skills || [])];
export const certifications = [...(data.certifications || [])];
export const testimonials = [...(data.testimonials || [])];
export const blogPosts = [...(data.blogPosts || [])];
export const dissertions = [...(data.dissertations || [])];
export const demos = [...(((data as { demos?: unknown[] }).demos) || [])] as Array<Record<string, unknown>>;
export const socialLinks = [...(data.socialLinks || [])];
export const navLinks = [...(data.navLinks || [])];

// Helper to mutate standard singleton exported objects and arrays in-place
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function updatePortfolioData(newData: any) {
  if (!newData) return;

  if (newData.siteConfig) {
    // Clear existing keys and copy new ones
    for (const key in siteConfig) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (siteConfig as any)[key];
    }
    Object.assign(siteConfig, newData.siteConfig);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const syncArray = (target: any[], source: any[]) => {
    if (Array.isArray(target) && Array.isArray(source)) {
      target.length = 0;
      target.push(...source);
    }
  };

  if (newData.stats) syncArray(stats, newData.stats);
  if (newData.services) syncArray(services, newData.services);
  if (newData.experience) syncArray(experience, newData.experience);
  if (newData.projects) syncArray(projects, newData.projects);
  if (newData.skills) syncArray(skills, newData.skills);
  if (newData.certifications) syncArray(certifications, newData.certifications);
  if (newData.testimonials) syncArray(testimonials, newData.testimonials);
  if (newData.blogPosts) syncArray(blogPosts, newData.blogPosts);
  if (newData.dissertations) syncArray(dissertions, newData.dissertations);
  if (newData.demos) syncArray(demos, newData.demos);
  if (newData.socialLinks) syncArray(socialLinks, newData.socialLinks);
  if (newData.navLinks) syncArray(navLinks, newData.navLinks);
}

// Server-side loader to fetch portfolio data directly from Supabase with local fallback & caching
export const loadPortfolioData = cache(async function loadPortfolioDataInternal() {
  if (typeof window !== "undefined") return;

  const now = Date.now();

  // Return fresh in-memory cached data if still within TTL
  if (cachedMemoryData && now - lastFetchTime < CACHE_TTL_MS) {
    updatePortfolioData(cachedMemoryData);
    return cachedMemoryData;
  }

  try {
    const { supabase } = await import("@/lib/supabase");

    const fetchPromise = supabase
      .from("portfolio")
      .select("content")
      .eq("id", 1)
      .maybeSingle();

    const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error("Supabase fetch timeout") }), FETCH_TIMEOUT_MS)
    );

    const result = await Promise.race([fetchPromise, timeoutPromise]);
    const dbData = result.data;
    const error = result.error;

    if (!error && dbData && dbData.content) {
      const content = { ...dbData.content };
      delete content._adminPasswordHash;
      delete content._adminUsername;
      cachedMemoryData = content;
      lastFetchTime = now;
      updatePortfolioData(content);
      return content;
    }
  } catch (err) {
    console.error("Error loading portfolio data from Supabase:", err);
  }

  // Fallback to in-memory cached data if available or disk data
  if (cachedMemoryData) {
    updatePortfolioData(cachedMemoryData);
    return cachedMemoryData;
  }

  return data;
});


