/**
 * Tipos de domínio da Authentic Motors.
 * Toda a composição de serviços/preços é tipada para evitar dados soltos nas páginas.
 */

/** Preço único (ex.: motos e alguns adicionais) */
export interface SinglePrice {
  kind: "single";
  value: number;
}

/** Preço por porte de veículo (Sedan/Hatch x SUV) */
export interface VehiclePrice {
  kind: "vehicle";
  sedan: number;
  suv: number;
}

/** Preço com variações nomeadas (ex.: Frontais / Traseiros / Completo) */
export interface TieredPrice {
  kind: "tiered";
  tiers: { label: string; value: number }[];
}

export type Price = SinglePrice | VehiclePrice | TieredPrice;

export interface ServicePlan {
  id: string;
  /** Categoria/etiqueta exibida acima do título (ex.: CARROS, MOTOS) */
  eyebrow: string;
  title: string;
  /** Marcação opcional, ex.: "1 mês de proteção" */
  badge?: string;
  price: Price;
  items: string[];
  /** Plano de destaque (Nível 3) recebe tratamento visual especial */
  featured?: boolean;
  /** Texto pré-preenchido enviado ao WhatsApp */
  whatsappMessage: string;
}

export interface AdditionalService {
  id: string;
  title: string;
  description?: string;
  price: Price;
  /** Lista de benefícios opcional (ex.: chuva ácida) */
  benefits?: string[];
  whatsappMessage: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface GalleryItem {
  id: string;
  /** Apenas "Antes" ou "Depois" — sem rótulos de serviço */
  label: "Antes" | "Depois";
  /** Caminho da imagem; quando ausente, exibimos placeholder premium */
  image?: string;
}
