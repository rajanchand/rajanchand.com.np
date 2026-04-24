import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BackgroundOrbs } from "@/components/background-orbs";
import { Hero } from "@/components/sections/hero";
import { Services } from "@/components/sections/services";
import { Experience } from "@/components/sections/experience";
import { Projects } from "@/components/sections/projects";
import { Skills } from "@/components/sections/skills";
import { Testimonials } from "@/components/sections/testimonials";
import { Certifications } from "@/components/sections/certifications";
import { Articles } from "@/components/sections/articles";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      <BackgroundOrbs />
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Experience />
        <Projects />
        <Skills />
        <Certifications />
        <Testimonials />
        <Articles />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
