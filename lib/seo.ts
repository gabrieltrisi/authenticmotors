import { SITE } from "./config";

/**
 * Schema.org LocalBusiness (AutoWash) para SEO local.
 * Renderizado como JSON-LD no <head> via layout.
 */
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoWash",
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    image: `${SITE.url}/og-image.jpg`,
    telephone: `+${SITE.whatsappNumber}`,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.state,
      addressCountry: "BR",
    },
    sameAs: [SITE.instagram.url],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "08:00",
      closes: "18:00",
    },
    makesOffer: [
      "Tratamento Nível 1, 2 e 3 para carros",
      "Lavagem de motor",
      "Tratamento para motos",
      "Restauração de faróis",
      "Higienização de bancos",
      "Remoção de chuva ácida",
    ].map((name) => ({ "@type": "Offer", name })),
  };
}
