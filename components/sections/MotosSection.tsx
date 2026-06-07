import { SectionHeading } from "@/components/SectionHeading";
import { ServiceCard } from "@/components/ServiceCard";
import { MOTO_PLANS } from "@/lib/data";

export function MotosSection() {
  return (
    <section
      id="motos"
      className="section-pad relative scroll-mt-20 bg-background-secondary"
    >
      <div className="hex-pattern absolute inset-0 opacity-30" aria-hidden />
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-copper to-transparent"
        aria-hidden
      />
      <div className="container relative">
        <SectionHeading
          eyebrow="Motos"
          title="Tratamentos para Motos"
          subtitle="Cuidado completo e acabamento técnico também para a sua moto."
        />

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          {MOTO_PLANS.map((plan) => (
            <ServiceCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
