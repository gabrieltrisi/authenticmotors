/**
 * Configuração e dados do fluxo de AGENDAMENTO.
 *
 * Backend desta fase = n8n (apenas um Webhook). O site coleta os dados e
 * envia um POST em JSON para a URL abaixo.
 *
 * A URL NÃO fica hardcoded: é lida da variável de ambiente pública
 * `NEXT_PUBLIC_N8N_WEBHOOK_URL`.
 *   - Local:  defina em `.env.local`
 *   - Vercel: defina em Project → Settings → Environment Variables
 *
 * Quando a variável não está definida, o valor é "" (vazio) e o formulário
 * apenas simula o envio (modo UX), sem fazer POST.
 */
export const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ?? "";

/**
 * Endpoint que retorna os horários disponíveis/ocupados de uma data.
 * Lida da env `NEXT_PUBLIC_N8N_HORARIOS_URL` (sem hardcode).
 */
export const N8N_HORARIOS_URL = process.env.NEXT_PUBLIC_N8N_HORARIOS_URL ?? "";

export type VehicleType = "Carro" | "Moto";
export type CarSize = "Sedan/Hatch" | "SUV";

export type ServiceGroup = "Carros" | "Motos" | "Adicionais";

export type Pricing =
  | { kind: "vehicle"; sedan: number; suv: number }
  | { kind: "single"; value: number };

export interface SchedulingService {
  id: string;
  group: ServiceGroup;
  /** A qual tipo de veículo o serviço se aplica (filtra as opções no form). */
  vehicle: VehicleType;
  label: string;
  pricing: Pricing;
}

/** Catálogo plano usado pelo <select> do formulário. */
export const SCHEDULING_SERVICES: SchedulingService[] = [
  // ---------------- CARROS ----------------
  {
    id: "carro-nivel-1",
    group: "Carros",
    vehicle: "Carro",
    label: "Tratamento Nível 1",
    pricing: { kind: "vehicle", sedan: 55, suv: 65 },
  },
  {
    id: "carro-nivel-2",
    group: "Carros",
    vehicle: "Carro",
    label: "Tratamento Nível 2",
    pricing: { kind: "vehicle", sedan: 75, suv: 90 },
  },
  {
    id: "carro-nivel-3",
    group: "Carros",
    vehicle: "Carro",
    label: "Tratamento Nível 3",
    pricing: { kind: "vehicle", sedan: 120, suv: 150 },
  },
  {
    id: "carro-lavagem-motor",
    group: "Carros",
    vehicle: "Carro",
    label: "Lavagem de Motor",
    pricing: { kind: "vehicle", sedan: 70, suv: 90 },
  },
  // ---------------- MOTOS ----------------
  {
    id: "moto-nivel-1",
    group: "Motos",
    vehicle: "Moto",
    label: "Tratamento Nível 1",
    pricing: { kind: "single", value: 30 },
  },
  {
    id: "moto-nivel-2",
    group: "Motos",
    vehicle: "Moto",
    label: "Tratamento Nível 2",
    pricing: { kind: "single", value: 60 },
  },
  // ------------- ADICIONAIS (carro) -------------
  {
    id: "farois-frontais",
    group: "Adicionais",
    vehicle: "Carro",
    label: "Restauração de Faróis — Frontais",
    pricing: { kind: "single", value: 100 },
  },
  {
    id: "farois-traseiros",
    group: "Adicionais",
    vehicle: "Carro",
    label: "Restauração de Faróis — Traseiros",
    pricing: { kind: "single", value: 80 },
  },
  {
    id: "farois-completo",
    group: "Adicionais",
    vehicle: "Carro",
    label: "Restauração de Faróis — Completo",
    pricing: { kind: "single", value: 270 },
  },
  {
    id: "bancos-frontais",
    group: "Adicionais",
    vehicle: "Carro",
    label: "Higienização de Bancos — Frontais",
    pricing: { kind: "single", value: 200 },
  },
  {
    id: "bancos-completos",
    group: "Adicionais",
    vehicle: "Carro",
    label: "Higienização de Bancos — Completos",
    pricing: { kind: "single", value: 350 },
  },
  {
    id: "chuva-acida",
    group: "Adicionais",
    vehicle: "Carro",
    label: "Remoção de Chuva Ácida e Proteção Hidrofóbica",
    pricing: { kind: "single", value: 60 },
  },
];

/** Serviços filtrados pelo tipo de veículo escolhido. */
export function servicesForVehicle(vehicle: VehicleType): SchedulingService[] {
  return SCHEDULING_SERVICES.filter((s) => s.vehicle === vehicle);
}

