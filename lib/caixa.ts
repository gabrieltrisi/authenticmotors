/**
 * Camada de dados (cliente) do módulo de Caixa.
 * Consome a API interna /api/admin/caixa (Prisma + PostgreSQL Neon).
 */

export type CashMovementType = "ENTRY" | "EXIT";
export type PaymentMethod =
  | "CASH"
  | "PIX"
  | "DEBIT_CARD"
  | "CREDIT_CARD"
  | "OTHER";

/** Registro como retornado pela API (amount já numérico, datas em ISO). */
export interface CashMovement {
  id: string;
  createdAt: string;
  updatedAt: string;
  type: CashMovementType;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  category: string | null;
  customerName: string | null;
  serviceName: string | null;
  notes: string | null;
  movementDate: string;
  createdBy: string | null;
}

/** Payload para criar uma movimentação. */
export interface NewCashMovement {
  type: CashMovementType;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  category?: string;
  customerName?: string;
  serviceName?: string;
  notes?: string;
  movementDate: string; // ISO
}

export const TYPE_META: Record<
  CashMovementType,
  { label: string; className: string }
> = {
  ENTRY: {
    label: "Entrada",
    className: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  },
  EXIT: {
    label: "Saída",
    className: "border-red-500/40 bg-red-500/10 text-red-300",
  },
};

export const PAYMENT_META: Record<PaymentMethod, string> = {
  CASH: "Dinheiro",
  PIX: "Pix",
  DEBIT_CARD: "Cartão de Débito",
  CREDIT_CARD: "Cartão de Crédito",
  OTHER: "Outro",
};

export const PAYMENT_OPTIONS: Array<{ value: PaymentMethod; label: string }> = (
  Object.keys(PAYMENT_META) as PaymentMethod[]
).map((value) => ({ value, label: PAYMENT_META[value] }));

/** Formata número em BRL. */
export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Data ISO -> DD/MM/AAAA (em UTC, consistente com a gravação ao meio-dia UTC). */
export function formatDateBR(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

/** Resumo (entradas, saídas, saldo) de uma lista de movimentações. */
export function summarize(items: CashMovement[]) {
  let entradas = 0;
  let saidas = 0;
  for (const m of items) {
    if (m.type === "ENTRY") entradas += m.amount;
    else saidas += m.amount;
  }
  return { entradas, saidas, saldo: entradas - saidas };
}

/** Quebra de um grupo (por forma de pagamento ou categoria). */
export interface RevenueGroup {
  key: string;
  label: string;
  total: number;
  count: number;
}

/**
 * Resumo de faturamento: o valor bruto que entrou (somatório das ENTRADAS),
 * com quebra por forma de pagamento e por categoria. Saídas são ignoradas —
 * faturamento bruto não desconta despesas.
 */
export function summarizeRevenue(items: CashMovement[]) {
  const entries = items.filter((m) => m.type === "ENTRY");
  const gross = entries.reduce((sum, m) => sum + m.amount, 0);
  const count = entries.length;

  const payMap = new Map<PaymentMethod, { total: number; count: number }>();
  const catMap = new Map<string, { total: number; count: number }>();
  for (const m of entries) {
    const p = payMap.get(m.paymentMethod) ?? { total: 0, count: 0 };
    payMap.set(m.paymentMethod, {
      total: p.total + m.amount,
      count: p.count + 1,
    });
    const cat = m.category?.trim() || "Sem categoria";
    const c = catMap.get(cat) ?? { total: 0, count: 0 };
    catMap.set(cat, { total: c.total + m.amount, count: c.count + 1 });
  }

  const byPayment: RevenueGroup[] = [...payMap.entries()]
    .map(([method, v]) => ({
      key: method,
      label: PAYMENT_META[method],
      total: v.total,
      count: v.count,
    }))
    .sort((a, b) => b.total - a.total);

  const byCategory: RevenueGroup[] = [...catMap.entries()]
    .map(([category, v]) => ({
      key: category,
      label: category,
      total: v.total,
      count: v.count,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    gross,
    count,
    average: count ? gross / count : 0,
    byPayment,
    byCategory,
  };
}

/** Data de hoje no formato YYYY-MM-DD (UTC) para o input de filtro. */
export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Mês atual no formato YYYY-MM (UTC) para o input de filtro mensal. */
export function currentISOMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

/** "YYYY-MM" -> "junho de 2026" (rótulo do mês por extenso). */
export function formatMonthBR(monthISO: string): string {
  const [y, m] = monthISO.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1));
  return d.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Constrói o movementDate (meio-dia UTC do dia selecionado). */
export function movementDateForDay(dayISO: string): string {
  return `${dayISO}T12:00:00.000Z`;
}

/* ------------------------------------------------------------------ */
/*  Período (dia ou mês)                                               */
/* ------------------------------------------------------------------ */

export type PeriodMode = "day" | "month";

/** Período selecionado no painel: um dia (YYYY-MM-DD) ou um mês (YYYY-MM). */
export type Period =
  | { mode: "day"; value: string }
  | { mode: "month"; value: string };

/** Rótulo do período por extenso, para cabeçalhos e relatórios. */
export function formatPeriodLabel(period: Period): string {
  return period.mode === "day"
    ? formatDateBR(`${period.value}T12:00:00.000Z`)
    : formatMonthBR(period.value);
}

/** Sufixo para nomes de arquivos exportados (ex.: "2026-06" ou "2026-06-28"). */
export function periodFileTag(period: Period): string {
  return period.value;
}

/* ------------------------------------------------------------------ */
/*  Chamadas à API                                                    */
/* ------------------------------------------------------------------ */

export async function fetchMovements(dayISO?: string): Promise<CashMovement[]> {
  const qs = dayISO ? `?date=${encodeURIComponent(dayISO)}` : "";
  const res = await fetch(`/api/admin/caixa${qs}`, { cache: "no-store" });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) {
    throw new Error(data?.error ?? `HTTP ${res.status}`);
  }
  return data.items as CashMovement[];
}

/** Busca movimentações de um período (dia ou mês inteiro). */
export async function fetchMovementsForPeriod(
  period: Period
): Promise<CashMovement[]> {
  const param =
    period.mode === "month"
      ? `month=${encodeURIComponent(period.value)}`
      : `date=${encodeURIComponent(period.value)}`;
  const res = await fetch(`/api/admin/caixa?${param}`, { cache: "no-store" });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) {
    throw new Error(data?.error ?? `HTTP ${res.status}`);
  }
  return data.items as CashMovement[];
}

export async function createMovement(
  payload: NewCashMovement
): Promise<CashMovement> {
  const res = await fetch("/api/admin/caixa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) {
    throw new Error(data?.error ?? `HTTP ${res.status}`);
  }
  return data.item as CashMovement;
}

export async function deleteMovement(id: string): Promise<void> {
  const res = await fetch(`/api/admin/caixa/${id}`, { method: "DELETE" });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) {
    throw new Error(data?.error ?? `HTTP ${res.status}`);
  }
}
