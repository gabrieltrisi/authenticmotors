import { Car, Check } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { ServiceCard } from "@/components/ServiceCard";
import { PriceTag } from "@/components/PriceTag";
import { ButtonLink } from "@/components/ui/button";
import { CAR_PLANS, ENGINE_WASH } from "@/lib/data";
import { whatsappLink } from "@/lib/whatsapp";

export function CarsSection() {
  return (
    <section id="carros" className="section-pad relative scroll-mt-20">
      <div className="hex-pattern absolute inset-0 opacity-30" aria-hidden />
      <div className="container relative">
        <SectionHeading
          eyebrow="Carros"
          title="Tratamentos para Carros"
          subtitle="Escolha o tratamento ideal para o seu veículo. Preços por porte: Sedan/Hatch e SUV."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CAR_PLANS.map((plan) => (
            <ServiceCard key={plan.id} plan={plan} />
          ))}
        </div>

        {/* Lavagem de Motor — destaque horizontal */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-copper bg-background-secondary/80 backdrop-blur-sm">
          <div className="grid gap-8 p-7 md:grid-cols-[auto_1fr_auto] md:items-center md:p-9">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-copper-gradient shadow-copper">
                <Car className="h-7 w-7 text-white" />
              </span>
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-copper-light">
                  {ENGINE_WASH.eyebrow}
                </span>
                <h3 className="font-display text-2xl font-extrabold uppercase text-white">
                  {ENGINE_WASH.title}
                </h3>
              </div>
            </div>

            <ul className="grid gap-2.5 sm:grid-cols-2">
              {ENGINE_WASH.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-foreground-muted"
                >
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-copper-light"
                    strokeWidth={3}
                  />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-col items-stretch gap-4 md:w-64">
              <PriceTag price={ENGINE_WASH.price} />
              <ButtonLink
                href={whatsappLink(ENGINE_WASH.whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                size="md"
                className="w-full"
              >
                Tenho Interesse
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
