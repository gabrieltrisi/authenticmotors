import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  POSSIBLE_TIMES,
  BUSY_STATUSES,
  parseBRDate,
  dayWindowUTC,
} from "@/lib/appointments-server";
import type { AppointmentStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/appointments/available-times?date=DD/MM/AAAA
 * Retorna os horários disponíveis e ocupados para a data.
 * Ocupado = existe agendamento PENDING ou CONFIRMED no horário (CANCELED é
 * ignorado, libera o horário).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date") ?? "";
    const date = parseBRDate(dateParam);

    if (!date) {
      return NextResponse.json(
        { success: false, error: "Parâmetro 'date' inválido (use DD/MM/AAAA)." },
        { status: 400 }
      );
    }

    const { start, end } = dayWindowUTC(date);
    const busy = await prisma.appointment.findMany({
      where: {
        appointmentDate: { gte: start, lt: end },
        status: { in: BUSY_STATUSES as unknown as AppointmentStatus[] },
      },
      select: { appointmentTime: true },
    });

    const occupied = new Set(busy.map((b) => b.appointmentTime));
    const horariosOcupados = POSSIBLE_TIMES.filter((t) => occupied.has(t));
    const horariosDisponiveis = POSSIBLE_TIMES.filter((t) => !occupied.has(t));

    return NextResponse.json({
      success: true,
      data: dateParam,
      horariosDisponiveis,
      horariosOcupados,
    });
  } catch (err) {
    console.error("[GET /api/appointments/available-times]", err);
    return NextResponse.json(
      { success: false, error: "Erro ao consultar horários." },
      { status: 500 }
    );
  }
}
