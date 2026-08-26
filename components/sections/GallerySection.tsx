import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { GALLERY_ITEMS } from "@/lib/data";
import { BeforeAfterCarousel, type BeforeAfterPair } from "@/components/ui/BeforeAfterCarousel";

// Monta pares Antes/Depois a partir da lista sequencial (antes, depois, antes, ...)
function buildPairs(): BeforeAfterPair[] {
  const pairs: BeforeAfterPair[] = [];
  for (let i = 0; i < GALLERY_ITEMS.length; i += 2) {
    const antes = GALLERY_ITEMS[i];
    const depois = GALLERY_ITEMS[i + 1];
    if (antes?.image && depois?.image) {
      pairs.push({ id: antes.id, antes: antes.image, depois: depois.image });
    }
  }
  return pairs;
}

export function GallerySection() {
  const pairs = buildPairs();

  return (
    <section
      id="galeria"
      className="section-pad relative scroll-mt-20 bg-background-secondary"
    >
      <div className="hex-pattern absolute inset-0 opacity-30" aria-hidden />
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-copper to-transparent"
        aria-hidden
      />
      <div className="container relative">
        <SectionHeading
          eyebrow="Galeria"
          title="Antes e Depois"
          subtitle="Resultados reais do nosso trabalho. Arraste na imagem para revelar a transformação."
          align="center"
        />

        <Reveal delay={80} tilt>
          <BeforeAfterCarousel pairs={pairs} />
        </Reveal>
      </div>
    </section>
  );
}
