import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/admin-auth";

// Rotas liberadas (o próprio login/logout).
const PUBLIC = new Set(["/admin/login", "/api/admin/login", "/api/admin/logout"]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.has(pathname)) return NextResponse.next();

  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const ok = await verifyAdminToken(token, process.env.ADMIN_SESSION_SECRET || "");
  if (ok) return NextResponse.next();

  // APIs → 401; páginas → redireciona pro login.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
