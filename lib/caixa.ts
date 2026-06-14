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

/** Data de hoje no formato YYYY-MM-DD (UTC) para o input de filtro. */
export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Constrói o movementDate (meio-dia UTC do dia selecionado). */
export function movementDateForDay(dayISO: string): string {
  return `${dayISO}T12:00:00.000Z`;
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
