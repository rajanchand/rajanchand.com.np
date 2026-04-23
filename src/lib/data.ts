import staticData from "./data.json";

let data = staticData;

// On the server, read the file dynamically to bypass the Node.js module cache
// and ensure fresh values propagate immediately on revalidatePath
if (typeof window === "undefined") {
  try {
    const fs = require("fs");
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

export const siteConfig = data.siteConfig;
export const stats = data.stats;
export const services = data.services;
export const experience = data.experience as any[];
export const projects = data.projects;
export const skills = data.skills;
export const certifications = data.certifications;
export const testimonials = data.testimonials;
export const blogPosts = data.blogPosts;
export const dissertions = data.dissertions;
export const socialLinks = data.socialLinks;
export const navLinks = data.navLinks;
