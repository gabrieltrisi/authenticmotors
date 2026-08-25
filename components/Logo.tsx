import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo oficial da Authentic Motors (badge circular "AM").
 * Arquivo em /public/logo.png.
 *
 * - `withWordmark`: exibe o nome ao lado do selo (usado no header).
 *   Em telas pequenas o wordmark some, mantendo apenas o selo.
 */
export function Logo({
  className,
  size = 40,
  withWordmark = true,
}: {
  className?: string;
  size?: number;
  withWordmark?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/logo.png"
        alt="Authentic Motors"
        width={size}
        height={size}
        priority
        className="rounded-full"
        style={{ width: size, height: size }}
      />
      {withWordmark && (
        <span className="hidden flex-col leading-none sm:flex">
          <span className="font-display text-base font-extrabold uppercase tracking-wide text-white">
            Authentic
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-copper-light">
            Motors
          </span>
        </span>
      )}
    </span>
  );
}
