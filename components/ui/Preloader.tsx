"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

/**
 * Preloader da marca: o selo "AM" com um anel cobre girando (evoca a politriz),
 * brilho passando e o wordmark. Some com fade após ~1.5s (curto no reduced-motion).
 */
export function Preloader() {
  const pathname = usePathname();
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setDone(true), reduce ? 300 : 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setGone(true), 600);
    return () => clearTimeout(t);
  }, [done]);

  if (gone || pathname?.startsWith("/admin")) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] grid place-items-center bg-background transition-opacity duration-500 ${
        done ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="hex-pattern absolute inset-0 opacity-30" />
      <div className="relative flex flex-col items-center gap-6">
        <div className="relative grid h-28 w-28 place-items-center">
          <span className="pl-ring" />
          <span className="relative grid h-24 w-24 place-items-center overflow-hidden rounded-full border border-copper bg-background-secondary shadow-copper">
            <Image src="/logo.png" alt="Authentic Motors" width={70} height={70} priority className="pl-logo rounded-full" />
            <span className="pl-shine pointer-events-none absolute inset-0" />
          </span>
        </div>

        <div className="flex flex-col items-center leading-none">
          <span className="font-display text-2xl font-extrabold uppercase tracking-wide text-white">Authentic</span>
          <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.4em] text-copper-light">Motors</span>
        </div>

        <span className="mt-1 block h-[3px] w-40 overflow-hidden rounded-full bg-copper/20">
          <span className="pl-fill block h-full w-full bg-copper-gradient" />
        </span>
      </div>
    </div>
  );
}
