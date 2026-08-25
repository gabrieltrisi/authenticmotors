/**
 * Serviço de e-mail transacional (Resend) do módulo de Agendamentos.
 *
 * Tudo aqui é "best-effort": se RESEND_API_KEY / EMAIL_FROM não estiverem
 * configurados (ou não houver destinatário), as funções NÃO lançam erro —
 * apenas logam "email disabled" e seguem o fluxo. O Resend é carregado sob
 * demanda (dynamic import) para não pesar quando o e-mail está desativado.
 *
 * Observação: o Appointment guarda o e-mail do cliente em `email` (opcional).
 * Como destinatário usamos `appointment.email` e, na ausência, `EMAIL_TO`
 * (caixa de notificação da oficina, opcional). Sem nenhum dos dois, pula o envio.
 */
import { formatBRL } from "@/lib/utils";

/** Dados mínimos necessários para montar os e-mails. */
export interface AppointmentEmailData {
  id?: string;
  email?: string | null;
  customerName: string;
  serviceName: string;
  appointmentDate: Date | string;
  appointmentTime: string;
  vehicleType: string;
  vehicleModel: string;
  amount: number | string | { toString(): string };
  status?: string;
}

export interface EmailResult {
  sent: boolean;
  skipped?: boolean;
  error?: string;
}

type EmailKind =
  | "created"
  | "confirmed"
  | "canceled"
  | "completed"
  | "reminder";

const KINDS: Record<
  EmailKind,
  { subject: string; title: string; intro: string; statusLabel?: string }
> = {
  created: {
    subject: "Recebemos seu agendamento — Authentic Motors",
    title: "Recebemos seu agendamento",
    intro: "Recebemos sua solicitação. Nossa equipe irá confirmar em breve.",
    statusLabel: "Pendente",
  },
  confirmed: {
    subject: "Agendamento confirmado — Authentic Motors",
    title: "Agendamento confirmado",
    intro: "Seu horário foi confirmado.",
    statusLabel: "Confirmado",
  },
  canceled: {
    subject: "Agendamento cancelado — Authentic Motors",
    title: "Agendamento cancelado",
    intro:
      "Seu agendamento foi cancelado. Para reagendar, entre em contato.",
    statusLabel: "Cancelado",
  },
  completed: {
    subject: "Serviço concluído — Authentic Motors",
    title: "Serviço concluído",
    intro: "Obrigado por confiar na Authentic Motors.",
    statusLabel: "Concluído",
  },
  reminder: {
    subject: "Lembrete do seu agendamento — Authentic Motors",
    title: "Lembrete do seu agendamento",
    intro: "Este é um lembrete do seu agendamento.",
  },
};

const STATUS_PT: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluído",
  CANCELED: "Cancelado",
};

function getConfig() {
  const apiKey = process.env.RESEND_API_KEY ?? "";
  const from = process.env.EMAIL_FROM ?? "";
  return { apiKey, from, enabled: Boolean(apiKey && from) };
}

