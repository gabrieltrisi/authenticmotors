"use client";

import { useState } from "react";
import { Check, Crown, RotateCw, RotateCcw } from "lucide-react";
import type { ServicePlan } from "@/types";
import { ButtonLink } from "@/components/ui/button";
import { PriceTag } from "@/components/PriceTag";
import { whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/**
 * Card de plano com FLIP 3D: a frente mostra tudo (itens + CTA) e o botão ↻
 * gira o card para o verso — uma face focada em "agendar agora".
 */
export function ServiceCard({ plan }: { plan: ServicePlan }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="group h-full [perspective:1600px]">
      <div
        className={cn(
          "relative h-full transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] [transform-style:preserve-3d]",
          flipped && "[transform:rotateY(180deg)]"
        )}
      >
        {/* ---------- FRENTE ---------- */}
        <article
          className={cn(
            "relative flex h-full flex-col overflow-hidden rounded-2xl border bg-background-secondary/80 p-6 backdrop-blur-sm [backface-visibility:hidden] sm:p-7",
            plan.featured
              ? "border-copper-light/60 shadow-copper-lg ring-1 ring-copper-light/30"
              : "border-copper shadow-card"
          )}
        >
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-copper-light to-transparent",
              plan.featured ? "opacity-100" : "opacity-40 group-hover:opacity-100"
            )}
          />

          {plan.featured && (
            <div className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-copper-gradient px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-copper">
              <Crown className="h-3.5 w-3.5" />
              Mais Completo
            </div>
          )}

          <header>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-copper-light">{plan.eyebrow}</span>
            <h3 className="mt-1 font-display text-2xl font-extrabold uppercase text-white">{plan.title}</h3>
            {plan.badge && (
              <span className="mt-2 inline-block rounded-full border border-copper px-3 py-0.5 text-xs font-medium text-foreground-muted">
                {plan.badge}
              </span>
            )}
          </header>

          <PriceTag price={plan.price} className="mt-6" />

          <ul className="mt-7 flex-1 space-y-3">
            {plan.items.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-foreground-muted">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-copper/15 text-copper-light">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-center gap-2">
            <ButtonLink
              href={whatsappLink(plan.whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              variant={plan.featured ? "primary" : "outline"}
              size="lg"
              className="flex-1"
            >
              Tenho Interesse
            </ButtonLink>
            <button
              type="button"
              onClick={() => setFlipped(true)}
              aria-label="Girar o card"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-copper text-copper-light transition hover:bg-copper/15"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          </div>
        </article>

        {/* ---------- VERSO ---------- */}
        <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-copper-light/60 bg-gradient-to-br from-copper/25 via-background-secondary to-background p-7 text-center shadow-copper-lg [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-copper-light">{plan.eyebrow}</span>
          <h3 className="mt-2 font-display text-2xl font-extrabold uppercase text-white">{plan.title}</h3>
          <div className="my-5">
            <PriceTag price={plan.price} />
          </div>
          <p className="mb-6 text-sm leading-relaxed text-foreground-muted">
            Garanta seu horário agora — acabamento premium para o seu veículo. ✨
          </p>
          <ButtonLink
            href={whatsappLink(plan.whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            size="lg"
            className="w-full"
          >
            Agendar pelo WhatsApp
          </ButtonLink>
          <button
            type="button"
            onClick={() => setFlipped(false)}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-copper-light transition hover:text-copper"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
