"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Revela o conteúdo com um leve fade + slide quando entra na viewport.
 * Respeita prefers-reduced-motion (aparece direto).
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 24,
  tilt = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  tilt?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown
          ? "none"
          : tilt
            ? `perspective(1200px) rotateX(7deg) translateY(${y}px)`
            : `translateY(${y}px)`,
        transformOrigin: "center top",
        transition: `opacity .7s cubic-bezier(.16,1,.3,1) ${delay}ms, transform .8s cubic-bezier(.16,1,.3,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
