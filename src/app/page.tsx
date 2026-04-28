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

export default async function Home() {
  const data = await loadPortfolioData();

  return (
    <>
      <PortfolioSync data={data} />
      <BackgroundOrbs />
      <Navbar />
      <main>
        <Hero />
        <Skills />
        <Experience />
        <Projects />
        <Certifications />
        <Articles />
      </main>
      <Footer />
    </>
  );
}

