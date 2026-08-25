"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Search,
  AlertTriangle,
  Inbox,
  Info,
  Database,
  Check,
  CheckCheck,
  X,
  CheckCircle2,
  CalendarCheck,
  CalendarX,
  BellRing,
  Star,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { waLinkTo } from "@/lib/whatsapp";
import { AdminNav } from "@/components/admin/AdminNav";
import {
  fetchAdminAppointments,
  updateAppointmentStatus,
  STATUS_META,
  type AdminAppointment,
  type AppointmentStatus,
  type AppointmentsSource,
  type StatusAction,
} from "@/lib/admin";

type LoadState = "loading" | "ready" | "error";

const STATUS_FILTERS: Array<{ value: "todos" | AppointmentStatus; label: string }> = [
  { value: "todos", label: "Todos" },
  { value: "pendente", label: "Pendentes" },
  { value: "confirmado", label: "Confirmados" },
  { value: "concluido", label: "Concluídos" },
  { value: "cancelado", label: "Cancelados" },
];

/**
 * Mensagens prontas (wa.me) para enviar ao cliente com um clique.
 * Retorna null quando o número do agendamento não é válido.
 */
function whatsappActions(a: AdminAppointment) {
  const base = `Serviço: ${a.servico}\nData: ${a.data}\nHorário: ${a.horario}`;
  const messages = {
    confirm: `Olá, ${a.nome}! Seu agendamento na Authentic Motors foi confirmado.\n\n${base}\n\nEsperamos por você!`,
    reminder: `Olá, ${a.nome}! Passando para lembrar do seu agendamento na Authentic Motors.\n\n${base}\n\nAté breve!`,
    cancel: `Olá, ${a.nome}. Seu agendamento na Authentic Motors foi cancelado.\n\n${base}\n\nCaso queira reagendar, estamos à disposição.`,
    review: `Olá, ${a.nome}! Seu serviço na Authentic Motors foi concluído.\n\nAgradecemos pela confiança. Se puder, deixe sua avaliação sobre nosso atendimento.`,
  };
  const confirm = waLinkTo(a.whatsapp, messages.confirm);
  if (!confirm) return null; // telefone inválido -> sem ações de WhatsApp
  return {
    confirm,
    reminder: waLinkTo(a.whatsapp, messages.reminder)!,
    cancel: waLinkTo(a.whatsapp, messages.cancel)!,
    review: waLinkTo(a.whatsapp, messages.review)!,
  };
}

