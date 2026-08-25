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

/**
 * Normaliza um telefone brasileiro para o formato esperado pelo wa.me
 * (apenas dígitos, com DDI 55).
 *   - remove espaços, parênteses, hífen e demais não-dígitos;
 *   - 10 (fixo) ou 11 (celular) dígitos -> adiciona 55;
 *   - já com 55 (12/13 dígitos) -> mantém.
 * Retorna "" quando não há dígitos suficientes para um número válido.
 */
export function normalizeBRPhone(phone: string): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits.length >= 12 ? digits : "";
}

/**
 * Monta um link wa.me para um telefone específico com mensagem pré-preenchida.
 * Retorna null quando o telefone não é válido o suficiente.
 */
export function waLinkTo(phone: string, message: string): string | null {
  const num = normalizeBRPhone(phone);
  if (!num) return null;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}
