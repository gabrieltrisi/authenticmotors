"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, CalendarDays, Wallet, TrendingUp, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/admin/agendamentos", label: "Agendamentos", icon: CalendarDays },
  { href: "/admin/caixa", label: "Caixa", icon: Wallet },
  { href: "/admin/faturamento", label: "Faturamento", icon: TrendingUp },
] as const;

/**
 * Navegação interna do painel administrativo. Compartilhada por /admin,
 * /admin/agendamentos e /admin/caixa para alternar entre as áreas.
 */
export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <nav className="flex gap-2 overflow-x-auto pb-3 pt-1">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
              active
                ? "border-copper-light bg-copper/15 text-white"
                : "border-copper text-foreground-muted hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={logout}
        className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-full border border-copper px-4 py-1.5 text-xs font-semibold text-foreground-muted transition-colors hover:border-red-500/60 hover:text-red-300"
      >
        <LogOut className="h-4 w-4" />
        Sair
      </button>
    </nav>
  );
}
