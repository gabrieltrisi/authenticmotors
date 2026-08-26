"use client";

import { useEffect, useRef } from "react";

/**
 * Fundo do hero com parallax sutil: o padrão hexagonal e os brilhos cobre
 * seguem levemente o cursor (só desktop, respeita prefers-reduced-motion).
 */
export function HeroBackground() {
  const hex = useRef<HTMLDivElement>(null);
  const b1 = useRef<HTMLDivElement>(null);
  const b2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (hex.current) hex.current.style.transform = `translate(${(x * -14).toFixed(1)}px, ${(y * -14).toFixed(1)}px)`;
        if (b1.current) b1.current.style.transform = `translate(${(x * 34).toFixed(1)}px, ${(y * 34).toFixed(1)}px)`;
        if (b2.current) b2.current.style.transform = `translate(${(x * -26).toFixed(1)}px, ${(y * -26).toFixed(1)}px)`;
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div className="absolute inset-0 bg-dark-radial" aria-hidden />
      <div
        ref={hex}
        className="hex-pattern absolute -inset-12 opacity-60 [transition:transform_.3s_ease-out]"
        aria-hidden
      />
      <div
        ref={b1}
        className="absolute -left-40 top-1/4 h-[480px] w-[480px] rounded-full bg-copper/20 blur-[120px] [transition:transform_.45s_ease-out]"
        aria-hidden
      />
      <div
        ref={b2}
        className="absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full bg-copper-dark/20 blur-[120px] [transition:transform_.45s_ease-out]"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"
        aria-hidden
      />
    </>
  );
}