/** Date | ISO -> "DD/MM/AAAA" (em UTC, consistente com a gravação). */
function formatDate(value: Date | string): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getUTCFullYear()}`;
}

function statusLabelFor(a: AppointmentEmailData, kind: EmailKind): string {
  if (KINDS[kind].statusLabel) return KINDS[kind].statusLabel as string;
  return STATUS_PT[a.status ?? ""] ?? "—";
}

/* ------------------------------------------------------------------ */
/*  Templates                                                          */
/* ------------------------------------------------------------------ */

const COPPER = "#b06d31";

function renderHtml(a: AppointmentEmailData, kind: EmailKind): string {
  const k = KINDS[kind];
  const veiculo = [a.vehicleType, a.vehicleModel].filter(Boolean).join(" ");
  const valor = formatBRL(Number(a.amount));
  const statusLabel = statusLabelFor(a, kind);

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 0;color:#6b6b6b;font-size:13px;text-transform:uppercase;letter-spacing:.04em;">${label}</td>
      <td style="padding:8px 0;color:#1a1a1a;font-size:14px;font-weight:600;text-align:right;">${value || "—"}</td>
    </tr>`;

  return `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #ececec;">
        <tr>
          <td style="background:${COPPER};padding:20px 28px;">
            <span style="color:#fff;font-size:18px;font-weight:800;letter-spacing:.12em;">AUTHENTIC MOTORS</span>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;">
            <h1 style="margin:0 0 8px;color:#1a1a1a;font-size:20px;">${k.title}</h1>
            <p style="margin:0 0 20px;color:#444;font-size:15px;line-height:1.5;">
              Olá, <strong>${a.customerName}</strong>. ${k.intro}
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eee;border-bottom:1px solid #eee;">
              ${row("Serviço", a.serviceName)}
              ${row("Data", formatDate(a.appointmentDate))}
              ${row("Horário", a.appointmentTime)}
              ${row("Veículo", veiculo)}
              ${row("Valor", valor)}
              ${row("Status", statusLabel)}
            </table>
            <p style="margin:22px 0 0;color:#888;font-size:12px;line-height:1.5;">
              Em caso de dúvidas, responda este e-mail ou fale com a nossa equipe pelo WhatsApp.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#fafafa;padding:16px 28px;border-top:1px solid #eee;">
            <span style="color:#9a9a9a;font-size:12px;">Authentic Motors — Estética automotiva</span>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function renderText(a: AppointmentEmailData, kind: EmailKind): string {
  const k = KINDS[kind];
  const veiculo = [a.vehicleType, a.vehicleModel].filter(Boolean).join(" ");
  return [
    `AUTHENTIC MOTORS`,
    ``,
    `${k.title}`,
    `Olá, ${a.customerName}. ${k.intro}`,
    ``,
    `Serviço: ${a.serviceName}`,
    `Data: ${formatDate(a.appointmentDate)}`,
    `Horário: ${a.appointmentTime}`,
    `Veículo: ${veiculo || "—"}`,
    `Valor: ${formatBRL(Number(a.amount))}`,
    `Status: ${statusLabelFor(a, kind)}`,
    ``,
    `Authentic Motors — Estética automotiva`,
  ].join("\n");
}

/* ------------------------------------------------------------------ */
/*  Envio                                                              */
/* ------------------------------------------------------------------ */

async function send(
  a: AppointmentEmailData,
  kind: EmailKind
): Promise<EmailResult> {
  const { apiKey, from, enabled } = getConfig();
  if (!enabled) {
    console.warn(
      "[email] disabled — RESEND_API_KEY/EMAIL_FROM ausentes; envio ignorado."
    );
    return { sent: false, skipped: true };
  }

  const to = (a.email && a.email.trim()) || process.env.EMAIL_TO || "";
  if (!to) {
    console.warn(
      "[email] disabled — sem destinatário (Appointment.email vazio e EMAIL_TO não configurado)."
    );
    return { sent: false, skipped: true };
  }

  const { subject } = KINDS[kind];
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      html: renderHtml(a, kind),
      text: renderText(a, kind),
    });
    if (error) {
      console.error("[email] erro do Resend:", error);
      return { sent: false, error: String(error.message ?? error) };
    }
    return { sent: true };
  } catch (err) {
    console.error("[email] falha ao enviar:", err);
    return {
      sent: false,
      error: err instanceof Error ? err.message : "erro desconhecido",
    };
  }
}

/* ------------------------------------------------------------------ */
/*  API pública                                                        */
/* ------------------------------------------------------------------ */

export function sendAppointmentCreatedEmail(a: AppointmentEmailData) {
  return send(a, "created");
}
export function sendAppointmentConfirmedEmail(a: AppointmentEmailData) {
  return send(a, "confirmed");
}
export function sendAppointmentCanceledEmail(a: AppointmentEmailData) {
  return send(a, "canceled");
}
export function sendAppointmentCompletedEmail(a: AppointmentEmailData) {
  return send(a, "completed");
}
export function sendAppointmentReminderEmail(a: AppointmentEmailData) {
  return send(a, "reminder");
}
