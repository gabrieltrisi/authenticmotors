"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { STATUS_META, type AdminAppointment, type AppointmentStatus } from "@/lib/admin";
import { cn } from "@/lib/utils";

const WD = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DOT: Record<AppointmentStatus, string> = {
  pendente: "bg-amber-400",
  confirmado: "bg-sky-400",
  concluido: "bg-emerald-400",
  cancelado: "bg-red-400",
};

function parse(data: string) {
  const [d, m, y] = (data || "").split("/").map(Number);
  return { d, m, y };
}

export function AppointmentsCalendar({ items }: { items: AdminAppointment[] }) {
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });

  const byDay = useMemo(() => {
    const map = new Map<number, AdminAppointment[]>();
    for (const a of items) {
      const p = parse(a.data);
      if (p.y === ym.y && p.m - 1 === ym.m) {
        const arr = map.get(p.d) ?? [];
        arr.push(a);
        map.set(p.d, arr);
      }
    }
    for (const arr of map.values()) arr.sort((a, b) => (a.horario || "").localeCompare(b.horario || ""));
    return map;
  }, [items, ym]);

  const startWd = new Date(ym.y, ym.m, 1).getDay();
  const daysInMonth = new Date(ym.y, ym.m + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWd; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const todayD = now.getFullYear() === ym.y && now.getMonth() === ym.m ? now.getDate() : -1;
  const move = (delta: number) =>
    setYm(({ y, m }) => {
      const dt = new Date(y, m + delta, 1);
      return { y: dt.getFullYear(), m: dt.getMonth() };
    });

  return (
    <div className="p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={() => move(-1)} aria-label="Mês anterior" className="grid h-9 w-9 place-items-center rounded-full border border-copper text-copper-light transition hover:bg-copper/15">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="font-display text-base font-extrabold uppercase text-white sm:text-lg">
          {MONTHS[ym.m]} {ym.y}
        </h3>
        <button type="button" onClick={() => move(1)} aria-label="Próximo mês" className="grid h-9 w-9 place-items-center rounded-full border border-copper text-copper-light transition hover:bg-copper/15">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wider text-copper-light">
        {WD.map((w) => (
          <div key={w} className="py-1">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} className="min-h-[62px] rounded-lg bg-background/20 sm:min-h-[92px]" />;
          const list = byDay.get(d) ?? [];
          const isToday = d === todayD;
          return (
            <div key={i} className={cn("min-h-[62px] rounded-lg border p-1.5 sm:min-h-[92px]", isToday ? "border-copper-light bg-copper/10" : "border-copper/40 bg-background/50")}>
              <div className={cn("mb-1 text-xs font-bold", isToday ? "text-copper-light" : "text-foreground-muted")}>{d}</div>
              <div className="space-y-1">
                {list.slice(0, 2).map((a, j) => (
                  <div key={j} className="flex items-center gap-1 truncate rounded bg-background-secondary px-1 py-0.5 text-[10px] text-white" title={`${a.horario} · ${a.nome} — ${a.servico}`}>
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT[a.status])} />
                    <span className="truncate">{a.horario} {a.nome}</span>
                  </div>
                ))}
                {list.length > 2 && <div className="text-[10px] font-semibold text-copper-light">+{list.length - 2} mais</div>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-foreground-muted">
        {(["pendente", "confirmado", "concluido", "cancelado"] as AppointmentStatus[]).map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", DOT[s])} />
            {STATUS_META[s].label}
          </span>
        ))}
      </div>
    </div>
  );
}
