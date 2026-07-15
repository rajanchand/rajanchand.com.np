import staticData from "./data.json";

let data = staticData;

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
  if (newData.socialLinks) syncArray(socialLinks, newData.socialLinks);
  if (newData.navLinks) syncArray(navLinks, newData.navLinks);
}

// Server-side loader to fetch portfolio data directly from Supabase with local fallback
export async function loadPortfolioData() {
  if (typeof window !== "undefined") return;

  try {
    const { supabase } = await import("@/lib/supabase");
    const { data: dbData, error } = await supabase
      .from("portfolio")
      .select("content")
      .eq("id", 1)
      .maybeSingle();

    if (!error && dbData && dbData.content) {
      const content = { ...dbData.content };
      delete content._adminPasswordHash;
      updatePortfolioData(content);
      return content;
    }
  } catch (err) {
    console.error("Error loading portfolio data from Supabase:", err);
  }

  // If there's an error or no database record, the preloaded staticData values are already in the exports
  return data;
}

