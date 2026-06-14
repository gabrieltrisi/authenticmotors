/**
 * Helpers server-side do módulo de Agendamentos (Prisma + PostgreSQL).
 * Usado pelas API Routes. NÃO importar em componentes client.
 */
import { Prisma } from "@prisma/client";

/** Horários possíveis de atendimento (sem 12h — almoço). */
export const POSSIBLE_TIMES = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
] as const;

/** Status considerados "ocupados" ao calcular horários disponíveis. */
export const BUSY_STATUSES = ["PENDING", "CONFIRMED"] as const;

/**
 * Converte data BR "DD/MM/AAAA" em Date ao meio-dia UTC do dia (evita troca de
 * dia por fuso). Retorna null se inválida.
 */
export function parseBRDate(value: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((value ?? "").trim());
  if (!m) return null;
  const [, d, mo, y] = m;
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), 12, 0, 0));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Converte "YYYY-MM-DD" em Date ao meio-dia UTC. Retorna null se inválida. */
export function parseISODate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((value ?? "").trim());
  if (!m) return null;
  const [, y, mo, d] = m;
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), 12, 0, 0));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Janela [início, fim) do dia em UTC para uma data (qualquer hora). */
export function dayWindowUTC(date: Date): { start: Date; end: Date } {
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0)
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

/** Date -> "DD/MM/AAAA" (em UTC). */
export function dateToBR(date: Date): string {
  const d = String(date.getUTCDate()).padStart(2, "0");
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const y = date.getUTCFullYear();
  return `${d}/${m}/${y}`;
}

/**
 * Converte valor monetário em número. Aceita "R$ 75,00", "1.234,56", "150",
 * "150.00" ou número. Retorna NaN se não der para interpretar.
 */
export function parseCurrency(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return NaN;
  let s = value.replace(/[^\d.,-]/g, "").trim();
  if (!s) return NaN;
  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  if (hasComma && hasDot) {
    // formato BR: ponto = milhar, vírgula = decimal
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    s = s.replace(",", ".");
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

/** Tipo do registro do Prisma com Decimal (para tipar o serializer). */
type AppointmentRow = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  customerName: string;
  whatsapp: string;
  vehicleType: string;
  vehicleModel: string;
  plate: string | null;
  serviceName: string;
  serviceCategory: string | null;
  vehicleSize: string | null;
  amount: Prisma.Decimal;
  appointmentDate: Date;
  appointmentTime: string;
  notes: string | null;
  status: string;
  source: string;
  confirmedAt: Date | null;
  completedAt: Date | null;
  canceledAt: Date | null;
  reminderSentAt?: Date | null;
  confirmationSentAt?: Date | null;
};

/** Serializa um Appointment para JSON (Decimal -> number, datas -> ISO/BR). */
export function serializeAppointment(a: AppointmentRow) {
  return {
    id: a.id,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    customerName: a.customerName,
    whatsapp: a.whatsapp,
    vehicleType: a.vehicleType,
    vehicleModel: a.vehicleModel,
    plate: a.plate,
    serviceName: a.serviceName,
    serviceCategory: a.serviceCategory,
    vehicleSize: a.vehicleSize,
    amount: Number(a.amount),
    appointmentDate: a.appointmentDate.toISOString(),
    /** Conveniência para a UI: data BR e horário. */
    data: dateToBR(a.appointmentDate),
    horario: a.appointmentTime,
    appointmentTime: a.appointmentTime,
    notes: a.notes,
    status: a.status,
    source: a.source,
    confirmedAt: a.confirmedAt ? a.confirmedAt.toISOString() : null,
    completedAt: a.completedAt ? a.completedAt.toISOString() : null,
    canceledAt: a.canceledAt ? a.canceledAt.toISOString() : null,
  };
}
