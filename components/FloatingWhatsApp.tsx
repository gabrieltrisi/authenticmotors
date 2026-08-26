import { MessageCircle } from "lucide-react";
import { whatsappLink, DEFAULT_WHATSAPP_MESSAGE } from "@/lib/whatsapp";

/** Botão flutuante persistente de WhatsApp (canto inferior direito). */
export function FloatingWhatsApp() {
  return (
    <a
      href={whatsappLink(DEFAULT_WHATSAPP_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="group fixed bottom-24 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full border border-copper bg-background/90 shadow-copper backdrop-blur transition-transform duration-300 hover:scale-110 md:bottom-28 md:right-8"
    >
      <span className="absolute -inset-1 rounded-full bg-copper/25 blur-md" aria-hidden />
      <span className="absolute inset-0 animate-ping rounded-full bg-copper/40 [animation-duration:2.5s]" />
      <MessageCircle className="relative h-7 w-7 text-white" />
    </a>
  );
}
