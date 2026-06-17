/**
 * Configurações globais de negócio.
 * Centralize aqui contatos, redes sociais e endereço — nada hardcoded em componentes.
 */

export const SITE = {
  name: "Authentic Motors",
  shortName: "Authentic Motors",
  tagline: "Estética Automotiva Premium",
  description:
    "Tratamentos automotivos especializados para carros e motos com acabamento profissional e proteção duradoura.",
  url: "https://www.authenticmotors.com.br",
  // Número internacional sem espaços/símbolos: 55 (Brasil) + DDD + número.
  // Lido de NEXT_PUBLIC_WHATSAPP_NUMBER (embutido no bundle por ser público);
  // o valor abaixo é apenas o fallback caso a env não esteja definida.
  whatsappNumber:
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5575982799973",
  instagram: {
    handle: "@authenticmotorsrj",
    url: "https://instagram.com/authenticmotorsrj",
  },
  address: {
    street: "Avenida Eliel Martins, BA-120 — Barra do Vento",
    city: "Riachão do Jacuípe",
    state: "BA",
    full: "Avenida Eliel Martins, BA-120 — Barra do Vento, Riachão do Jacuípe - BA",
  },
  hours: "Seg a Sáb · 08h às 18h",
} as const;
