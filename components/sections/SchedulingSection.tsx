import { SectionHeading } from "@/components/SectionHeading";
import { AppointmentForm } from "@/components/scheduling/AppointmentForm";

export function SchedulingSection() {
  return (
    <section
      id="agendamento"
      className="section-pad relative scroll-mt-20 bg-background-secondary"
    >
      <div className="hex-pattern absolute inset-0 opacity-30" aria-hidden />
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-copper to-transparent"
        aria-hidden
      />
      <div className="container relative">
        <SectionHeading
          eyebrow="Agendamento"
          title="Agende seu Atendimento"
          subtitle="Preencha os dados abaixo e nossa equipe confirma o seu horário pelo WhatsApp. Rápido, simples e sem compromisso."
          align="center"
        />

        <div className="mx-auto mt-12 max-w-5xl">
          <AppointmentForm />
        </div>
      </div>
    </section>
  );
}
