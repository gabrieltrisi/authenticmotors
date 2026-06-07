/**
 * Camada de dados do painel administrativo de agendamentos.
 *
 * Esta fase é SOMENTE FRONTEND. Ainda não há backend.
 * Quando a API existir, preencha `ADMIN_API_URL` com o endpoint GET que
 * retorna a lista de agendamentos no formato `AppointmentRecord[]`.
 *
 * Enquanto a URL estiver vazia, a tela exibe DADOS DE EXEMPLO (mock) para
 * permitir visualizar o layout.
 */

// >>> COLE AQUI a URL da API (GET) que lista os agendamentos <<<
export const ADMIN_API_URL = "";

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
 * Busca os agendamentos. Quando `ADMIN_API_URL` estiver vazio, retorna o mock.
 * Lança erro em caso de falha de rede/HTTP para a tela tratar.
 */
export async function fetchAppointments(): Promise<AppointmentRecord[]> {
  if (!ADMIN_API_URL) {
    // simula latência leve para exercitar o estado de loading
    await new Promise((r) => setTimeout(r, 400));
    return MOCK_APPOINTMENTS;
  }
  const res = await fetch(ADMIN_API_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as AppointmentRecord[];
}

/** Indica se estamos exibindo dados de exemplo (API ainda não configurada). */
export const IS_USING_MOCK = ADMIN_API_URL === "";
