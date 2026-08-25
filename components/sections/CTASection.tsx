import { MessageCircle, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { whatsappLink, DEFAULT_WHATSAPP_MESSAGE } from "@/lib/whatsapp";

export function CTASection() {
  return (
    <section className="section-pad relative overflow-hidden">
      <div className="container relative">
        <div className="relative overflow-hidden rounded-3xl border border-copper-light/50 bg-background-secondary px-6 py-16 text-center shadow-copper-lg sm:px-12 md:py-20">
          {/* fundo */}
          <div className="hex-pattern absolute inset-0 opacity-60" aria-hidden />
          <div
            className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-copper/25 blur-[100px]"
            aria-hidden
          />
          <div
            className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-copper-dark/25 blur-[100px]"
            aria-hidden
          />

          <div className="relative mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-copper bg-background/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-copper-light backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Authentic Motors
            </span>

            <h2 className="mt-6 font-display text-3xl font-extrabold uppercase leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              Seu veículo merece um{" "}
              <span className="text-gradient-copper">tratamento premium</span>
            </h2>

            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-foreground-muted md:text-lg">
              Fale agora com nossa equipe e agende seu atendimento. Atendimento
              rápido e personalizado pelo WhatsApp.
            </p>

            <div className="mt-9 flex justify-center">
              <ButtonLink
                href={whatsappLink(DEFAULT_WHATSAPP_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
                className="px-10"
              >
                <MessageCircle className="h-5 w-5" />
                Chamar no WhatsApp
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
