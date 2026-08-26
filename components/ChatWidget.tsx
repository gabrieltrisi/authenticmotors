"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { CAR_PLANS, MOTO_PLANS, ENGINE_WASH } from "@/lib/data";
import { SITE } from "@/lib/config";
import { whatsappLink } from "@/lib/whatsapp";

type Msg = { from: "bot" | "user"; text: string };
type QR = { label: string; value: string };

const money = (v: number) => `R$ ${v},00`;
function priceText(p: any) {
  if (p.kind === "single") return money(p.value);
  if (p.kind === "vehicle") return `Sedan/Hatch ${money(p.sedan)} · SUV ${money(p.suv)}`;
  if (p.kind === "tiered") return p.tiers.map((t: any) => `${t.label} ${money(t.value)}`).join(" · ");
  return "";
}
const carServices = [...CAR_PLANS, ENGINE_WASH];

// data "25/12" -> "25/12/AAAA" (ano atual ou próximo se já passou)
function normalizeDate(text: string): string | null {
  const m = text.match(/(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{2,4}))?/);
  if (!m) return null;
  const day = +m[1], month = +m[2];
  if (day < 1 || day > 31 || month < 1 || month > 12) return null;
  let year = m[3] ? +m[3] : new Date().getFullYear();
  if (year < 100) year += 2000;
  if (!m[3]) {
    const d = new Date(year, month - 1, day);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (d < today) year += 1;
  }
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [quick, setQuick] = useState<QR[]>([]);
  const [inputMode, setInputMode] = useState<null | { placeholder: string }>(null);
  const [draft, setDraft] = useState("");
  const [step, setStep] = useState("greet");
  const [data, setData] = useState<any>({});
  const [sending, setSending] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const botSay = (...texts: string[]) => setMsgs((m) => [...m, ...texts.map((t) => ({ from: "bot" as const, text: t }))]);
  const userSay = (t: string) => setMsgs((m) => [...m, { from: "user", text: t }]);

  useEffect(() => {
    if (open && msgs.length === 0) greet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  useEffect(() => { bodyRef.current?.scrollTo({ top: 9e9, behavior: "smooth" }); }, [msgs, quick, inputMode]);

  function greet() {
    setStep("greet"); setData({}); setInputMode(null);
    botSay(`Olá! 👋 Sou o assistente da *Authentic Motors*. Como posso ajudar?`);
    setQuick([
      { label: "🧽 Serviços e preços", value: "servicos" },
      { label: "📅 Agendar horário", value: "agendar" },
      { label: "📍 Endereço & horário", value: "endereco" },
      { label: "💬 Falar no WhatsApp", value: "whats" },
    ]);
  }

  function askInput(placeholder: string) { setQuick([]); setInputMode({ placeholder }); }

  function catList(title: string, list: any[]) {
    botSay(`*${title}*\n\n` + list.map((s) => `• *${s.title}* — ${priceText(s.price)}`).join("\n"));
    setQuick([
      { label: "📅 Agendar horário", value: "agendar" },
      { label: "↩️ Outra categoria", value: "servicos" },
      { label: "🏠 Início", value: "greet" },
    ]);
  }

  async function submitAppointment() {
    setSending(true);
    botSay("⏳ Registrando seu agendamento...");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: data.nome,
          whatsapp: data.whats,
          tipoVeiculo: data.tipo,
          modeloVeiculo: data.modelo,
          servico: data.servico,
          porte: data.porte || "",
          valor: String(data.amount ?? ""),
          data: data.dataFmt,
          horario: data.hora,
          origem: "chat-site",
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.success !== false) {
        const resumo = `Olá! Acabei de agendar pelo site:\n• ${data.servico} (${data.tipo}${data.porte ? " · " + data.porte : ""})\n• Veículo: ${data.modelo}\n• ${data.dataFmt} às ${data.hora}\n• Nome: ${data.nome}`;
        botSay(`✅ *Agendamento enviado!* Nossa equipe vai confirmar com você. 🙌`);
        setQuick([
          { label: "💬 Confirmar no WhatsApp", value: "wa:" + encodeURIComponent(resumo) },
          { label: "🏠 Início", value: "greet" },
        ]);
      } else {
        throw new Error(j.error || "falha");
      }
    } catch {
      const resumo = `Olá! Quero agendar:\n• ${data.servico} (${data.tipo})\n• Veículo: ${data.modelo}\n• ${data.dataFmt} às ${data.hora}\n• Nome: ${data.nome}`;
      botSay("⚠️ Não consegui registrar automaticamente, mas te levo pro WhatsApp com tudo pronto:");
      setQuick([{ label: "💬 Continuar no WhatsApp", value: "wa:" + encodeURIComponent(resumo) }, { label: "🏠 Início", value: "greet" }]);
    } finally {
      setSending(false);
      setStep("greet"); setData({});
    }
  }

  function handle(value: string, label?: string) {
    if (label) userSay(label);

    if (value.startsWith("wa:")) { window.open(whatsappLink(decodeURIComponent(value.slice(3))), "_blank"); return; }
    if (value === "greet") return greet();
    if (value === "whats") { window.open(whatsappLink("Olá! Vim pelo site da Authentic Motors."), "_blank"); return; }

    if (value === "endereco") {
      botSay(`📍 *Onde estamos*\n${SITE.address.full}\n\n🕐 ${SITE.hours}\n📸 ${SITE.instagram.handle}`);
      setQuick([
        { label: "🗺️ Ver no mapa", value: "maps" },
        { label: "📅 Agendar horário", value: "agendar" },
        { label: "🏠 Início", value: "greet" },
      ]);
      return;
    }
    if (value === "maps") {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Authentic Motors " + SITE.address.city)}`, "_blank");
      return;
    }

    if (value === "servicos") {
      botSay("Escolha uma categoria:");
      setQuick([
        { label: "🚗 Carros", value: "cat:carros" },
        { label: "🏍️ Motos", value: "cat:motos" },
        { label: "🏠 Início", value: "greet" },
      ]);
      return;
    }
    if (value === "cat:carros") return catList("🚗 Carros", carServices);
    if (value === "cat:motos") return catList("🏍️ Motos", MOTO_PLANS);

    if (value === "agendar") {
      setStep("ag_tipo");
      botSay("📅 Vamos agendar! É para *carro* ou *moto*?");
      setQuick([{ label: "🚗 Carro", value: "tipo:Carro" }, { label: "🏍️ Moto", value: "tipo:Moto" }, { label: "🏠 Início", value: "greet" }]);
      return;
    }
    if (value.startsWith("tipo:")) {
      const tipo = value.slice(5);
      setData((d: any) => ({ ...d, tipo }));
      const list = tipo === "Carro" ? carServices : MOTO_PLANS;
      botSay("Qual serviço?");
      setQuick([...list.map((s, i) => ({ label: s.title, value: `svc:${tipo}:${i}` })), { label: "↩️ Voltar", value: "agendar" }]);
      return;
    }
    if (value.startsWith("svc:")) {
      const [, tipo, i] = value.split(":");
      const list = tipo === "Carro" ? carServices : MOTO_PLANS;
      const s: any = list[+i];
      setData((d: any) => ({ ...d, servico: s.title }));
      if (s.price.kind === "vehicle") {
        setData((d: any) => ({ ...d, _svc: s }));
        botSay("Seu carro é *Sedan/Hatch* ou *SUV*?");
        setQuick([
          { label: `Sedan/Hatch — ${money(s.price.sedan)}`, value: "porte:sedan" },
          { label: `SUV — ${money(s.price.suv)}`, value: "porte:suv" },
        ]);
      } else {
        setData((d: any) => ({ ...d, porte: "", amount: s.price.value }));
        setStep("ag_modelo"); botSay("🏍️ Qual o *modelo da moto*? (ex.: CG 160)"); askInput("Modelo da moto");
      }
      return;
    }
    if (value.startsWith("porte:")) {
      const which = value.slice(6);
      setData((d: any) => {
        const s = d._svc;
        return { ...d, porte: which === "sedan" ? "Sedan/Hatch" : "SUV", amount: which === "sedan" ? s.price.sedan : s.price.suv };
      });
      setStep("ag_modelo"); botSay("🚙 Qual o *modelo do veículo*? (ex.: Corolla 2018)"); askInput("Modelo do veículo");
      return;
    }
    if (value === "confirmar") return submitAppointment();
    if (value === "cancelar") { botSay("❌ Sem problema, cancelado."); return greet(); }
  }

  function submitInput() {
    const t = draft.trim();
    if (!t) return;
    userSay(t); setDraft("");

    if (step === "ag_modelo") { setData((d: any) => ({ ...d, modelo: t })); setStep("ag_data"); botSay(`📅 Para qual *data*? (ex.: 25/12) — funcionamos ${SITE.hours}`); return askInput("Data (ex.: 25/12)"); }
    if (step === "ag_data") {
      const fmt = normalizeDate(t);
      if (!fmt) { botSay("Envie a data como *dia/mês* (ex.: 25/12)."); return; }
      setData((d: any) => ({ ...d, dataFmt: fmt })); setStep("ag_hora"); botSay("⏰ E qual *horário*? (ex.: 14:00)"); return askInput("Horário (ex.: 14:00)");
    }
    if (step === "ag_hora") {
      if (!/\d{1,2}[:h]\d{0,2}/.test(t)) { botSay("Envie o horário como *hora:minuto* (ex.: 14:00)."); return; }
      setData((d: any) => ({ ...d, hora: t })); setStep("ag_nome"); botSay("👤 Qual é o seu *nome*?"); return askInput("Seu nome");
    }
    if (step === "ag_nome") { setData((d: any) => ({ ...d, nome: t })); setStep("ag_whats"); botSay("📱 E seu *WhatsApp* com DDD? (ex.: 75 99999-9999)"); return askInput("Seu WhatsApp com DDD"); }
    if (step === "ag_whats") {
      if (t.replace(/\D/g, "").length < 10) { botSay("Envie um WhatsApp válido com DDD."); return; }
      const d2 = { ...data, whats: t };
      setData(d2); setInputMode(null); setStep("ag_confirma");
      botSay(`📝 *Confirme:*\n• ${d2.servico} (${d2.tipo}${d2.porte ? " · " + d2.porte : ""})\n• Veículo: ${d2.modelo}\n• ${d2.dataFmt} às ${d2.hora}\n• Nome: ${d2.nome}\n• Valor: ${money(d2.amount || 0)}`);
      setQuick([{ label: "✅ Confirmar", value: "confirmar" }, { label: "❌ Cancelar", value: "cancelar" }]);
      return;
    }
  }

  return (
    <>
      {/* Botão flutuante do chat */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar chat" : "Abrir chat de atendimento"}
        className="group fixed bottom-5 right-5 z-[60] grid h-14 w-14 place-items-center rounded-full bg-copper-gradient text-white shadow-copper-lg transition-transform hover:scale-110 md:bottom-7 md:right-7"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
        {!open && <span className="absolute -inset-1 -z-10 animate-ping rounded-full bg-copper/40 [animation-duration:2.6s]" />}
      </button>

      {/* Painel */}
      {open && (
        <div className="fixed bottom-24 right-4 z-[60] flex h-[70vh] max-h-[560px] w-[calc(100vw-2rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-copper bg-background shadow-copper-lg md:right-7">
          <header className="flex items-center gap-3 border-b border-copper bg-background-secondary px-4 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-copper-gradient text-white"><Sparkles className="h-4 w-4" /></span>
            <div>
              <p className="text-sm font-bold text-white">Authentic Motors</p>
              <p className="text-[11px] text-copper-light">Assistente · responde na hora</p>
            </div>
          </header>

          <div ref={bodyRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
            {msgs.map((m, i) => (
              <div key={i} className={m.from === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${m.from === "user" ? "bg-copper-gradient text-white" : "bg-background-secondary text-foreground"}`}
                     dangerouslySetInnerHTML={{ __html: m.text.replace(/\*(.+?)\*/g, "<strong>$1</strong>") }} />
              </div>
            ))}
            {quick.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {quick.map((q) => (
                  <button key={q.value} type="button" onClick={() => handle(q.value, q.label)}
                          className="rounded-full border border-copper bg-background-secondary px-3 py-1.5 text-xs font-semibold text-copper-light transition hover:bg-copper/15">
                    {q.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {inputMode && (
            <form onSubmit={(e) => { e.preventDefault(); submitInput(); }} className="flex items-center gap-2 border-t border-copper bg-background-secondary px-3 py-2">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={inputMode.placeholder} disabled={sending}
                     className="flex-1 rounded-full border border-copper bg-background px-3 py-2 text-sm text-white outline-none placeholder:text-foreground-muted focus:border-copper-light" autoFocus />
              <button type="submit" aria-label="Enviar" className="grid h-9 w-9 place-items-center rounded-full bg-copper-gradient text-white"><Send className="h-4 w-4" /></button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
