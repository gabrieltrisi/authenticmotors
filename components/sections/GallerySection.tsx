import Image from "next/image";
import { ArrowLeftRight } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { GALLERY_ITEMS } from "@/lib/data";
import { cn } from "@/lib/utils";

export function GallerySection() {
  return (
    <section
      id="galeria"
      className="section-pad relative scroll-mt-20 bg-background-secondary"
    >
      <div className="hex-pattern absolute inset-0 opacity-30" aria-hidden />
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-copper to-transparent"
        aria-hidden
      />
      <div className="container relative">
        <SectionHeading
          eyebrow="Galeria"
          title="Antes e Depois"
          subtitle="Resultados reais do nosso trabalho. Cada detalhe pensado para entregar o máximo de brilho e proteção."
          align="center"
        />

        {/* 2 colunas: o "Antes" e o "Depois" do mesmo carro ficam lado a lado */}
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 sm:gap-6">
          {GALLERY_ITEMS.map((item) => (
            <figure
              key={item.id}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-copper bg-background shadow-card"
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.label}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 45vw, 360px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0">
                  <div className="hex-pattern absolute inset-0 opacity-70" aria-hidden />
                  <div className="relative flex h-full items-center justify-center">
                    <ArrowLeftRight className="h-8 w-8 text-copper-light/70" />
                  </div>
                </div>
              )}

              {/* leve escurecimento nas bordas para destacar o selo */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/20"
                aria-hidden
              />

              {/* selo Antes / Depois */}
              <span
                className={cn(
                  "absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur sm:left-4 sm:top-4",
                  item.label === "Depois"
                    ? "bg-copper-gradient text-white shadow-copper"
                    : "border border-copper bg-background/70 text-foreground-muted"
                )}
              >
                {item.label}
              </span>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
