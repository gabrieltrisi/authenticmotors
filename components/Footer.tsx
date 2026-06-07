import { Instagram, MapPin, Clock, MessageCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { NAV_LINKS } from "@/lib/data";
import { SITE } from "@/lib/config";
import { whatsappLink, DEFAULT_WHATSAPP_MESSAGE } from "@/lib/whatsapp";

export function Footer() {
  const year = 2026; // ano fixo para evitar mismatch de hidratação; atualize conforme necessário

  return (
    <footer
      id="contato"
      className="relative border-t border-copper bg-background-secondary"
    >
      <div className="hex-pattern absolute inset-0 opacity-40" aria-hidden />
      <div className="container relative grid gap-12 py-16 md:grid-cols-[1.3fr_1fr_1.2fr]">
        {/* Marca */}
        <div>
          <Logo />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-foreground-muted">
            {SITE.description}
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href={whatsappLink(DEFAULT_WHATSAPP_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-copper text-copper-light transition-colors hover:bg-copper/15 hover:text-white"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
            <a
              href={SITE.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-copper text-copper-light transition-colors hover:bg-copper/15 hover:text-white"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Links rápidos */}
        <nav aria-label="Links rápidos">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
            Navegação
          </h3>
          <ul className="mt-5 space-y-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-foreground-muted transition-colors hover:text-copper-light"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contato */}
        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
            Contato
          </h3>
          <ul className="mt-5 space-y-4 text-sm text-foreground-muted">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-copper-light" />
              <span>{SITE.address.full}</span>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-copper-light" />
              <span>{SITE.hours}</span>
            </li>
            <li className="flex items-start gap-3">
              <Instagram className="mt-0.5 h-4 w-4 shrink-0 text-copper-light" />
              <a
                href={SITE.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-copper-light"
              >
                {SITE.instagram.handle}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-copper">
        <div className="container flex flex-col items-center justify-between gap-2 py-6 text-center text-xs text-foreground-muted/70 sm:flex-row sm:text-left">
          <p>
            © {year} {SITE.name}. Todos os direitos reservados.
          </p>
          <p>Estética automotiva premium · Carros e Motos</p>
        </div>
      </div>
    </footer>
  );
}
