import Image from "next/image";
import { MessageCircle, ArrowDown, Sparkles, ShieldCheck, Star } from "lucide-react";
import { ButtonLink, Button } from "@/components/ui/button";
import { whatsappLink, DEFAULT_WHATSAPP_MESSAGE } from "@/lib/whatsapp";

const HIGHLIGHTS = [
  { icon: Sparkles, label: "Acabamento profissional" },
  { icon: ShieldCheck, label: "Proteção duradoura" },
  { icon: Star, label: "Carros e motos" },
];

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-24"
    >
      {/* Camadas de fundo automotivo */}
      <div className="absolute inset-0 bg-dark-radial" aria-hidden />
      <div className="hex-pattern absolute inset-0 opacity-60" aria-hidden />
      <div
        className="absolute -left-40 top-1/4 h-[480px] w-[480px] rounded-full bg-copper/20 blur-[120px]"
        aria-hidden
      />
      <div
        className="absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full bg-copper-dark/20 blur-[120px]"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"
        aria-hidden
      />

      <div className="container relative grid items-center gap-14 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Conteúdo */}
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-copper bg-background-secondary/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-copper-light backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-copper-light" />
            Detalhamento Automotivo
          </span>

          <h1 className="mt-6 font-display text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl xl:text-7xl">
            Estética
            <br />
            Automotiva
            <br />
            <span className="text-gradient-copper">Premium</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground-muted md:text-lg">
            Tratamentos automotivos especializados para carros e motos com
            acabamento profissional e proteção duradoura.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink
              href={whatsappLink(DEFAULT_WHATSAPP_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
            >
              <MessageCircle className="h-5 w-5" />
              Agendar pelo WhatsApp
            </ButtonLink>
            <a href="#servicos">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Ver Serviços
                <ArrowDown className="h-4 w-4" />
              </Button>
            </a>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 text-sm text-foreground-muted"
              >
                <Icon className="h-4 w-4 text-copper-light" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Painel visual premium com foto real */}
        <div className="relative animate-fade-in [animation-delay:200ms]">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl border border-copper bg-background-secondary shadow-copper-lg">
            <Image
              src="/images/hero.jpg"
              alt="Polimento técnico premium na Authentic Motors"
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 40vw"
              className="object-cover"
            />
            {/* overlays para leitura e tom cobre */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-gradient-to-br from-copper/15 via-transparent to-copper-dark/20"
              aria-hidden
            />
            {/* legenda */}
            <div className="absolute inset-x-0 bottom-0 p-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-copper bg-background/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-copper-light backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Alto Padrão
              </span>
              <p className="mt-3 font-display text-xl font-extrabold uppercase text-white">
                Polimento & Proteção
              </p>
              <p className="mt-1 text-xs leading-relaxed text-foreground-muted">
                Snow Foam · Enceramento técnico · Cristalização · Polimento
              </p>
            </div>
          </div>

          {/* selo flutuante */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-2xl border border-copper bg-background/90 px-6 py-3 text-center shadow-copper backdrop-blur">
            <p className="font-display text-2xl font-extrabold text-gradient-copper">
              100%
            </p>
            <p className="text-[11px] uppercase tracking-wider text-foreground-muted">
              Detalhamento
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
