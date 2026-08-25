/**
 * Catálogo fixo de serviços da Authentic Motors.
 *
 * Usado no formulário do Caixa para pré-preencher um lançamento (descrição,
 * serviço, valor e categoria). É uma tabela de referência estática — não
 * depende do banco. Para serviços com porte (Sedan/Hatch vs SUV), cada porte
 * é um item distinto, já com o preço correspondente.
 */

export type ServiceCategory = "Carros" | "Motos" | "Adicionais";
export type ServiceVehicleType = "Carro" | "Moto";

export interface CatalogService {
  id: string;
  category: ServiceCategory;
  name: string;
  vehicleType: ServiceVehicleType;
  price: number;
}

export const SERVICES_CATALOG: CatalogService[] = [
  // ---------------- CARROS ----------------
  { id: "carro-n1-sedan", category: "Carros", name: "Tratamento Nível 1 Sedan/Hatch", vehicleType: "Carro", price: 55 },
  { id: "carro-n1-suv", category: "Carros", name: "Tratamento Nível 1 SUV", vehicleType: "Carro", price: 65 },
  { id: "carro-n2-sedan", category: "Carros", name: "Tratamento Nível 2 Sedan/Hatch", vehicleType: "Carro", price: 75 },
  { id: "carro-n2-suv", category: "Carros", name: "Tratamento Nível 2 SUV", vehicleType: "Carro", price: 90 },
  { id: "carro-n3-sedan", category: "Carros", name: "Tratamento Nível 3 Sedan/Hatch", vehicleType: "Carro", price: 120 },
  { id: "carro-n3-suv", category: "Carros", name: "Tratamento Nível 3 SUV", vehicleType: "Carro", price: 150 },
  { id: "carro-motor-sedan", category: "Carros", name: "Lavagem de Motor Sedan/Hatch", vehicleType: "Carro", price: 70 },
  { id: "carro-motor-suv", category: "Carros", name: "Lavagem de Motor SUV", vehicleType: "Carro", price: 90 },

  // ---------------- MOTOS ----------------
  { id: "moto-n1", category: "Motos", name: "Tratamento Nível 1 Moto", vehicleType: "Moto", price: 30 },
  { id: "moto-n2", category: "Motos", name: "Tratamento Nível 2 Moto", vehicleType: "Moto", price: 60 },

  // ---------------- ADICIONAIS ----------------
  { id: "farois-frontais", category: "Adicionais", name: "Restauração de Faróis Frontais", vehicleType: "Carro", price: 100 },
  { id: "farois-traseiros", category: "Adicionais", name: "Restauração de Faróis Traseiros", vehicleType: "Carro", price: 80 },
  { id: "farois-completo", category: "Adicionais", name: "Restauração de Faróis Completo", vehicleType: "Carro", price: 270 },
  { id: "bancos-frontais", category: "Adicionais", name: "Higienização de Bancos Frontais", vehicleType: "Carro", price: 200 },
  { id: "bancos-completos", category: "Adicionais", name: "Higienização de Bancos Completos", vehicleType: "Carro", price: 350 },
  { id: "chuva-acida", category: "Adicionais", name: "Remoção de Chuva Ácida", vehicleType: "Carro", price: 60 },
];

/** Acesso rápido por id. */
export const SERVICES_BY_ID: Record<string, CatalogService> = Object.fromEntries(
  SERVICES_CATALOG.map((s) => [s.id, s])
);

const CATEGORY_ORDER: ServiceCategory[] = ["Carros", "Motos", "Adicionais"];

/** Serviços agrupados por categoria (para o <optgroup> do select). */
export const SERVICES_GROUPED: Array<{
  category: ServiceCategory;
  items: CatalogService[];
}> = CATEGORY_ORDER.map((category) => ({
  category,
  items: SERVICES_CATALOG.filter((s) => s.category === category),
}));
