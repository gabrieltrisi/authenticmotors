"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, AlertTriangle, Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace("/admin");
        router.refresh();
      } else {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Não foi possível entrar.");
      }
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="hex-pattern fixed inset-0 opacity-30" aria-hidden />
      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-sm rounded-2xl border border-copper bg-background-secondary/80 p-8 backdrop-blur-sm shadow-copper-lg"
      >
        <div className="flex flex-col items-center text-center">
          <Logo withWordmark={false} size={56} />
          <h1 className="mt-5 font-display text-2xl font-extrabold uppercase text-white">Painel Administrativo</h1>
          <p className="mt-1 text-sm text-foreground-muted">Acesso restrito à equipe.</p>
        </div>

        <label className="mt-8 block">
          <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-copper-light">
            <Lock className="h-3.5 w-3.5" /> Senha
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="w-full rounded-xl border border-copper bg-background px-4 py-3 text-white outline-none placeholder:text-foreground-muted focus:border-copper-light"
            placeholder="••••••••"
          />
        </label>

        {error && (
          <p className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-6 w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
