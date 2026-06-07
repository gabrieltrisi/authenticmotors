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
      className="group fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-copper-gradient shadow-copper-lg transition-transform duration-300 hover:scale-110 md:bottom-7 md:right-7"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-copper/40 [animation-duration:2.5s]" />
      <MessageCircle className="relative h-7 w-7 text-white" />
    </a>
  );
}
