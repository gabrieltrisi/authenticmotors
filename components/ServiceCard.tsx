import { Check, Crown } from "lucide-react";
import type { ServicePlan } from "@/types";
import { ButtonLink } from "@/components/ui/button";
import { PriceTag } from "@/components/PriceTag";
import { whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/**
 * Card de plano (Carros / Motos). O plano em destaque (Nível 3) recebe
 * borda cobre intensa, selo "Mais Completo" e leve elevação.
 */
export function ServiceCard({ plan }: { plan: ServicePlan }) {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-background-secondary/80 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 sm:p-7",
        plan.featured
          ? "border-copper-light/60 shadow-copper-lg ring-1 ring-copper-light/30"
          : "border-copper shadow-card hover:border-copper-light/50"
      )}
    >
      {/* brilho cobre superior */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-copper-light to-transparent transition-opacity",
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
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-copper-light">
          {plan.eyebrow}
        </span>
        <h3 className="mt-1 font-display text-2xl font-extrabold uppercase text-white">
          {plan.title}
        </h3>
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

      <ButtonLink
        href={whatsappLink(plan.whatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        variant={plan.featured ? "primary" : "outline"}
        size="lg"
        className="mt-8 w-full"
      >
        Tenho Interesse
      </ButtonLink>
    </article>
  );
}
