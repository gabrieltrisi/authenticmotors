import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Botão base no estilo Shadcn/UI, adaptado à identidade cobre da Authentic Motors.
 * Por padrão renderiza <button>; passe `asChild` via Slot apenas se necessário —
 * aqui mantemos simples e usamos <a> diretamente nas CTAs externas.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper-light focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-copper-gradient text-white shadow-copper hover:shadow-copper-lg hover:brightness-110",
        outline:
          "border border-copper text-foreground hover:border-copper-light hover:bg-copper/10",
        ghost: "text-foreground-muted hover:text-white hover:bg-white/5",
        dark: "bg-background-secondary text-white border border-copper hover:bg-copper/15",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6",
        lg: "h-14 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export interface ButtonLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof buttonVariants> {}

/** Versão âncora — usada nas CTAs que abrem o WhatsApp em nova aba. */
const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ className, variant, size, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
ButtonLink.displayName = "ButtonLink";

export { Button, ButtonLink, buttonVariants };
