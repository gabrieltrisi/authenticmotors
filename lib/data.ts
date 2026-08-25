import type {
  AdditionalService,
  GalleryItem,
  NavLink,
  ServicePlan,
} from "@/types";

/* ------------------------------------------------------------------ */
/*  NAVEGAÇÃO                                                          */
/* ------------------------------------------------------------------ */

export const NAV_LINKS: NavLink[] = [
  { label: "Início", href: "#inicio" },
  { label: "Serviços", href: "#servicos" },
  { label: "Carros", href: "#carros" },
  { label: "Motos", href: "#motos" },
  { label: "Adicionais", href: "#adicionais" },
  { label: "Agendamento", href: "#agendamento" },
  { label: "Contato", href: "#contato" },
];

/* ------------------------------------------------------------------ */
/*  CARROS                                                             */
/* ------------------------------------------------------------------ */

export const CAR_PLANS: ServicePlan[] = [
  {
    id: "carro-nivel-1",
    eyebrow: "Carros",
    title: "Tratamento Nível 1",
    price: { kind: "vehicle", sedan: 55, suv: 65 },
    items: [
      "Pré lavagem com Snow Foam",
      "Aspiração Interna",
      "Limpeza de tapetes, painel e portas",
      "Lavagem de rodas, caixa de rodas e pneus",
      "Pretinho no pneu",
      "Limpeza dos vidros",
    ],
    whatsappMessage: "Olá! Tenho interesse no Tratamento Nível 1 para carro.",
  },
  {
    id: "carro-nivel-2",
    eyebrow: "Carros",
    title: "Tratamento Nível 2",
    badge: "1 mês de proteção",
    price: { kind: "vehicle", sedan: 75, suv: 90 },
    items: [
      "Pré lavagem com Snow Foam",
      "Aspiração Interna",
      "Limpeza de tapetes, painel e portas",
      "Revitalização de plásticos internos",
      "Lavagem de rodas, caixa de rodas e pneus",
      "Selante de pneu",
      "Enceramento técnico",
    ],
    whatsappMessage: "Olá! Tenho interesse no Tratamento Nível 2 para carro.",
  },
  {
    id: "carro-nivel-3",
    eyebrow: "Carros",
    title: "Tratamento Nível 3",
    badge: "4 meses de proteção",
    featured: true,
    price: { kind: "vehicle", sedan: 120, suv: 150 },
    items: [
      "Pré lavagem com Snow Foam detalhada",
      "Aspiração Interna",
      "Limpeza de tapetes, painel e portas",
      "Revitalização de plásticos internos",
      "Lavagem de rodas, caixa de rodas e pneus",
      "Selante de pneu",
      "Enceramento técnico",
      "Condicionamento das caixas de rodas",
      "Cristalização dos vidros",
    ],
    whatsappMessage: "Olá! Tenho interesse no Tratamento Nível 3 para carro.",
  },
];

export const ENGINE_WASH: ServicePlan = {
  id: "lavagem-motor",
  eyebrow: "Carros",
  title: "Lavagem de Motor",
  price: { kind: "vehicle", sedan: 70, suv: 90 },
  items: [
    "Pré lavagem detalhada com Snow Foam",
    "Pré lavagem",
    "Revitalização de borrachas",
    "Verniz de motor",
  ],
  whatsappMessage: "Olá! Tenho interesse na Lavagem de Motor.",
};

/* ------------------------------------------------------------------ */
/*  MOTOS                                                              */
/* ------------------------------------------------------------------ */

export const MOTO_PLANS: ServicePlan[] = [
  {
    id: "moto-nivel-1",
    eyebrow: "Motos",
    title: "Tratamento Nível 1",
    price: { kind: "single", value: 30 },
    items: [
      "Pré lavagem com Snow Foam",
      "Lavagem de aros e pneus",
      "Pneus pretinhos",
    ],
    whatsappMessage: "Olá! Tenho interesse no Tratamento Nível 1 para moto.",
  },
  {
    id: "moto-nivel-2",
    eyebrow: "Motos",
    title: "Tratamento Nível 2",
    featured: true,
    price: { kind: "single", value: 60 },
    items: [
      "Pré lavagem com Snow Foam detalhada",
      "Revitalização de plásticos",
      "Pneus pretinhos",
      "Verniz de motor",
      "Lavagem de aros e pneus",
      "Enceramento técnico",
      "Selante de pneu",
    ],
    whatsappMessage: "Olá! Tenho interesse no Tratamento Nível 2 para moto.",
  },
];

/* ------------------------------------------------------------------ */
/*  SERVIÇOS ADICIONAIS                                                */
/* ------------------------------------------------------------------ */

export const ADDITIONAL_SERVICES: AdditionalService[] = [
  {
    id: "restauracao-farois",
    title: "Restauração de Faróis",
    description:
      "Recuperação do brilho e transparência, removendo o amarelado e a opacidade.",
    price: {
      kind: "tiered",
      tiers: [
        { label: "Frontais", value: 100 },
        { label: "Traseiros", value: 80 },
        { label: "Completo", value: 270 },
      ],
    },
    whatsappMessage: "Olá! Tenho interesse na Restauração de Faróis.",
  },
  {
    id: "higienizacao-bancos",
    title: "Higienização de Bancos",
    description: "Lavagem e higienização profunda de bancos em tecido.",
    price: {
      kind: "tiered",
      tiers: [
        { label: "Frontais", value: 200 },
        { label: "Completos", value: 350 },
      ],
    },
    whatsappMessage: "Olá! Tenho interesse na Higienização dos Bancos.",
  },
  {
    id: "chuva-acida",
    title: "Remoção de Chuva Ácida",
    description: "Remoção de chuva ácida e aplicação de proteção hidrofóbica.",
    price: { kind: "single", value: 60 },
    benefits: [
      "Remoção de manchas",
      "Eliminação de marcas",
      "Proteção hidrofóbica",
    ],
    whatsappMessage: "Olá! Tenho interesse na Remoção de Chuva Ácida.",
  },
];

/* ------------------------------------------------------------------ */
/*  GALERIA — ANTES E DEPOIS                                           */
/*  Estrutura pronta para receber imagens reais em /public/gallery.   */
/* ------------------------------------------------------------------ */

export const GALLERY_ITEMS: GalleryItem[] = [
  { id: "antescarro01", label: "Antes", image: "/images/catalog/antescarro01.jpeg" },
  { id: "depoiscarro01", label: "Depois", image: "/images/catalog/depoiscarro01.jpeg" },
  { id: "antescarro02", label: "Antes", image: "/images/catalog/antescarro02.jpeg" },
  { id: "depoiscarro02", label: "Depois", image: "/images/catalog/depoiscarro02.jpeg" },
  { id: "antescarro03", label: "Antes", image: "/images/catalog/antescarro03.jpeg" },
  { id: "depoiscarro03", label: "Depois", image: "/images/catalog/depoiscarro03.jpeg" },
];
