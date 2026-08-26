"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export type BeforeAfterPair = { id: string; antes: string; depois: string };

/**
 * Carrossel de comparação Antes/Depois.
 * - Arraste (ou passe o mouse) sobre a imagem para revelar a transformação.
 * - Setas + dots (e swipe no toque) navegam entre os carros.
 */
export function BeforeAfterCarousel({ pairs }: { pairs: BeforeAfterPair[] }) {
  const [idx, setIdx] = useState(0);
  const [pos, setPos] = useState(50);
  const boxRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const swipeStart = useRef<{ x: number; pos: number } | null>(null);

  if (!pairs.length) return null;
  const cur = pairs[idx];
  const clamp = (v: number) => Math.max(2, Math.min(98, v));

  const setFromX = (clientX: number) => {
    const el = boxRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(clamp(((clientX - r.left) / r.width) * 100));
  };

  const go = (d: number) => {
    setIdx((i) => (i + d + pairs.length) % pairs.length);
    setPos(50);
  };

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    swipeStart.current = { x: e.clientX, pos };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    setFromX(e.clientX);
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") {
      // no toque: swipe horizontal grande troca de carro; caso contrário move a divisória
      if (!dragging.current || !swipeStart.current) return;
      setFromX(e.clientX);
      return;
    }
    setFromX(e.clientX);
  };
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" && swipeStart.current) {
      const dx = e.clientX - swipeStart.current.x;
      if (Math.abs(dx) > 70) go(dx < 0 ? 1 : -1);
    }
    dragging.current = false;
    swipeStart.current = null;
  };

  return (
    <div className="mx-auto mt-12 max-w-3xl">
      <div
        ref={boxRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={() => {
          dragging.current = false;
          swipeStart.current = null;
        }}
        className="group relative aspect-[4/3] w-full touch-pan-y cursor-ew-resize select-none overflow-hidden rounded-3xl border border-copper bg-background shadow-copper-lg"
      >
        {/* DEPOIS (base) */}
        <Image
          src={cur.depois}
          alt="Depois do detalhamento"
          fill
          sizes="(max-width: 768px) 92vw, 720px"
          className="pointer-events-none object-cover"
          priority
        />
        {/* ANTES (por cima, cortado pela divisória) */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Image
            src={cur.antes}
            alt="Antes do detalhamento"
            fill
            sizes="(max-width: 768px) 92vw, 720px"
            className="pointer-events-none object-cover"
          />
        </div>

        {/* selos */}
        <span className="pointer-events-none absolute left-4 top-4 rounded-full border border-copper bg-background/70 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-foreground backdrop-blur">
          Antes
        </span>
        <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-copper-gradient px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-copper backdrop-blur">
          Depois
        </span>

        {/* divisória + handle */}
        <div
          className="pointer-events-none absolute inset-y-0"
          style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
          aria-hidden
        >
          <div className="h-full w-[3px] bg-copper shadow-[0_0_18px_rgba(0,0,0,.7)]" />
          <div className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-copper bg-background/90 text-copper-light shadow-copper backdrop-blur">
            <MoveHorizontal className="h-5 w-5" />
          </div>
        </div>

        {/* dica */}
        <span className="pointer-events-none absolute inset-x-0 bottom-4 mx-auto w-fit rounded-full bg-background/70 px-3 py-1 text-[11px] text-foreground-muted backdrop-blur transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
          ← arraste para comparar →
        </span>
      </div>

      {/* controles */}
      <div className="mt-6 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Carro anterior"
          className="grid h-11 w-11 place-items-center rounded-full border border-copper text-copper-light transition hover:bg-copper/15"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          {pairs.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setIdx(i);
                setPos(50);
              }}
              aria-label={`Ver comparação ${i + 1}`}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === idx ? "w-6 bg-copper" : "w-2 bg-foreground-muted/40 hover:bg-foreground-muted/70"
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Próximo carro"
          className="grid h-11 w-11 place-items-center rounded-full border border-copper text-copper-light transition hover:bg-copper/15"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
