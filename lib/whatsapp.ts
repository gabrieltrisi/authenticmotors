import { SITE } from "./config";

/**
 * Monta um link wa.me com mensagem pré-preenchida.
 * Toda CTA do site passa por aqui — facilita trocar número/origem em um só lugar.
 */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${SITE.whatsappNumber}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** Mensagem genérica usada no header/hero/CTA final. */
export const DEFAULT_WHATSAPP_MESSAGE =
  "Olá! Gostaria de mais informações sobre os serviços da Authentic Motors.";
