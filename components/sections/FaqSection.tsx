"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { SITE } from "@/lib/config";
import { cn } from "@/lib/utils";

const FAQ: { q: string; a: string }[] = [
  {
    q: "Vocês atendem carros e motos?",
    a: "Sim! Temos tratamentos específicos para carros (com preço por porte — Sedan/Hatch e SUV) e para motos, além de serviços adicionais como restauração de faróis, higienização de bancos e remoção de chuva ácida.",
  },
  {
    q: "Como faço para agendar?",
    a: "É rápido: fale pelo WhatsApp ou use o assistente de chat aqui no site — escolha o serviço, a data e o horário, e nossa equipe confirma com você.",
  },
  {
    q: "Preciso agendar ou posso chegar direto?",
    a: "Recomendamos agendar para garantir seu horário e evitar espera — trabalhamos com hora marcada para entregar o melhor acabamento em cada veículo.",
  },
  {
    q: "Quanto custa?",
    a: "Depende do serviço e do porte do veículo. Os tratamentos de carro começam em R$ 55 e os de moto em R$ 30 — veja todos os valores na seção de Serviços aqui no site.",
  },
  {
    q: "Onde vocês ficam?",
    a: `Estamos na ${SITE.address.full}. Você encontra a localização no mapa aqui no site.`,
  },
  {
    q: "Qual o horário de funcionamento?",
    a: `Nosso horário é ${SITE.hours}.`,
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="section-pad relative scroll-mt-20 bg-background-secondary">
      <div className="hex-pattern absolute inset-0 opacity-30" aria-hidden />
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-copper to-transparent"
        aria-hidden
      />
      <div className="container relative">
        <SectionHeading
          eyebrow="Dúvidas"
          title="Perguntas Frequentes"
          subtitle="Tudo que você precisa saber antes de agendar."
          align="center"
        />

        <Reveal className="mx-auto mt-12 max-w-3xl space-y-3">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="overflow-hidden rounded-2xl border border-copper bg-background/60">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-copper/5 sm:px-6"
                >
                  <span className="font-display text-base font-bold uppercase tracking-wide text-white sm:text-lg">
                    {item.q}
                  </span>
                  <ChevronDown className={cn("h-5 w-5 shrink-0 text-copper-light transition-transform duration-300", isOpen && "rotate-180")} />
                </button>
                <div className={cn("grid transition-all duration-300 ease-out", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-foreground-muted sm:px-6">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
