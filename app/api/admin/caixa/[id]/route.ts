import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * DELETE /api/admin/caixa/[id]
 * Exclui uma movimentação pelo id.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID não informado." },
        { status: 400 }
      );
    }

    await prisma.cashMovement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    // Registro inexistente -> 404
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return NextResponse.json(
        { success: false, error: "Movimentação não encontrada." },
        { status: 404 }
      );
    }
    console.error("[DELETE /api/admin/caixa/[id]]", err);
    return NextResponse.json(
      { success: false, error: "Erro ao excluir movimentação." },
      { status: 500 }
    );
  }
}
