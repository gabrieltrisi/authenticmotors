# Galeria — Antes e Depois

Coloque aqui as imagens reais (ex.: `g1.jpg`, `g2.jpg`...) e referencie-as em
`lib/data.ts` no campo `image` de cada item de `GALLERY_ITEMS`:

```ts
{ id: "g1", title: "Polimento técnico", image: "/gallery/g1.jpg" }
```

Recomendado: imagens otimizadas em `.webp`/`.avif`, proporção 4:3,
no mínimo 1200px de largura. Enquanto não houver imagem, um placeholder
premium "Imagem em breve" é exibido automaticamente.
