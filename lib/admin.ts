/**
 * Camada de dados do painel administrativo de agendamentos.
 *
 * A URL da API NÃO fica hardcoded: é lida da variável de ambiente pública
 * `NEXT_PUBLIC_ADMIN_API_URL` (endpoint GET do n8n que lista os agendamentos).
 *   - Local:  defina em `.env.local`
 *   - Vercel: defina em Project → Settings → Environment Variables
 *
 * Enquanto a variável estiver vazia, a tela exibe DADOS DE EXEMPLO (mock) para
 * permitir visualizar o layout.
 */

// Endpoint GET que lista os agendamentos (lido da env, sem hardcode).
export const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "";

export type AppointmentStatus =
  | "pendente"
  | "confirmado"
  | "concluido"
  | "cancelado";

export interface AppointmentRecord {
  id: string;
  nome: string;
  servico: string;
  /** Data no formato DD/MM/AAAA (mesmo enviado pelo formulário). */
  data: string;
  /** Horário HH:MM. */
  horario: string;
  status: AppointmentStatus;
}

/** Rótulo + classes de cor de cada status (dentro da identidade do site). */
export const STATUS_META: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  pendente: {
    label: "Pendente",
    className: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  },
  confirmado: {
    label: "Confirmado",
    className: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  },
  concluido: {
    label: "Concluído",
    className: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  },
  cancelado: {
    label: "Cancelado",
    className: "border-red-500/40 bg-red-500/10 text-red-300",
  },
};

/** Dados de exemplo usados enquanto a API não está configurada. */
export const MOCK_APPOINTMENTS: AppointmentRecord[] = [
  {
    id: "1",
    nome: "João Almeida",
    servico: "Tratamento Nível 3",
    data: "10/06/2026",
    horario: "09:00",
    status: "pendente",
  },
  {
    id: "2",
    nome: "Marina Souza",
    servico: "Higienização de Bancos — Completos",
    data: "10/06/2026",
    horario: "11:00",
    status: "confirmado",
  },
  {
    id: "3",
    nome: "Carlos Eduardo",
    servico: "Tratamento Nível 1 (Moto)",
    data: "11/06/2026",
    horario: "14:00",
    status: "confirmado",
  },
  {
    id: "4",
    nome: "Patrícia Lima",
    servico: "Restauração de Faróis — Completo",
    data: "09/06/2026",
    horario: "16:00",
    status: "concluido",
  },
  {
    id: "5",
    nome: "Rafael Nunes",
    servico: "Lavagem de Motor",
    data: "08/06/2026",
    horario: "10:00",
    status: "cancelado",
  },
];

/**
 * Formato bruto de cada agendamento como vem do webhook do n8n.
 * Difere do `AppointmentRecord` interno: usa `dataAgendamento` e `status`
 * em MAIÚSCULAS ("PENDENTE", "CONFIRMADO", ...).
 */
interface RawAppointment {
  id: string;
  nome: string;
  servico: string;
  dataAgendamento: string;
  horario: string;
  status: string;
  // demais campos (whatsapp, placa, valor, etc.) existem mas não são usados aqui.
  [key: string]: unknown;
}

/** Envelope da resposta do endpoint de listagem. */
interface AdminApiResponse {
  success: boolean;
  appointments: RawAppointment[];
}

/** Converte o status do n8n (MAIÚSCULAS) para o `AppointmentStatus` interno. */
function normalizeStatus(raw: string): AppointmentStatus {
  const s = (raw ?? "").trim().toLowerCase();
  if (s === "confirmado") return "confirmado";
  if (s === "concluido" || s === "concluído") return "concluido";
  if (s === "cancelado") return "cancelado";
  // qualquer outro valor (incl. "pendente" ou desconhecido) cai em pendente.
  return "pendente";
}

/** Mapeia o registro bruto do n8n para o formato usado pela UI. */
function mapAppointment(raw: RawAppointment): AppointmentRecord {
  return {
    id: String(raw.id),
    nome: raw.nome ?? "",
    servico: raw.servico ?? "",
    data: raw.dataAgendamento ?? "",
    horario: raw.horario ?? "",
    status: normalizeStatus(raw.status),
  };
}

/**
 * Busca os agendamentos. Quando `ADMIN_API_URL` estiver vazio, retorna o mock.
 * Com a env configurada, faz GET no endpoint do n8n, valida `success === true`
 * e mapeia os registros. Lança erro em caso de falha de rede/HTTP/payload
 * para a tela tratar.
 */
export async function fetchAppointments(): Promise<AppointmentRecord[]> {
  if (!ADMIN_API_URL) {
    // simula latência leve para exercitar o estado de loading
    await new Promise((r) => setTimeout(r, 400));
    return MOCK_APPOINTMENTS;
  }
  const res = await fetch(ADMIN_API_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const payload = (await res.json()) as AdminApiResponse;
  if (!payload?.success) {
    throw new Error("Resposta da API sem success === true");
  }
  return (payload.appointments ?? []).map(mapAppointment);
}

/** Indica se estamos exibindo dados de exemplo (API ainda não configurada). */
export const IS_USING_MOCK = ADMIN_API_URL === "";
