import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { serializeAppointment } from "@/lib/appointments-server";
import {
  sendAppointmentConfirmedEmail,
  sendAppointmentCanceledEmail,
  sendAppointmentCompletedEmail,
} from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = ["CONFIRMED", "COMPLETED", "CANCELED"] as const;
type AllowedStatus = (typeof ALLOWED)[number];

/**
 * PATCH /api/admin/appointments/[id]/status
 * Body: { status: "CONFIRMED" | "COMPLETED" | "CANCELED" }
 *
 * - CONFIRMED -> confirmedAt
 * - COMPLETED -> completedAt + cria CashMovement ENTRY (uma vez só)
 * - CANCELED  -> canceledAt
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const status = (body as { status?: string } | null)?.status;

    if (!status || !ALLOWED.includes(status as AllowedStatus)) {
      return NextResponse.json(
        { success: false, error: "Status inválido (CONFIRMED, COMPLETED ou CANCELED)." },
        { status: 400 }
      );
    }

    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Agendamento não encontrado." },
        { status: 404 }
      );
    }

    const now = new Date();
    const data: Prisma.AppointmentUpdateInput = {
      status: status as AllowedStatus,
    };
    if (status === "CONFIRMED") data.confirmedAt = now;
    if (status === "COMPLETED") data.completedAt = now;
    if (status === "CANCELED") data.canceledAt = now;

    const { updated, cashCreated } = await prisma.$transaction(async (tx) => {
      const updated = await tx.appointment.update({ where: { id }, data });

      let cashCreated = false;
      if (status === "COMPLETED") {
        // Dedup: só cria a entrada se ainda não houver uma para este agendamento.
        const already = await tx.cashMovement.findUnique({
          where: { appointmentId: id },
        });
        if (!already) {
          await tx.cashMovement.create({
            data: {
              type: "ENTRY",
              description: `Serviço concluído - ${updated.serviceName}`,
              amount: updated.amount,
              paymentMethod: "PIX",
              category: "Serviço",
              customerName: updated.customerName,
              serviceName: updated.serviceName,
              movementDate: updated.appointmentDate,
              notes: `Entrada gerada automaticamente pelo agendamento ${id}`,
              appointmentId: id,
            },
          });
          cashCreated = true;
        }
      }

      return { updated, cashCreated };
    });

    // E-mail conforme o novo status (best-effort + dedup pelos *SentAt).
    try {
      if (status === "CONFIRMED" && !existing.confirmationSentAt) {
        const r = await sendAppointmentConfirmedEmail(updated);
        if (r.sent) {
          await prisma.appointment.update({
            where: { id },
            data: { confirmationSentAt: new Date() },
          });
        }
      } else if (status === "CANCELED" && !existing.canceledEmailSentAt) {
        const r = await sendAppointmentCanceledEmail(updated);
        if (r.sent) {
          await prisma.appointment.update({
            where: { id },
            data: { canceledEmailSentAt: new Date() },
          });
        }
      } else if (status === "COMPLETED" && !existing.completedEmailSentAt) {
        const r = await sendAppointmentCompletedEmail(updated);
        if (r.sent) {
          await prisma.appointment.update({
            where: { id },
            data: { completedEmailSentAt: new Date() },
          });
        }
      }
    } catch (mailErr) {
      console.error("[PATCH status] envio de e-mail falhou:", mailErr);
    }

    return NextResponse.json({
      success: true,
      appointment: serializeAppointment(updated),
      cashMovementCreated: cashCreated,
    });
  } catch (err) {
    console.error("[PATCH /api/admin/appointments/[id]/status]", err);
    return NextResponse.json(
      { success: false, error: "Erro ao atualizar status." },
      { status: 500 }
    );
  }
}
