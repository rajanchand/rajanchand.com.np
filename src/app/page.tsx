import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BackgroundOrbs } from "@/components/background-orbs";
import { Hero } from "@/components/sections/hero";
import { Experience } from "@/components/sections/experience";
import { Skills } from "@/components/sections/skills";
import { Certifications } from "@/components/sections/certifications";

import { Articles } from "@/components/sections/articles";
import { Contact } from "@/components/sections/contact";
import { loadPortfolioData } from "@/lib/data";
import { PortfolioSync } from "@/components/portfolio-sync";
import { HomeJsonLd } from "@/components/json-ld";
import { ScrollToTop } from "@/components/scroll-to-top";

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
        <Experience experience={data?.experience} projects={data?.projects} />
        <Certifications certifications={data?.certifications} />

        <Articles blogPosts={data?.blogPosts} />
        <Contact siteConfig={data?.siteConfig} socialLinks={data?.socialLinks} />
      </main>
      <Footer siteConfig={data?.siteConfig} socialLinks={data?.socialLinks} />
      <ScrollToTop />
    </>
  );
}

