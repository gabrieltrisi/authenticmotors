import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { Hero } from "@/components/sections/Hero";
import { CarsSection } from "@/components/sections/CarsSection";
import { MotosSection } from "@/components/sections/MotosSection";
import { AdditionalSection } from "@/components/sections/AdditionalSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { SchedulingSection } from "@/components/sections/SchedulingSection";
import { CTASection } from "@/components/sections/CTASection";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        {/* Âncora da navegação "Serviços" */}
        <div id="servicos" className="scroll-mt-20" />
        <CarsSection />
        <MotosSection />
        <AdditionalSection />
        <GallerySection />
        <SchedulingSection />
        <CTASection />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
