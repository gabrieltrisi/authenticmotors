import { Lightbulb, Armchair, CloudRain, Check, type LucideIcon } from "lucide-react";
import type { AdditionalService } from "@/types";
import { SectionHeading } from "@/components/SectionHeading";
import { ButtonLink } from "@/components/ui/button";
import { PriceTag } from "@/components/PriceTag";
import { ADDITIONAL_SERVICES } from "@/lib/data";
import { whatsappLink } from "@/lib/whatsapp";

/** Ícone associado a cada serviço adicional pelo id. */
const ICONS: Record<string, LucideIcon> = {
  "restauracao-farois": Lightbulb,
  "higienizacao-bancos": Armchair,
  "chuva-acida": CloudRain,
};

export function AdditionalSection() {
  return (
    <section id="adicionais" className="section-pad relative scroll-mt-20">
      <div className="hex-pattern absolute inset-0 opacity-30" aria-hidden />
      <div className="container relative">
        <SectionHeading
          eyebrow="Extras"
          title="Serviços Adicionais"
          subtitle="Complemente o tratamento do seu veículo com serviços especializados."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ADDITIONAL_SERVICES.map((service) => (
            <AdditionalCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}

function AdditionalCard({ service }: { service: AdditionalService }) {
  const Icon = ICONS[service.id] ?? Lightbulb;

  return (
    <article className="group flex flex-col rounded-2xl border border-copper bg-background-secondary/80 p-7 shadow-card backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-copper-light/50">
      <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-copper-gradient shadow-copper transition-transform duration-500 group-hover:scale-105">
        <Icon className="h-7 w-7 text-white" />
      </span>

      <h3 className="mt-5 font-display text-xl font-extrabold uppercase text-white">
        {service.title}
      </h3>
      {service.description && (
        <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
          {service.description}
        </p>
      )}

      {service.benefits && (
        <ul className="mt-5 space-y-2.5">
          {service.benefits.map((b) => (
            <li
              key={b}
              className="flex items-start gap-2.5 text-sm text-foreground-muted"
            >
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-copper-light"
                strokeWidth={3}
              />
              {b}
            </li>
          ))}
        </ul>
      )}

      <PriceTag price={service.price} className="mt-auto pt-6" />

      <ButtonLink
        href={whatsappLink(service.whatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        variant="outline"
        size="md"
        className="mt-6 w-full"
      >
        Tenho Interesse
      </ButtonLink>
    </article>
  );
}
