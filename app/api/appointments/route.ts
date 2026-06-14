import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  parseBRDate,
  parseCurrency,
  serializeAppointment,
} from "@/lib/appointments-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/appointments
 * Endpoint público usado pelo formulário do site. Recebe o payload em PT
 * (compatível com o que era enviado ao n8n) e cria um Appointment no banco.
 *
 * Não dispara WhatsApp nem e-mail ainda.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Corpo inválido." },
        { status: 400 }
      );
    }

    const {
      nome,
      whatsapp,
      tipoVeiculo,
      modeloVeiculo,
      placa,
      servico,
      porte,
      valor,
      data,
      horario,
      observacoes,
      origem,
    } = body as Record<string, unknown>;

    const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

    // Campos obrigatórios
    const errors: string[] = [];
    if (!str(nome)) errors.push("nome");
    if (str(whatsapp).replace(/\D/g, "").length < 10) errors.push("whatsapp");
    if (!str(tipoVeiculo)) errors.push("tipoVeiculo");
    if (!str(modeloVeiculo)) errors.push("modeloVeiculo");
    if (!str(servico)) errors.push("servico");
    if (!str(data)) errors.push("data");
    if (!str(horario)) errors.push("horario");
    if (errors.length) {
      return NextResponse.json(
        {
          success: false,
          error: `Campos obrigatórios ausentes ou inválidos: ${errors.join(", ")}.`,
        },
        { status: 400 }
      );
    }

    const appointmentDate = parseBRDate(str(data));
    if (!appointmentDate) {
      return NextResponse.json(
        { success: false, error: "Data inválida (use DD/MM/AAAA)." },
        { status: 400 }
      );
    }

    // valor é opcional/estimado; se vier inválido, registra 0.
    const amountNum = parseCurrency(valor);
    const amount = Number.isFinite(amountNum) && amountNum > 0 ? amountNum : 0;

    const optional = (v: unknown) => {
      const s = str(v);
      return s ? s : null;
    };

    const created = await prisma.appointment.create({
      data: {
        customerName: str(nome),
        whatsapp: str(whatsapp),
        vehicleType: str(tipoVeiculo),
        vehicleModel: str(modeloVeiculo),
        plate: optional(placa),
        serviceName: str(servico),
        serviceCategory: null,
        vehicleSize: optional(porte),
        amount: new Prisma.Decimal(amount.toFixed(2)),
        appointmentDate,
        appointmentTime: str(horario),
        notes: optional(observacoes),
        source: str(origem) || "site-authentic-motors",
        // status PENDING por padrão (schema)
      },
    });

    return NextResponse.json(
      { success: true, appointment: serializeAppointment(created) },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/appointments]", err);
    return NextResponse.json(
      { success: false, error: "Erro ao criar agendamento." },
      { status: 500 }
    );
  }
}
