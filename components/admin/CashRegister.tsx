"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  RefreshCw,
  AlertTriangle,
  Inbox,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminNav } from "@/components/admin/AdminNav";
import {
  fetchMovementsForPeriod,
  createMovement,
  deleteMovement,
  summarize,
  formatBRL,
  formatDateBR,
  todayISODate,
  currentISOMonth,
  movementDateForDay,
  PAYMENT_OPTIONS,
  PAYMENT_META,
  TYPE_META,
  type CashMovement,
  type CashMovementType,
  type PaymentMethod,
  type Period,
  type PeriodMode,
} from "@/lib/caixa";
import { SERVICES_GROUPED, SERVICES_BY_ID } from "@/lib/services-catalog";
import { downloadCsv, downloadPdf } from "@/lib/caixa-export";

type LoadState = "loading" | "ready" | "error";

const EMPTY_FORM = {
  serviceId: "",
  type: "ENTRY" as CashMovementType,
  description: "",
  amount: "",
  paymentMethod: "CASH" as PaymentMethod,
  category: "",
  customerName: "",
  serviceName: "",
  notes: "",
};

export function CashRegister() {
  const [mode, setMode] = useState<PeriodMode>("day");
  const [day, setDay] = useState<string>(todayISODate());
  const [month, setMonth] = useState<string>(currentISOMonth());
  const [items, setItems] = useState<CashMovement[]>([]);
  const [state, setState] = useState<LoadState>("loading");

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);

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

  const totals = useMemo(() => summarize(items), [items]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  /** Seleciona um serviço do catálogo e pré-preenche os campos do lançamento. */
  function onSelectService(id: string) {
    const svc = SERVICES_BY_ID[id];
    if (!svc) {
      // "Lançamento manual": só limpa a seleção, mantém o que já foi digitado.
      update("serviceId", "");
      return;
    }
    setForm((f) => ({
      ...f,
      serviceId: id,
      type: "ENTRY",
      description: svc.name,
      serviceName: svc.name,
      amount: svc.price.toFixed(2).replace(".", ","),
      category: svc.category,
    }));
  }

  async function handleExportPdf() {
    setExportingPdf(true);
    setFormError("");
    try {
      await downloadPdf(items, period);
    } catch {
      setFormError("Não foi possível gerar o PDF.");
    } finally {
      setExportingPdf(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setSuccess("");

    const amountNum = Number(form.amount.replace(",", "."));
    if (!form.description.trim()) {
      setFormError("Informe uma descrição.");
      return;
    }
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setFormError("Informe um valor maior que zero.");
      return;
    }

    // No modo mensal não há um dia escolhido: usa hoje se cair dentro do mês
    // selecionado, senão o primeiro dia do mês.
    const today = todayISODate();
    const launchDay =
      mode === "day"
        ? day
        : today.startsWith(month)
          ? today
          : `${month}-01`;

    setSubmitting(true);
    try {
      await createMovement({
        type: form.type,
        description: form.description.trim(),
        amount: amountNum,
        paymentMethod: form.paymentMethod,
        category: form.category.trim() || undefined,
        customerName: form.customerName.trim() || undefined,
        serviceName: form.serviceName.trim() || undefined,
        notes: form.notes.trim() || undefined,
        movementDate: movementDateForDay(launchDay),
      });
      setForm({ ...EMPTY_FORM, type: form.type, paymentMethod: form.paymentMethod });
      setSuccess("Lançamento registrado com sucesso.");
      await load(period);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Erro ao registrar lançamento."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Excluir esta movimentação? Esta ação não pode ser desfeita.")) {
      return;
    }
    setDeletingId(id);
    setSuccess("");
    setFormError("");
    try {
      await deleteMovement(id);
      setItems((prev) => prev.filter((m) => m.id !== id));
      setSuccess("Movimentação excluída.");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Erro ao excluir movimentação."
      );
    } finally {
      setDeletingId(null);
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
                  Caixa
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
        {/* Filtro por data + exportação + resumo */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Alterna entre visão diária e mensal */}
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
                  id="caixa-day"
                  type="date"
                  aria-label="Dia"
                  value={day}
                  onChange={(e) => setDay(e.target.value || todayISODate())}
                  className="rounded-full border border-copper bg-background/60 px-4 py-2 text-sm text-white outline-none focus:border-copper-light focus:ring-2 focus:ring-copper/30"
                />
              ) : (
                <input
                  id="caixa-month"
                  type="month"
                  aria-label="Mês"
                  value={month}
                  onChange={(e) => setMonth(e.target.value || currentISOMonth())}
                  className="rounded-full border border-copper bg-background/60 px-4 py-2 text-sm text-white outline-none focus:border-copper-light focus:ring-2 focus:ring-copper/30"
                />
              )}
            </div>

            {/* Exportação dos lançamentos do dia filtrado */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCsv(items, period)}
                disabled={state !== "ready" || items.length === 0}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Exportar CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPdf}
                disabled={state !== "ready" || items.length === 0 || exportingPdf}
              >
                {exportingPdf ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                Exportar PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              icon={Wallet}
              label={mode === "day" ? "Saldo do dia" : "Saldo do mês"}
              value={formatBRL(totals.saldo)}
              tone={totals.saldo >= 0 ? "neutral" : "negative"}
            />
            <SummaryCard
              icon={TrendingUp}
              label="Entradas"
              value={formatBRL(totals.entradas)}
              tone="positive"
            />
            <SummaryCard
              icon={TrendingDown}
              label="Saídas"
              value={formatBRL(totals.saidas)}
              tone="negative"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
          {/* Formulário de lançamento */}
          <section className="rounded-2xl border border-copper bg-background-secondary/70 p-5 backdrop-blur">
            <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-white">
              Novo lançamento
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Serviço do catálogo (pré-preenche os campos) */}
              <Field label="Serviço (catálogo)">
                <select
                  value={form.serviceId}
                  onChange={(e) => onSelectService(e.target.value)}
                  aria-label="Serviço do catálogo"
                  className={inputClass}
                >
                  <option value="">— Lançamento manual —</option>
                  {SERVICES_GROUPED.map((group) => (
                    <optgroup key={group.category} label={group.category}>
                      {group.items.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} — {formatBRL(s.price)}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </Field>

              {/* Tipo */}
              <div className="grid grid-cols-2 gap-2">
                {(["ENTRY", "EXIT"] as CashMovementType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => update("type", t)}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-sm font-semibold transition-colors",
                      form.type === t
                        ? t === "ENTRY"
                          ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-300"
                          : "border-red-500/50 bg-red-500/15 text-red-300"
                        : "border-copper text-foreground-muted hover:text-white"
                    )}
                  >
                    {TYPE_META[t].label}
                  </button>
                ))}
              </div>

              <Field label="Descrição *">
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Ex.: Tratamento Nível 3"
                  className={inputClass}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Valor (R$) *">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.amount}
                    onChange={(e) => update("amount", e.target.value)}
                    placeholder="0,00"
                    className={inputClass}
                  />
                </Field>
                <Field label="Forma">
                  <select
                    value={form.paymentMethod}
                    onChange={(e) =>
                      update("paymentMethod", e.target.value as PaymentMethod)
                    }
                    aria-label="Forma de pagamento"
                    className={inputClass}
                  >
                    {PAYMENT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Categoria">
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    placeholder="Opcional"
                    className={inputClass}
                  />
                </Field>
                <Field label="Cliente">
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => update("customerName", e.target.value)}
                    placeholder="Opcional"
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Serviço">
                <input
                  type="text"
                  value={form.serviceName}
                  onChange={(e) => update("serviceName", e.target.value)}
                  placeholder="Opcional"
                  className={inputClass}
                />
              </Field>

              <Field label="Observações">
                <textarea
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Opcional"
                  rows={2}
                  className={cn(inputClass, "resize-none")}
                />
              </Field>

              {formError && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-red-300">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {formError}
                </p>
              )}
              {success && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {success}
                </p>
              )}

              <Button type="submit" className="mt-1 w-full" disabled={submitting}>
                {submitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : null}
                Registrar lançamento
              </Button>
            </form>
          </section>

          {/* Tabela de movimentações */}
          <section className="overflow-hidden rounded-2xl border border-copper bg-background-secondary/70 backdrop-blur">
            {state === "loading" && <TableSkeleton />}

            {state === "error" && (
              <EmptyState
                icon={AlertTriangle}
                title="Erro ao carregar"
                text="Não foi possível buscar as movimentações. Verifique a conexão com o banco e tente novamente."
                action={
                  <Button variant="outline" size="sm" onClick={() => load(period)}>
                    <RefreshCw className="h-4 w-4" />
                    Tentar novamente
                  </Button>
                }
              />
            )}

            {state === "ready" && items.length === 0 && (
              <EmptyState
                icon={Inbox}
                title="Nenhuma movimentação"
                text={
                  mode === "day"
                    ? "Não há lançamentos para o dia selecionado. Registre o primeiro no formulário ao lado."
                    : "Não há lançamentos para o mês selecionado. Registre o primeiro no formulário ao lado."
                }
              />
            )}

            {state === "ready" && items.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-copper text-[11px] uppercase tracking-wider text-foreground-muted">
                      <th className="px-5 py-4 font-semibold">Data</th>
                      <th className="px-5 py-4 font-semibold">Descrição</th>
                      <th className="px-5 py-4 font-semibold">Forma</th>
                      <th className="px-5 py-4 font-semibold">Tipo</th>
                      <th className="px-5 py-4 text-right font-semibold">Valor</th>
                      <th className="px-5 py-4">
                        <span className="sr-only">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((m) => (
                      <tr
                        key={m.id}
                        className="border-b border-copper/40 transition-colors last:border-0 hover:bg-copper/5"
                      >
                        <td className="whitespace-nowrap px-5 py-4 text-foreground-muted">
                          {formatDateBR(m.movementDate)}
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-medium text-white">
                            {m.description}
                          </span>
                          {(m.category || m.customerName || m.serviceName) && (
                            <span className="mt-0.5 block text-xs text-foreground-muted">
                              {[m.category, m.serviceName, m.customerName]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-foreground-muted">
                          {PAYMENT_META[m.paymentMethod]}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                              TYPE_META[m.type].className
                            )}
                          >
                            {TYPE_META[m.type].label}
                          </span>
                        </td>
                        <td
                          className={cn(
                            "whitespace-nowrap px-5 py-4 text-right font-semibold",
                            m.type === "ENTRY"
                              ? "text-emerald-300"
                              : "text-red-300"
                          )}
                        >
                          {m.type === "ENTRY" ? "+" : "−"}
                          {formatBRL(m.amount)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(m.id)}
                            disabled={deletingId === m.id}
                            aria-label="Excluir movimentação"
                            className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                          >
                            {deletingId === m.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {state === "ready" && items.length > 0 && (
              <p className="px-5 py-3 text-xs text-foreground-muted/70">
                {items.length} movimentação(ões) no {mode === "day" ? "dia" : "mês"}
              </p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponentes                                                    */
/* ------------------------------------------------------------------ */

const inputClass =
  "w-full rounded-xl border border-copper bg-background/60 px-3 py-2 text-sm text-white placeholder:text-foreground-muted/50 outline-none focus:border-copper-light focus:ring-2 focus:ring-copper/30";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: "neutral" | "positive" | "negative";
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-300"
      : tone === "negative"
        ? "text-red-300"
        : "text-white";
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-copper bg-background-secondary/70 p-5 backdrop-blur">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-copper bg-background/40 text-copper-light">
        <Icon className="h-5 w-5" />
      </span>
      <div className="leading-tight">
        <p className="text-[11px] uppercase tracking-wider text-foreground-muted">
          {label}
        </p>
        <p className={cn("mt-1 font-display text-xl font-extrabold", toneClass)}>
          {value}
        </p>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-copper/30">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-4 w-16 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
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
