// Autenticação do admin: token assinado (HMAC-SHA256) guardado em cookie httpOnly.
// Funciona no Node (rotas API) e no Edge (middleware) via Web Crypto.

export const ADMIN_COOKIE = "am_admin";
export const ADMIN_MAX_AGE = 60 * 60 * 12; // 12 horas

async function hmacHex(msg: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Cria um token `exp.assinatura` válido por ADMIN_MAX_AGE. */
export async function makeAdminToken(secret: string): Promise<string> {
  const exp = Date.now() + ADMIN_MAX_AGE * 1000;
  const sig = await hmacHex(String(exp), secret);
  return `${exp}.${sig}`;
}

/** Verifica o token: assinatura correta e não expirado. */
export async function verifyAdminToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token || !secret) return false;
  const dot = token.indexOf(".");
  if (dot < 0) return false;
  const expStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = await hmacHex(expStr, secret);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}
