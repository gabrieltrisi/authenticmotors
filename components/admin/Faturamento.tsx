"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  AlertTriangle,
  Inbox,
  TrendingUp,
  Receipt,
  CreditCard,
  Tag,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminNav } from "@/components/admin/AdminNav";
import {
  fetchMovementsForPeriod,
  summarizeRevenue,
  formatBRL,
  todayISODate,
  currentISOMonth,
  formatPeriodLabel,
  type CashMovement,
  type Period,
  type PeriodMode,
  type RevenueGroup,
} from "@/lib/caixa";

type LoadState = "loading" | "ready" | "error";

/**
 * Painel de Faturamento: mostra o valor bruto que entrou (somatório das
 * entradas) no período, com quebra por forma de pagamento e por categoria.
 * Por padrão abre no modo mensal — faturamento costuma ser acompanhado por mês.
 */
export function Faturamento() {
  const [mode, setMode] = useState<PeriodMode>("month");
  const [day, setDay] = useState<string>(todayISODate());
  const [month, setMonth] = useState<string>(currentISOMonth());
  const [items, setItems] = useState<CashMovement[]>([]);
  const [state, setState] = useState<LoadState>("loading");

  const period = useMemo<Period>(
    () =>
      mode === "month"
        ? { mode: "month", value: month }
        : { mode: "day", value: day },
    [mode, day, month]
  );

  const load = useCallback(async (p: Period) => {
    setState("loading");
    try {
      const data = await fetchMovementsForPeriod(p);
      setItems(data);
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    load(period);
  }, [period, load]);

  const revenue = useMemo(() => summarizeRevenue(items), [items]);

  return (
    <div className="min-h-screen bg-background">
      <div className="hex-pattern fixed inset-0 opacity-30" aria-hidden />

      {/* Top bar */}
      <header className="relative border-b border-copper bg-background-secondary/80 backdrop-blur">
        <div className="container">
          <div className="flex h-16 items-center justify-between md:h-20">
            <div className="flex items-center gap-3">
              <Logo withWordmark={false} size={36} />
              <div className="leading-tight">
                <h1 className="font-display text-lg font-extrabold uppercase text-white">
                  Faturamento
                </h1>
                <p className="text-[11px] uppercase tracking-wider text-copper-light">
                  Painel administrativo
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => load(period)}
              disabled={state === "loading"}
            >
              <RefreshCw
                className={cn("h-4 w-4", state === "loading" && "animate-spin")}
              />
              Atualizar
            </Button>
          </div>
          <AdminNav />
        </div>
      </header>

      <main className="container relative py-8">
        {/* Filtro por período */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-full border border-copper p-0.5">
              {(["day", "month"] as PeriodMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  aria-pressed={mode === m ? "true" : "false"}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                    mode === m
                      ? "bg-copper/20 text-white"
                      : "text-foreground-muted hover:text-white"
                  )}
                >
                  {m === "day" ? "Dia" : "Mês"}
                </button>
              ))}
            </div>

            {mode === "day" ? (
              <input
                type="date"
                aria-label="Dia"
                value={day}
                onChange={(e) => setDay(e.target.value || todayISODate())}
                className="rounded-full border border-copper bg-background/60 px-4 py-2 text-sm text-white outline-none focus:border-copper-light focus:ring-2 focus:ring-copper/30"
              />
            ) : (
              <input
                type="month"
                aria-label="Mês"
                value={month}
                onChange={(e) => setMonth(e.target.value || currentISOMonth())}
                className="rounded-full border border-copper bg-background/60 px-4 py-2 text-sm text-white outline-none focus:border-copper-light focus:ring-2 focus:ring-copper/30"
              />
            )}

            <span className="text-xs uppercase tracking-wider text-foreground-muted">
              {formatPeriodLabel(period)}
            </span>
          </div>

          {/* Indicadores principais */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MetricCard
              icon={TrendingUp}
              label="Faturamento bruto"
              value={formatBRL(revenue.gross)}
              highlight
            />
            <MetricCard
              icon={Receipt}
              label="Entradas registradas"
              value={String(revenue.count)}
            />
            <MetricCard
              icon={CreditCard}
              label="Ticket médio"
              value={formatBRL(revenue.average)}
            />
          </div>
        </div>

        {state === "loading" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        )}

        {state === "error" && (
          <EmptyState
            icon={AlertTriangle}
            title="Erro ao carregar"
            text="Não foi possível buscar o faturamento. Verifique a conexão e tente novamente."
            action={
              <Button variant="outline" size="sm" onClick={() => load(period)}>
                <RefreshCw className="h-4 w-4" />
                Tentar novamente
              </Button>
            }
          />
        )}

        {state === "ready" && revenue.count === 0 && (
          <EmptyState
            icon={Inbox}
            title="Sem faturamento no período"
            text={
              mode === "day"
                ? "Não há entradas registradas para o dia selecionado."
                : "Não há entradas registradas para o mês selecionado."
            }
          />
        )}

        {state === "ready" && revenue.count > 0 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <BreakdownCard
              icon={CreditCard}
              title="Por forma de pagamento"
              groups={revenue.byPayment}
              total={revenue.gross}
            />
            <BreakdownCard
              icon={Tag}
              title="Por categoria"
              groups={revenue.byCategory}
              total={revenue.gross}
            />
          </div>
        )}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponentes                                                    */
/* ------------------------------------------------------------------ */

function MetricCard({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border bg-background-secondary/70 p-5 backdrop-blur",
        highlight ? "border-copper-light" : "border-copper"
      )}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-copper bg-background/40 text-copper-light">
        <Icon className="h-5 w-5" />
      </span>
      <div className="leading-tight">
        <p className="text-[11px] uppercase tracking-wider text-foreground-muted">
          {label}
        </p>
        <p
          className={cn(
            "mt-1 font-display text-xl font-extrabold",
            highlight ? "text-emerald-300" : "text-white"
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function BreakdownCard({
  icon: Icon,
  title,
  groups,
  total,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  groups: RevenueGroup[];
  total: number;
}) {
  return (
    <section className="rounded-2xl border border-copper bg-background-secondary/70 p-5 backdrop-blur">
      <h2 className="mb-4 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-white">
        <Icon className="h-4 w-4 text-copper-light" />
        {title}
      </h2>
      <ul className="flex flex-col gap-3">
        {groups.map((g) => {
          const pct = total > 0 ? (g.total / total) * 100 : 0;
          return (
            <li key={g.key}>
              <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate font-medium text-white">
                  {g.label}
                  <span className="ml-1.5 text-xs text-foreground-muted">
                    ({g.count})
                  </span>
                </span>
                <span className="shrink-0 font-semibold text-emerald-300">
                  {formatBRL(g.total)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-copper-light"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-[11px] text-foreground-muted">
                  {pct.toFixed(0)}%
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-copper bg-background-secondary/70 p-5">
      <div className="mb-4 h-4 w-40 animate-pulse rounded bg-white/10" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-6 w-full animate-pulse rounded bg-white/10" />
        ))}
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-copper bg-background-secondary/70 px-6 py-16 text-center backdrop-blur">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-copper bg-background/40 text-copper-light">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="font-display text-lg font-bold uppercase text-white">
        {title}
      </h3>
      <p className="max-w-sm text-sm text-foreground-muted">{text}</p>
      {action}
    </div>
  );
}