/** Encontra um serviço pelo id. */
export function findService(id: string): SchedulingService | undefined {
  return SCHEDULING_SERVICES.find((s) => s.id === id);
}

/** Calcula o valor estimado conforme serviço + porte (quando aplicável). */
export function priceFor(
  service: SchedulingService | undefined,
  size: CarSize
): number | null {
  if (!service) return null;
  if (service.pricing.kind === "single") return service.pricing.value;
  return size === "SUV" ? service.pricing.suv : service.pricing.sedan;
}

/** Indica se o serviço depende do porte do carro para precificar. */
export function priceDependsOnSize(service: SchedulingService | undefined) {
  return service?.pricing.kind === "vehicle";
}

/** Horários disponíveis (08h às 18h, de hora em hora). */
export const TIME_SLOTS: string[] = Array.from({ length: 11 }, (_, i) => {
  const hour = 8 + i;
  return `${String(hour).padStart(2, "0")}:00`;
});

/** Resposta do endpoint de horários disponíveis. */
export interface HorariosResponse {
  success: boolean;
  data: string;
  horariosDisponiveis: string[];
  horariosOcupados: string[];
}

/** Item de horário normalizado para a UI (disponível ou ocupado). */
export interface HorarioSlot {
  time: string;
  available: boolean;
}

/** Endpoints internos (fonte principal a partir da migração para o banco). */
export const INTERNAL_APPOINTMENTS_URL = "/api/appointments";
export const INTERNAL_AVAILABLE_TIMES_URL =
  "/api/appointments/available-times";

/**
 * Consulta os horários de uma data (formato DD/MM/AAAA).
 * Ordem: 1) API interna (PostgreSQL) → 2) fallback n8n → 3) sem n8n, devolve
 * todos os TIME_SLOTS como disponíveis (apenas para não travar o fluxo local).
 */
export async function fetchHorarios(dataBR: string): Promise<HorariosResponse> {
  // 1) API interna
  try {
    const res = await fetch(
      `${INTERNAL_AVAILABLE_TIMES_URL}?date=${encodeURIComponent(dataBR)}`,
      { cache: "no-store" }
    );
    const data = await res.json().catch(() => null);
    if (res.ok && data?.success) return data as HorariosResponse;
    throw new Error("API interna de horários indisponível");
  } catch {
    // 2) Fallback n8n
    if (N8N_HORARIOS_URL.trim()) {
      const res = await fetch(N8N_HORARIOS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: dataBR }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as HorariosResponse;
    }
    // 3) Sem n8n: tudo disponível (fallback local)
    return {
      success: true,
      data: dataBR,
      horariosDisponiveis: TIME_SLOTS,
      horariosOcupados: [],
    };
  }
}

/** Normaliza a resposta em uma lista ordenada de slots para a UI. */
export function toSlots(resp: HorariosResponse): HorarioSlot[] {
  const disponiveis = (resp.horariosDisponiveis ?? []).map((time) => ({
    time,
    available: true,
  }));
  const ocupados = (resp.horariosOcupados ?? []).map((time) => ({
    time,
    available: false,
  }));
  return [...disponiveis, ...ocupados].sort((a, b) =>
    a.time.localeCompare(b.time)
  );
}

/** Payload enviado ao webhook do n8n (e também à API interna). */
export interface AppointmentPayload {
  nome: string;
  whatsapp: string;
  tipoVeiculo: string;
  modeloVeiculo: string;
  placa: string;
  servico: string;
  porte: string;
  valor: string;
  data: string;
  horario: string;
  observacoes: string;
  origem: "site-authentic-motors";
}

/**
 * Cria o agendamento. Fonte principal = API interna (PostgreSQL).
 * Se a API interna falhar, usa o webhook do n8n como FALLBACK (se configurado).
 * Retorna por onde foi criado (telemetria/log). Lança erro se ambos falharem.
 */
export async function submitAppointment(
  payload: AppointmentPayload
): Promise<{ ok: true; via: "db" | "n8n" }> {
  // 1) API interna
  try {
    const res = await fetch(INTERNAL_APPOINTMENTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data?.success) return { ok: true, via: "db" };
    throw new Error(data?.error ?? `HTTP ${res.status}`);
  } catch (internalErr) {
    // 2) Fallback n8n
    if (N8N_WEBHOOK_URL.trim()) {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`n8n HTTP ${res.status}`);
      return { ok: true, via: "n8n" };
    }
    // Sem n8n configurado: propaga o erro da API interna.
    throw internalErr;
  }
}
