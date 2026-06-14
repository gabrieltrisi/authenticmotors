import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  parseISODate,
  dayWindowUTC,
  serializeAppointment,
} from "@/lib/appointments-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELED"];

/**
 * GET /api/admin/appointments
 * Lista agendamentos do banco. Filtros opcionais (query):
 *  - date=YYYY-MM-DD            (um dia específico)
 *  - startDate=YYYY-MM-DD       (início do intervalo)
 *  - endDate=YYYY-MM-DD         (fim do intervalo, inclusivo)
 *  - status=PENDING|CONFIRMED|COMPLETED|CANCELED
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");

    const where: Prisma.AppointmentWhereInput = {};

    if (date) {
      const d = parseISODate(date);
      if (d) {
        const { start, end } = dayWindowUTC(d);
        where.appointmentDate = { gte: start, lt: end };
      }
    } else if (startDate || endDate) {
      const range: Prisma.DateTimeFilter = {};
      const s = startDate ? parseISODate(startDate) : null;
      const e = endDate ? parseISODate(endDate) : null;
      if (s) range.gte = dayWindowUTC(s).start;
      if (e) range.lt = dayWindowUTC(e).end;
      if (range.gte || range.lt) where.appointmentDate = range;
    }

    if (status && STATUSES.includes(status)) {
      where.status = status as Prisma.AppointmentWhereInput["status"];
    }

    const rows = await prisma.appointment.findMany({
      where,
      orderBy: [{ appointmentDate: "asc" }, { appointmentTime: "asc" }],
    });

    return NextResponse.json({
      success: true,
      appointments: rows.map(serializeAppointment),
    });
  } catch (err) {
    console.error("[GET /api/admin/appointments]", err);
    return NextResponse.json(
      { success: false, error: "Erro ao listar agendamentos." },
      { status: 500 }
    );
  }
}
