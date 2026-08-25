"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  CalendarClock,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertTriangle,
  Inbox,
  ArrowRight,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminSummaryCard } from "@/components/admin/AdminSummaryCard";
import {
  fetchAdminAppointments,
  STATUS_META,
  type AdminAppointment,
} from "@/lib/admin";
import {
  fetchMovements,
  summarize,
  formatBRL,
  formatDateBR,
  todayISODate,
  PAYMENT_META,
  TYPE_META,
  type CashMovement,
} from "@/lib/caixa";

type Status = "loading" | "ready" | "error";

/** "YYYY-MM-DD" -> "DD/MM/AAAA" (mesma referência de "hoje" do caixa). */
function isoToBR(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** Converte data BR (DD/MM/AAAA) + horário (HH:MM) em Date local. */
function parseBR(data: string, horario: string): Date {
  const [d, m, y] = data.split("/").map(Number);
  const [hh, mm] = (horario || "00:00").split(":").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0);
}

export function AdminDashboard() {
  const todayISO = todayISODate();
  const todayBR = isoToBR(todayISO);

  const [appts, setAppts] = useState<AdminAppointment[]>([]);
  const [apptStatus, setApptStatus] = useState<Status>("loading");

  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [cashStatus, setCashStatus] = useState<Status>("loading");

  const loadAppts = useCallback(async () => {
    setApptStatus("loading");
    try {
      const { items } = await fetchAdminAppointments();
      setAppts(items);
      setApptStatus("ready");
    } catch {
      setApptStatus("error");
    }
  }, []);

  const loadCash = useCallback(async () => {
    setCashStatus("loading");
    try {
      setMovements(await fetchMovements(todayISO));
      setCashStatus("ready");
    } catch {
      setCashStatus("error");
    }
  }, [todayISO]);

  const loadAll = useCallback(() => {
    loadAppts();
    loadCash();
  }, [loadAppts, loadCash]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const pendingCount = useMemo(
    () => appts.filter((a) => a.status === "pendente").length,
    [appts]
  );
  const todayCount = useMemo(
    () => appts.filter((a) => a.data === todayBR).length,
    [appts, todayBR]
  );
  const upcoming = useMemo(() => {
    const startOfToday = parseBR(todayBR, "00:00").getTime();
    return [...appts]
      .filter((a) => parseBR(a.data, a.horario).getTime() >= startOfToday)
      .sort(
        (a, b) =>
          parseBR(a.data, a.horario).getTime() -
          parseBR(b.data, b.horario).getTime()
      )
      .slice(0, 5);
  }, [appts, todayBR]);

  const totals = useMemo(() => summarize(movements), [movements]);
  const lastMovements = useMemo(() => movements.slice(0, 5), [movements]);

  const cashLoading = cashStatus === "loading";
  const apptLoading = apptStatus === "loading";

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
                  Visão Geral
                </h1>
                <p className="text-[11px] uppercase tracking-wider text-copper-light">
                  Painel administrativo
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadAll}
              disabled={apptLoading || cashLoading}
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4",
                  (apptLoading || cashLoading) && "animate-spin"
                )}
              />
              Atualizar
            </Button>
          </div>
          <AdminNav />
        </div>
      </header>

      <main className="container relative space-y-8 py-8">
        {/* Cards principais */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <AdminSummaryCard
            icon={CalendarClock}
            label="Agend. pendentes"
            value={apptStatus === "error" ? "—" : pendingCount}
            tone="warning"
            loading={apptLoading}
            hint={apptStatus === "error" ? "Erro ao carregar" : undefined}
          />
          <AdminSummaryCard
            icon={CalendarDays}
            label="Agend. de hoje"
            value={apptStatus === "error" ? "—" : todayCount}
            loading={apptLoading}
            hint={apptStatus === "error" ? "Erro ao carregar" : todayBR}
          />
          <AdminSummaryCard
            icon={TrendingUp}
            label="Entradas do dia"
            value={cashStatus === "error" ? "—" : formatBRL(totals.entradas)}
            tone="positive"
            loading={cashLoading}
            hint={cashStatus === "error" ? "Erro ao carregar" : undefined}
          />
          <AdminSummaryCard
            icon={TrendingDown}
            label="Saídas do dia"
            value={cashStatus === "error" ? "—" : formatBRL(totals.saidas)}
            tone="negative"
            loading={cashLoading}
            hint={cashStatus === "error" ? "Erro ao carregar" : undefined}
          />
          <AdminSummaryCard
            icon={Wallet}
            label="Saldo do dia"
            value={cashStatus === "error" ? "—" : formatBRL(totals.saldo)}
            tone={totals.saldo >= 0 ? "neutral" : "negative"}
            loading={cashLoading}
          />
        </section>

        {/* Seções */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Próximos agendamentos */}
          <Panel
            title="Próximos agendamentos"
            href="/admin/agendamentos"
            linkLabel="Ver agendamentos"
          >
            {apptStatus === "loading" && <ListSkeleton />}
            {apptStatus === "error" && (
              <PanelState
                icon={AlertTriangle}
                text="Não foi possível carregar os agendamentos."
              />
            )}
            {apptStatus === "ready" && upcoming.length === 0 && (
              <PanelState icon={Inbox} text="Nenhum agendamento próximo." />
            )}
            {apptStatus === "ready" && upcoming.length > 0 && (
              <ul className="divide-y divide-copper/30">
                {upcoming.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-3 px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">{a.nome}</p>
                      <p className="truncate text-xs text-foreground-muted">
                        {a.servico}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="whitespace-nowrap text-xs text-foreground-muted">
                        {a.data} · {a.horario}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                          STATUS_META[a.status].className
                        )}
                      >
                        {STATUS_META[a.status].label}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {/* Resumo financeiro */}
          <Panel
            title="Resumo financeiro"
            href="/admin/caixa"
            linkLabel="Ver caixa"
          >
            {/* mini-resumo */}
            <div className="grid grid-cols-3 gap-3 px-5 py-4">
              <MiniStat
                label="Entradas"
                value={cashStatus === "error" ? "—" : formatBRL(totals.entradas)}
                tone="positive"
                loading={cashLoading}
              />
              <MiniStat
                label="Saídas"
                value={cashStatus === "error" ? "—" : formatBRL(totals.saidas)}
                tone="negative"
                loading={cashLoading}
              />
              <MiniStat
                label="Saldo"
                value={cashStatus === "error" ? "—" : formatBRL(totals.saldo)}
                tone={totals.saldo >= 0 ? "neutral" : "negative"}
                loading={cashLoading}
              />
            </div>

            <div className="border-t border-copper/30">
              <p className="px-5 pt-3 text-[11px] uppercase tracking-wider text-foreground-muted">
                Últimos lançamentos
              </p>
              {cashStatus === "loading" && <ListSkeleton />}
              {cashStatus === "error" && (
                <PanelState
                  icon={AlertTriangle}
                  text="Não foi possível carregar o caixa."
                />
              )}
              {cashStatus === "ready" && lastMovements.length === 0 && (
                <PanelState icon={Inbox} text="Nenhum lançamento hoje." />
              )}
              {cashStatus === "ready" && lastMovements.length > 0 && (
                <ul className="divide-y divide-copper/30">
                  {lastMovements.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between gap-3 px-5 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">
                          {m.description}
                        </p>
                        <p className="truncate text-xs text-foreground-muted">
                          {formatDateBR(m.movementDate)} ·{" "}
                          {PAYMENT_META[m.paymentMethod]}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 whitespace-nowrap text-sm font-semibold",
                          m.type === "ENTRY"
                            ? "text-emerald-300"
                            : "text-red-300"
                        )}
                      >
                        {m.type === "ENTRY" ? "+" : "−"}
                        {formatBRL(m.amount)}
                        <span className="sr-only">
                          {" "}
                          {TYPE_META[m.type].label}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Panel>
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponentes                                                    */
/* ------------------------------------------------------------------ */

function Panel({
  title,
  href,
  linkLabel,
  children,
}: {
  title: string;
  href: string;
  linkLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-copper bg-background-secondary/70 backdrop-blur">
      <div className="flex items-center justify-between border-b border-copper/40 px-5 py-4">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-white">
          {title}
        </h2>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-semibold text-copper-light transition-colors hover:text-white"
        >
          {linkLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      {children}
    </section>
  );
}

function MiniStat({
  label,
  value,
  tone,
  loading,
}: {
  label: string;
  value: string;
  tone: "neutral" | "positive" | "negative";
  loading: boolean;
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-300"
      : tone === "negative"
        ? "text-red-300"
        : "text-white";
  return (
    <div className="rounded-xl border border-copper/60 bg-background/40 px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wider text-foreground-muted">
        {label}
      </p>
      {loading ? (
        <div className="mt-1.5 h-4 w-16 animate-pulse rounded bg-white/10" />
      ) : (
        <p className={cn("mt-1 text-sm font-bold", toneClass)}>{value}</p>
      )}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="divide-y divide-copper/20">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between px-5 py-3.5">
          <div className="space-y-1.5">
            <div className="h-3.5 w-32 animate-pulse rounded bg-white/10" />
            <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
          </div>
          <div className="h-5 w-16 animate-pulse rounded-full bg-white/10" />
        </div>
      ))}
    </div>
  );
}

function PanelState({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-copper bg-background/40 text-copper-light">
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-sm text-foreground-muted">{text}</p>
    </div>
  );
}