export function AppointmentsAdmin() {
  const [items, setItems] = useState<AdminAppointment[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [source, setSource] = useState<AppointmentsSource>("db");
  const [filter, setFilter] = useState<"todos" | AppointmentStatus>("todos");
  const [query, setQuery] = useState("");
  const [actingId, setActingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "ok" | "err"; text: string } | null>(
    null
  );

  const load = useCallback(async () => {
    setState("loading");
    try {
      const { items, source } = await fetchAdminAppointments();
      setItems(items);
      setSource(source);
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

  async function handleAction(a: AdminAppointment, status: StatusAction) {
    if (
      status === "CANCELED" &&
      !window.confirm("Cancelar este agendamento? O horário será liberado.")
    )
      return;
    if (
      status === "COMPLETED" &&
      !window.confirm("Concluir o agendamento? Será gerada uma entrada no caixa.")
    )
      return;

    setActingId(a.id);
    setFeedback(null);
    try {
      const r = await updateAppointmentStatus(a.id, status);
      if (status === "COMPLETED") {
        setFeedback({
          tone: "ok",
          text: r.cashMovementCreated
            ? "Concluído. Entrada gerada automaticamente no caixa."
            : "Concluído. (a entrada no caixa já existia)",
        });
      } else {
        setFeedback({
          tone: "ok",
          text:
            status === "CONFIRMED"
              ? "Agendamento confirmado."
              : "Agendamento cancelado. Horário liberado.",
        });
      }
      await load();
    } catch (err) {
      setFeedback({
        tone: "err",
        text: err instanceof Error ? err.message : "Erro ao atualizar status.",
      });
    } finally {
      setActingId(null);
    }
  }

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
          <AdminNav />
        </div>
      </header>

      <main className="container relative py-8">
        {/* Origem dos dados */}
        <div
          className={cn(
            "mb-6 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm",
            source === "db"
              ? "border-copper bg-background-secondary/70 text-foreground-muted"
              : "border-amber-400/40 bg-amber-400/10 text-amber-200"
          )}
        >
          {source === "db" ? (
            <>
              <Database className="mt-0.5 h-4 w-4 shrink-0 text-copper-light" />
              <span>
                Fonte: <strong className="text-white">banco de dados (PostgreSQL)</strong>.
              </span>
            </>
          ) : (
            <>
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Fonte: <strong>n8n / dados de exemplo (fallback)</strong> — a API
                nativa não respondeu. As ações de status ficam indisponíveis.
              </span>
            </>
          )}
        </div>

        {/* Feedback de ação */}
        {feedback && (
          <div
            className={cn(
              "mb-6 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm",
              feedback.tone === "ok"
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                : "border-red-500/40 bg-red-500/10 text-red-300"
            )}
          >
            {feedback.tone === "ok" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

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
              text="Não foi possível buscar os agendamentos. Tente novamente."
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
            <AppointmentsTable
              items={filtered}
              actingId={actingId}
              onAction={handleAction}
            />
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
/*  Tabela                                                            */
/* ------------------------------------------------------------------ */

function AppointmentsTable({
  items,
  actingId,
  onAction,
}: {
  items: AdminAppointment[];
  actingId: string | null;
  onAction: (a: AdminAppointment, status: StatusAction) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="border-b border-copper text-[11px] uppercase tracking-wider text-foreground-muted">
            <th className="px-5 py-4 font-semibold">Nome</th>
            <th className="px-5 py-4 font-semibold">Serviço</th>
            <th className="px-5 py-4 font-semibold">Data</th>
            <th className="px-5 py-4 font-semibold">Horário</th>
            <th className="px-5 py-4 font-semibold">Status</th>
            <th className="px-5 py-4 text-right font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr
              key={a.id}
              className="border-b border-copper/40 transition-colors last:border-0 hover:bg-copper/5"
            >
              <td className="px-5 py-4">
                <span className="font-medium text-white">{a.nome}</span>
                {a.veiculo && (
                  <span className="mt-0.5 block text-xs text-foreground-muted">
                    {a.veiculo}
                  </span>
                )}
              </td>
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
              <td className="px-5 py-4">
                <RowActions a={a} acting={actingId === a.id} onAction={onAction} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RowActions({
  a,
  acting,
  onAction,
}: {
  a: AdminAppointment;
  acting: boolean;
  onAction: (a: AdminAppointment, status: StatusAction) => void;
}) {
  const wa = whatsappActions(a);
  const canConfirm = a.source === "db" && a.status === "pendente";
  const canComplete =
    a.source === "db" && (a.status === "pendente" || a.status === "confirmado");
  const canCancel =
    a.source === "db" && a.status !== "cancelado" && a.status !== "concluido";

  return (
    <div className="flex items-center justify-end gap-1.5">
      {canConfirm && (
        <ActionButton
          title="Confirmar"
          disabled={acting}
          onClick={() => onAction(a, "CONFIRMED")}
          className="hover:bg-sky-400/10 hover:text-sky-300"
          icon={Check}
        />
      )}
      {canComplete && (
        <ActionButton
          title="Concluir (gera entrada no caixa)"
          disabled={acting}
          onClick={() => onAction(a, "COMPLETED")}
          className="hover:bg-emerald-400/10 hover:text-emerald-300"
          icon={CheckCheck}
        />
      )}
      {canCancel && (
        <ActionButton
          title="Cancelar"
          disabled={acting}
          onClick={() => onAction(a, "CANCELED")}
          className="hover:bg-red-500/10 hover:text-red-300"
          icon={X}
        />
      )}
      {wa && (
        <>
          <span className="mx-0.5 h-5 w-px shrink-0 bg-copper/40" aria-hidden />
          <WaLink href={wa.confirm} title="WhatsApp: confirmação" icon={CalendarCheck} />
          <WaLink href={wa.reminder} title="WhatsApp: lembrete" icon={BellRing} />
          <WaLink href={wa.cancel} title="WhatsApp: cancelamento" icon={CalendarX} />
          <WaLink
            href={wa.review}
            title="WhatsApp: concluído / avaliação"
            icon={Star}
          />
        </>
      )}
      {acting && <RefreshCw className="h-4 w-4 animate-spin text-copper-light" />}
    </div>
  );
}

function ActionButton({
  title,
  icon: Icon,
  onClick,
  disabled,
  className,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg p-2 text-foreground-muted transition-colors disabled:opacity-40",
        className
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

/** Link wa.me (verde) que abre o WhatsApp do cliente em nova aba. */
function WaLink({
  href,
  title,
  icon: Icon,
}: {
  href: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      aria-label={title}
      className="rounded-lg p-2 text-emerald-300/80 transition-colors hover:bg-emerald-400/10 hover:text-emerald-300"
    >
      <Icon className="h-4 w-4" />
    </a>
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
