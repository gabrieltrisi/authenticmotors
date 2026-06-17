# Authentic Motors — Site Institucional

Versão digital premium do catálogo da **Authentic Motors** (estética automotiva).
Foco em conversão: todos os botões direcionam para o **WhatsApp**. Não há
sistema de agendamento nesta fase.

## Stack

- **Next.js 15** (App Router) + **React 19**
- **TypeScript**
- **TailwindCSS** (tema cobre/escuro do catálogo)
- Componentes no estilo **Shadcn/UI** (`components/ui`)
- **Lucide Icons**

## Estrutura

```
app/            layout (SEO/JSON-LD), page, robots, sitemap, globals.css
components/      Header, Footer, ServiceCard, PriceTag, etc.
  ui/           primitivos (button)
  sections/     Hero, Cars, Motos, Additional, Gallery, CTA
lib/            config (contato), data (serviços/preços), whatsapp, seo, utils
types/          tipos de domínio
public/gallery/ imagens da galeria (placeholders até serem adicionadas)
```

Todo o conteúdo de serviços/preços vive em [`lib/data.ts`](lib/data.ts) — nada
hardcoded nos componentes.

## Configuração obrigatória

Antes de publicar, ajuste [`lib/config.ts`](lib/config.ts):

- `whatsappNumber` — número real no formato `55DDDNUMERO` (sem símbolos).
- `url`, `address`, `instagram`, `hours`.

Adicione também `public/og-image.jpg` (1200×630) para Open Graph.

## Como rodar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de produção
npm start        # servir build
```

## Identidade visual

Paleta extraída do catálogo:

| Token              | Cor                     |
| ------------------ | ----------------------- |
| Fundo principal    | `#0B0B0B`               |
| Fundo secundário   | `#151515`               |
| Cobre principal    | `#A65F3C`               |
| Cobre claro        | `#C47A4A`               |
| Texto              | `#FFFFFF`               |
| Texto secundário   | `#CFCFCF`               |
| Bordas             | `rgba(166,95,60,0.3)`   |

Fontes: **Oswald** (display) + **Inter** (texto). Fundo com gradientes suaves
e textura hexagonal discreta.

## Deploy Notes

- Vercel production branch: main
- Cron reminders route: /api/cron/reminders
- Last deploy trigger: manual sync
