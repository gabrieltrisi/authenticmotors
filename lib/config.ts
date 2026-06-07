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
  whatsappNumber: "5575991472818",
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
