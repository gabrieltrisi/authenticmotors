import { cn } from "@/lib/utils";

type Tone = "neutral" | "positive" | "negative" | "warning";

const TONE_VALUE: Record<Tone, string> = {
  neutral: "text-white",
  positive: "text-emerald-300",
  negative: "text-red-300",
  warning: "text-amber-300",
};

/**
 * Card de métrica do painel administrativo (visual premium cobre/escuro).
 * Reutilizado nos cards principais do dashboard.
 */
export function AdminSummaryCard({
  icon: Icon,
  label,
  value,
  tone = "neutral",
  hint,
  loading = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  tone?: Tone;
  hint?: string;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-copper bg-background-secondary/70 p-5 backdrop-blur">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-copper bg-background/40 text-copper-light">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-[11px] uppercase tracking-wider text-foreground-muted">
          {label}
        </p>
        {loading ? (
          <div className="mt-2 h-6 w-20 animate-pulse rounded bg-white/10" />
        ) : (
          <p
            className={cn(
              "mt-1 font-display text-xl font-extrabold",
              TONE_VALUE[tone]
            )}
          >
            {value}
          </p>
        )}
        {hint && !loading && (
          <p className="mt-0.5 text-[11px] text-foreground-muted/70">{hint}</p>
        )}
      </div>
    </div>
  );
}
