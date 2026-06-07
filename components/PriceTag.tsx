import type { Price } from "@/types";
import { formatBRL } from "@/lib/utils";
import { cn } from "@/lib/utils";

/**
 * Renderiza o bloco de preço no estilo das "pílulas" cobre do catálogo,
 * tratando os três formatos: único, por veículo e por variação nomeada.
 */
export function PriceTag({
  price,
  className,
}: {
  price: Price;
  className?: string;
}) {
  if (price.kind === "single") {
    return (
      <div className={cn("flex", className)}>
        <span className="inline-flex items-baseline rounded-lg bg-copper-gradient px-4 py-2 text-xl font-bold text-white shadow-copper">
          {formatBRL(price.value)}
        </span>
      </div>
    );
  }

  if (price.kind === "vehicle") {
    return (
      <div className={cn("grid grid-cols-2 gap-3", className)}>
        <PriceCell label="Sedan / Hatch" hint="carro pequeno" value={price.sedan} />
        <PriceCell label="SUV" hint="carro grande" value={price.suv} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-3",
        price.tiers.length === 3 ? "grid-cols-3" : "grid-cols-2",
        className
      )}
    >
      {price.tiers.map((t) => (
        <PriceCell key={t.label} label={t.label} value={t.value} />
      ))}
    </div>
  );
}

function PriceCell({
  label,
  hint,
  value,
}: {
  label: string;
  hint?: string;
  value: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="text-[11px] font-medium uppercase tracking-wider text-foreground-muted">
        {label}
        {hint && (
          <span className="block text-[9px] normal-case text-foreground-muted/70">
            ({hint})
          </span>
        )}
      </span>
      <span className="w-full rounded-lg bg-copper-gradient px-2 py-1.5 text-sm font-bold text-white shadow-copper sm:text-base">
        {formatBRL(value)}
      </span>
    </div>
  );
}
