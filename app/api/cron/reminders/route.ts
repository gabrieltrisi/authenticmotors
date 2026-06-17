import { NextResponse } from "next/server";
import type { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendAppointmentReminderEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Fuso de Bahia/Brasil (UTC-3, sem horário de verão). Os horários dos
 * agendamentos (appointmentTime) são locais; appointmentDate é gravado ao
 * meio-dia UTC do dia. Para obter o INSTANTE real em UTC somamos o offset.
 */
const BR_OFFSET_HOURS = 3;
const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

/** Combina dia (appointmentDate, meio-dia UTC) + "HH:MM" local -> instante UTC. */
function appointmentInstant(appointmentDate: Date, appointmentTime: string): Date {
  const [hh, mm] = (appointmentTime || "00:00").split(":").map(Number);
  return new Date(
    Date.UTC(
      appointmentDate.getUTCFullYear(),
      appointmentDate.getUTCMonth(),
      appointmentDate.getUTCDate(),
      (hh || 0) + BR_OFFSET_HOURS,
      mm || 0,
      0
    )
  );
}

/**
 * GET /api/cron/reminders
 * Envia e-mail de lembrete para agendamentos que acontecerão em até 1 hora.
 *
 * Protegida por CRON_SECRET (header Authorization: Bearer <CRON_SECRET>).
 * Na Vercel, o Cron envia esse header automaticamente quando existe a env
 * CRON_SECRET no projeto.
 */
export async function GET(request: Request) {
  // --- Autenticação ---
  const secret = process.env.CRON_SECRET ?? "";
  const auth = request.headers.get("authorization") ?? "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json(
      { success: false, error: "Não autorizado." },
      { status: 401 }
    );
  }

  try {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + ONE_HOUR_MS);

    // Candidatos: status ativo, ainda sem lembrete, no dia de hoje (±1 dia para
    // cobrir virada de meia-noite). O recorte fino por instante é feito em JS.
    const candidates = await prisma.appointment.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] as AppointmentStatus[] },
        reminderSentAt: null,
        appointmentDate: {
          gte: new Date(now.getTime() - ONE_DAY_MS),
          lte: new Date(now.getTime() + ONE_DAY_MS),
        },
      },
    });

    // Filtra os que ocorrem entre agora e agora + 1 hora.
    const due = candidates.filter((a) => {
      const instant = appointmentInstant(a.appointmentDate, a.appointmentTime);
      return instant.getTime() >= now.getTime() && instant.getTime() <= windowEnd.getTime();
    });

    // E-mail desativado: não quebra, apenas reporta.
    const emailEnabled = Boolean(
      process.env.RESEND_API_KEY && process.env.EMAIL_FROM
    );
    if (!emailEnabled) {
      console.warn("[cron/reminders] email disabled — RESEND_API_KEY/EMAIL_FROM ausentes.");
      return NextResponse.json({
        success: true,
        emailDisabled: true,
        found: due.length,
        sent: 0,
      });
    }

    let sent = 0;
    const remindedIds: string[] = [];
    for (const a of due) {
      try {
        const r = await sendAppointmentReminderEmail(a);
        if (r.sent) {
          await prisma.appointment.update({
            where: { id: a.id },
            data: { reminderSentAt: new Date() },
          });
          sent++;
          remindedIds.push(a.id);
        }
      } catch (mailErr) {
        console.error(`[cron/reminders] falha no agendamento ${a.id}:`, mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      emailDisabled: false,
      found: due.length,
      sent,
      remindedIds,
    });
  } catch (err) {
    console.error("[cron/reminders]", err);
    return NextResponse.json(
      { success: false, error: "Erro ao processar lembretes." },
      { status: 500 }
    );
  }
}
