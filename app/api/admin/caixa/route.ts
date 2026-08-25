import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Prisma exige runtime Node (não Edge) e dados sempre frescos.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MOVEMENT_TYPES = ["ENTRY", "EXIT"] as const;
const PAYMENT_METHODS = [
  "CASH",
  "PIX",
  "DEBIT_CARD",
  "CREDIT_CARD",
  "OTHER",
] as const;

type MovementType = (typeof MOVEMENT_TYPES)[number];
type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Serializa um registro do Prisma para JSON (Decimal -> number). */
function serialize(m: {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  type: string;
  description: string;
  amount: Prisma.Decimal;
  paymentMethod: string;
  category: string | null;
  customerName: string | null;
  serviceName: string | null;
  notes: string | null;
  movementDate: Date;
  createdBy: string | null;
}) {
  return {
    ...m,
    amount: Number(m.amount),
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
    movementDate: m.movementDate.toISOString(),
  };
}

/**
 * GET /api/admin/caixa
 * Lista as movimentações. Filtro opcional por dia via `?date=YYYY-MM-DD`.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date"); // YYYY-MM-DD
    const month = searchParams.get("month"); // YYYY-MM

    let where: Prisma.CashMovementWhereInput | undefined;
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      // Janela do mês inteiro em UTC.
      const [y, m] = month.split("-").map(Number);
      const start = new Date(Date.UTC(y, m - 1, 1));
      const end = new Date(Date.UTC(y, m, 1)); // primeiro dia do mês seguinte
      where = { movementDate: { gte: start, lt: end } };
    } else if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      // Janela do dia em UTC (cliente grava movementDate ao meio-dia UTC).
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
      where = { movementDate: { gte: start, lt: end } };
    }

    const items = await prisma.cashMovement.findMany({
      where,
      orderBy: { movementDate: "desc" },
    });

    return NextResponse.json({ success: true, items: items.map(serialize) });
  } catch (err) {
    console.error("[GET /api/admin/caixa]", err);
    return NextResponse.json(
      { success: false, error: "Erro ao listar movimentações." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/caixa
 * Cria uma movimentação (lançamento de entrada ou saída).
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
      type,
      description,
      amount,
      paymentMethod,
      category,
      customerName,
      serviceName,
      notes,
      movementDate,
      createdBy,
    } = body as Record<string, unknown>;

    // Validações
    if (!MOVEMENT_TYPES.includes(type as MovementType)) {
      return NextResponse.json(
        { success: false, error: "Tipo inválido (ENTRY ou EXIT)." },
        { status: 400 }
      );
    }
    if (!PAYMENT_METHODS.includes(paymentMethod as PaymentMethod)) {
      return NextResponse.json(
        { success: false, error: "Forma de pagamento inválida." },
        { status: 400 }
      );
    }
    if (typeof description !== "string" || !description.trim()) {
      return NextResponse.json(
        { success: false, error: "Descrição é obrigatória." },
        { status: 400 }
      );
    }
    const amountNum =
      typeof amount === "number" ? amount : Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { success: false, error: "Valor deve ser um número maior que zero." },
        { status: 400 }
      );
    }
    const when =
      typeof movementDate === "string" && movementDate
        ? new Date(movementDate)
        : new Date();
    if (Number.isNaN(when.getTime())) {
      return NextResponse.json(
        { success: false, error: "Data da movimentação inválida." },
        { status: 400 }
      );
    }

    const optionalStr = (v: unknown) =>
      typeof v === "string" && v.trim() ? v.trim() : null;

    const created = await prisma.cashMovement.create({
      data: {
        type: type as MovementType,
        description: description.trim(),
        amount: new Prisma.Decimal(amountNum.toFixed(2)),
        paymentMethod: paymentMethod as PaymentMethod,
        category: optionalStr(category),
        customerName: optionalStr(customerName),
        serviceName: optionalStr(serviceName),
        notes: optionalStr(notes),
        movementDate: when,
        createdBy: optionalStr(createdBy),
      },
    });

    return NextResponse.json(
      { success: true, item: serialize(created) },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/admin/caixa]", err);
    return NextResponse.json(
      { success: false, error: "Erro ao registrar movimentação." },
      { status: 500 }
    );
  }
}
