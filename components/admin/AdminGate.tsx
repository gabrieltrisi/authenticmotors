"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Lock, AlertTriangle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

/**
 * Proteção SIMPLES (temporária) do painel administrativo por senha.
 *
 * Compara a senha digitada com `NEXT_PUBLIC_ADMIN_PASSWORD`. Não é segurança
 * forte: a variável é pública (vai para o bundle do cliente). Serve apenas
 * para evitar acesso casual enquanto não há backend/autenticação real.
 */
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "";
const STORAGE_KEY = "am-admin-auth";

export function AdminGate({ children }: { children: React.ReactNode }) {
  // Evita flash/hidratação inconsistente: só decide após montar no cliente.
  const [mounted, setMounted] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        setAuthed(true);
      }
    } catch {
      // sessionStorage indisponível: segue exigindo senha nesta sessão.
    }
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!ADMIN_PASSWORD) return; // sem senha configurada não há o que validar
    if (password === ADMIN_PASSWORD) {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // ignora falha de persistência; mantém acesso só nesta render.
      }
      setAuthed(true);
      setError("");
      setPassword("");
    } else {
      setError("Senha incorreta. Tente novamente.");
    }
  }

  // Antes de montar, não renderiza nada (evita mismatch SSR/CSR).
  if (!mounted) return null;

  if (authed) return <>{children}</>;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="hex-pattern fixed inset-0 opacity-30" aria-hidden />

      <div className="relative w-full max-w-sm rounded-2xl border border-copper bg-background-secondary/80 p-8 backdrop-blur">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo withWordmark={false} size={48} />
          <h1 className="mt-4 font-display text-xl font-extrabold uppercase text-white">
            Authentic Motors
          </h1>
          <p className="mt-1 text-[11px] uppercase tracking-wider text-copper-light">
            Acesso administrativo
          </p>
        </div>

        {!ADMIN_PASSWORD ? (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Senha administrativa não configurada.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Senha"
                autoFocus
                className="w-full rounded-full border border-copper bg-background/60 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-foreground-muted/50 outline-none focus:border-copper-light focus:ring-2 focus:ring-copper/30"
              />
            </div>

            {error && (
              <p className="text-xs font-medium text-red-300">{error}</p>
            )}

            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
