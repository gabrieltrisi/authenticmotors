import { NextResponse } from "next/server";
import { makeAdminToken, ADMIN_COOKIE, ADMIN_MAX_AGE } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = body && typeof body.password === "string" ? body.password : "";

  const expected = process.env.ADMIN_PASSWORD || "";
  const secret = process.env.ADMIN_SESSION_SECRET || "";

  if (!expected || !secret) {
    return NextResponse.json(
      { ok: false, error: "Autenticação não configurada no servidor." },
      { status: 500 }
    );
  }

  // comparação simples (senha única do admin)
  if (password.length === 0 || password !== expected) {
    return NextResponse.json({ ok: false, error: "Senha incorreta." }, { status: 401 });
  }

  const token = await makeAdminToken(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_MAX_AGE,
  });
  return res;
}
