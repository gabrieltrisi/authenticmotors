import { cn } from "@/lib/utils";

/**
 * Cabeçalho de seção no padrão do catálogo: etiqueta cobre + título display
 * sublinhado por uma régua cobre. Centralizável.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-copper-light">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-2 font-display text-3xl font-extrabold uppercase leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
        {title}
      </h2>
      <div
        className={cn("copper-rule mt-4", align === "center" && "mx-auto")}
      />
      {subtitle && (
        <p className="mt-5 text-base leading-relaxed text-foreground-muted md:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
