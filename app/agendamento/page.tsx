import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { SchedulingSection } from "@/components/sections/SchedulingSection";

export const metadata: Metadata = {
  title: "Agendamento",
  description:
    "Agende online o tratamento estético do seu carro ou moto na Authentic Motors. Confirmação rápida pelo WhatsApp.",
  alternates: { canonical: "/agendamento" },
};

export default function AgendamentoPage() {
  return (
    <>
      <Header />
      <main className="pt-16 md:pt-20">
        <SchedulingSection />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
