"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, AlertTriangle, Inbox, Info } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  fetchAppointments,
  STATUS_META,
  IS_USING_MOCK,
  type AppointmentRecord,
  type AppointmentStatus,
} from "@/lib/admin";

type LoadState = "loading" | "ready" | "error";

const STATUS_FILTERS: Array<{ value: "todos" | AppointmentStatus; label: string }> = [
  { value: "todos", label: "Todos" },
  { value: "pendente", label: "Pendentes" },
  { value: "confirmado", label: "Confirmados" },
  { value: "concluido", label: "Concluídos" },
  { value: "cancelado", label: "Cancelados" },
];

export function AppointmentsAdmin() {
  const [items, setItems] = useState<AppointmentRecord[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [filter, setFilter] = useState<"todos" | AppointmentStatus>("todos");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setState("loading");
    try {
      const data = await fetchAppointments();
      setItems(data);
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return items.filter((a) => {
      const okStatus = filter === "todos" || a.status === filter;
      const okQuery =
        !query.trim() ||
        a.nome.toLowerCase().includes(query.trim().toLowerCase()) ||
        a.servico.toLowerCase().includes(query.trim().toLowerCase());
      return okStatus && okQuery;
    });
  }, [items, filter, query]);

  return (
    <div className="min-h-screen bg-background">
      <div className="hex-pattern fixed inset-0 opacity-30" aria-hidden />

      {/* Top bar */}
      <header className="relative border-b border-copper bg-background-secondary/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between md:h-20">
          <div className="flex items-center gap-3">
            <Logo withWordmark={false} size={36} />
            <div className="leading-tight">
              <h1 className="font-display text-lg font-extrabold uppercase text-white">
                Agendamentos
              </h1>
              <p className="text-[11px] uppercase tracking-wider text-copper-light">
                Painel administrativo
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={load}
            disabled={state === "loading"}
          >
            <RefreshCw
              className={cn("h-4 w-4", state === "loading" && "animate-spin")}
            />
            Atualizar
          </Button>
        </div>
      </header>

      <main className="container relative py-8">
        {/* aviso de origem dos dados */}
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-copper bg-background-secondary/70 px-4 py-3 text-sm text-foreground-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-copper-light" />
          {IS_USING_MOCK ? (
            <span>
              Exibindo <strong className="text-white">dados de exemplo</strong>.
              Configure{" "}
              <code className="text-copper-light">NEXT_PUBLIC_ADMIN_API_URL</code>{" "}
              para consumir a API real.
            </span>
          ) : (
            <span>
              Exibindo <strong className="text-white">dados reais via n8n</strong>.
            </span>
          )}
        </div>

        {/* Controles */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
                  filter === f.value
                    ? "border-copper-light bg-copper/15 text-white"
                    : "border-copper text-foreground-muted hover:text-white"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome ou serviço…"
              className="w-full rounded-full border border-copper bg-background/60 py-2 pl-9 pr-4 text-sm text-white placeholder:text-foreground-muted/50 outline-none focus:border-copper-light focus:ring-2 focus:ring-copper/30"
            />
          </div>
        </div>

        {/* Conteúdo */}
        <div className="overflow-hidden rounded-2xl border border-copper bg-background-secondary/70 backdrop-blur">
          {state === "loading" && <TableSkeleton />}

          {state === "error" && (
            <EmptyState
              icon={AlertTriangle}
              title="Erro ao carregar"
              text="Não foi possível buscar os agendamentos. Verifique a API e tente novamente."
              action={
                <Button variant="outline" size="sm" onClick={load}>
                  <RefreshCw className="h-4 w-4" />
                  Tentar novamente
                </Button>
              }
            />
          )}

          {state === "ready" && filtered.length === 0 && (
            <EmptyState
              icon={Inbox}
              title="Nenhum agendamento"
              text={
                items.length === 0
                  ? "Ainda não há agendamentos registrados."
                  : "Nenhum resultado para o filtro/busca atual."
              }
            />
          )}

          {state === "ready" && filtered.length > 0 && (
            <AppointmentsTable items={filtered} />
          )}
        </div>

        {state === "ready" && (
          <p className="mt-4 text-xs text-foreground-muted/70">
            {filtered.length} de {items.length} agendamento(s)
          </p>
        )}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tabela                                                             */
/* ------------------------------------------------------------------ */

function AppointmentsTable({ items }: { items: AppointmentRecord[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-copper text-[11px] uppercase tracking-wider text-foreground-muted">
            <th className="px-5 py-4 font-semibold">Nome</th>
            <th className="px-5 py-4 font-semibold">Serviço</th>
            <th className="px-5 py-4 font-semibold">Data</th>
            <th className="px-5 py-4 font-semibold">Horário</th>
            <th className="px-5 py-4 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr
              key={a.id}
              className="border-b border-copper/40 transition-colors last:border-0 hover:bg-copper/5"
            >
              <td className="px-5 py-4 font-medium text-white">{a.nome}</td>
              <td className="px-5 py-4 text-foreground-muted">{a.servico}</td>
              <td className="whitespace-nowrap px-5 py-4 text-foreground-muted">
                {a.data}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-foreground-muted">
                {a.horario}
              </td>
              <td className="px-5 py-4">
                <StatusBadge status={a.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        meta.className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Estados auxiliares                                                 */
/* ------------------------------------------------------------------ */

function TableSkeleton() {
  return (
    <div className="divide-y divide-copper/30">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-4 w-1/4 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-16 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-12 animate-pulse rounded bg-white/10" />
          <div className="ml-auto h-6 w-24 animate-pulse rounded-full bg-white/10" />
        </div>
      ))}
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
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
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
