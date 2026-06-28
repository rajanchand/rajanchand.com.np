import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BackgroundOrbs } from "@/components/background-orbs";
import { Hero } from "@/components/sections/hero";
import { Experience } from "@/components/sections/experience";
import { Projects } from "@/components/sections/projects";
import { Skills } from "@/components/sections/skills";
import { Certifications } from "@/components/sections/certifications";
import { Articles } from "@/components/sections/articles";
import { loadPortfolioData } from "@/lib/data";
import { PortfolioSync } from "@/components/portfolio-sync";
import { HomeJsonLd } from "@/components/json-ld";

export default async function Home() {
  const data = await loadPortfolioData();

  return (
    <>
      <HomeJsonLd siteConfig={data?.siteConfig} socialLinks={data?.socialLinks} />
      <PortfolioSync data={data} />
      <BackgroundOrbs />
      <Navbar siteConfig={data?.siteConfig} />
      <main>
        <Hero siteConfig={data?.siteConfig} />
        <Skills skills={data?.skills} />
        <Experience experience={data?.experience} />
        <Projects projects={data?.projects} />
        <Certifications certifications={data?.certifications} />
        <Articles blogPosts={data?.blogPosts} />
      </main>
      <Footer siteConfig={data?.siteConfig} socialLinks={data?.socialLinks} />
    </>
  );
}

