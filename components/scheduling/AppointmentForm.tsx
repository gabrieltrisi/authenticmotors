"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  Car,
  Bike,
  User,
  Phone,
  Hash,
  Wrench,
  MessageSquare,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Send,
  MessageCircle,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { cn, formatBRL, formatPhoneBR, formatDateBR } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";
import {
  submitAppointment,
  fetchHorarios,
  toSlots,
  findService,
  priceFor,
  priceDependsOnSize,
  servicesForVehicle,
  type AppointmentPayload,
  type CarSize,
  type HorarioSlot,
  type VehicleType,
} from "@/lib/scheduling";

type Status = "idle" | "sending" | "success" | "error";

interface FieldErrors {
  nome?: string;
  whatsapp?: string;
  servico?: string;
  data?: string;
  horario?: string;
}

export function AppointmentForm() {
  // ----- estado dos campos -----
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [tipoVeiculo, setTipoVeiculo] = useState<VehicleType>("Carro");
  const [modeloVeiculo, setModeloVeiculo] = useState("");
  const [placa, setPlaca] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [porte, setPorte] = useState<CarSize>("Sedan/Hatch");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [minDate, setMinDate] = useState("");

  // horários disponíveis (consulta dinâmica ao n8n conforme a data)
  const [slots, setSlots] = useState<HorarioSlot[]>([]);
  const [slotsState, setSlotsState] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");

  // data mínima = hoje (definida no cliente p/ evitar mismatch de hidratação)
  useEffect(() => {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
    setMinDate(iso);
  }, []);

  // ao trocar o tipo de veículo, zera o serviço (as opções mudam)
  useEffect(() => {
    setServicoId("");
  }, [tipoVeiculo]);

  // ao escolher/trocar a data, consulta os horários disponíveis no n8n
  useEffect(() => {
    setHorario(""); // limpa seleção anterior ao mudar a data
    if (!data) {
      setSlots([]);
      setSlotsState("idle");
      return;
    }
    let cancelled = false;
    setSlotsState("loading");
    fetchHorarios(formatDateBR(data))
      .then((resp) => {
        if (cancelled) return;
        setSlots(toSlots(resp));
        setSlotsState("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setSlots([]);
        setSlotsState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [data]);

  const services = useMemo(
    () => servicesForVehicle(tipoVeiculo),
    [tipoVeiculo]
  );
  const service = findService(servicoId);
  const isCar = tipoVeiculo === "Carro";
  const showPorte = isCar; // porte só aparece para carro
  const valor = priceFor(service, porte);
  const valorLabel = valor != null ? formatBRL(valor) : "—";

  function validate(): boolean {
    const e: FieldErrors = {};
    if (!nome.trim()) e.nome = "Informe seu nome.";
    if (whatsapp.replace(/\D/g, "").length < 10)
      e.whatsapp = "Informe um WhatsApp válido com DDD.";
    if (!servicoId) e.servico = "Selecione um serviço.";
    if (!data) e.data = "Escolha a data.";
    // horário precisa ser válido (selecionado entre os disponíveis)
    if (slotsState === "error")
      e.horario = "Não foi possível carregar os horários disponíveis.";
    else if (!horario) e.horario = "Escolha o horário.";
    else if (!slots.some((s) => s.time === horario && s.available))
      e.horario = "Selecione um horário disponível.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;

    setStatus("sending");

    const payload: AppointmentPayload = {
      nome: nome.trim(),
      whatsapp,
      tipoVeiculo,
      modeloVeiculo: modeloVeiculo.trim(),
      placa: placa.trim().toUpperCase(),
      servico: service ? service.label : "",
      porte: isCar ? porte : "",
      valor: valorLabel,
      data: formatDateBR(data),
      horario,
      observacoes: observacoes.trim(),
      origem: "site-authentic-motors",
    };

    try {
      // Fonte principal: API interna (PostgreSQL). Fallback automático para o
      // n8n é tratado dentro de submitAppointment.
      await submitAppointment(payload);

      setStatus("success");

      // abre o WhatsApp com a mensagem pré-preenchida
      const msg = `Olá! Acabei de solicitar um agendamento pelo site da Authentic Motors. Serviço: ${payload.servico}. Data: ${payload.data}. Horário: ${payload.horario}.`;
      window.open(whatsappLink(msg), "_blank", "noopener,noreferrer");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[Agendamento] Falha ao enviar:", err);
      setStatus("error");
    }
  }

  function resetForm() {
    setNome("");
    setWhatsapp("");
    setTipoVeiculo("Carro");
    setModeloVeiculo("");
    setPlaca("");
    setServicoId("");
    setPorte("Sedan/Hatch");
    setData("");
    setHorario("");
    setObservacoes("");
    setErrors({});
    setStatus("idle");
  }

  // ---------- tela de sucesso ----------
  if (status === "success") {
    const msg = `Olá! Acabei de solicitar um agendamento pelo site da Authentic Motors. Serviço: ${
      service?.label ?? ""
    }. Data: ${formatDateBR(data)}. Horário: ${horario}.`;
    return (
      <div className="card-surface mx-auto max-w-xl p-8 text-center sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-copper-gradient shadow-copper">
          <CheckCircle2 className="h-8 w-8 text-white" />
        </span>
        <h3 className="mt-6 font-display text-2xl font-extrabold uppercase text-white">
          Agendamento enviado!
        </h3>
        <p className="mx-auto mt-3 max-w-md text-foreground-muted">
          Agendamento enviado com sucesso! Nossa equipe entrará em contato pelo
          WhatsApp para confirmar.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink
            href={whatsappLink(msg)}
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
          >
            <MessageCircle className="h-5 w-5" />
            Abrir WhatsApp
          </ButtonLink>
          <Button variant="outline" size="lg" onClick={resetForm}>
            Novo agendamento
          </Button>
        </div>
      </div>
    );
  }

  // ---------- formulário ----------
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-6 lg:grid-cols-[1fr_360px]"
    >
      {/* Coluna dos campos */}
      <div className="card-surface space-y-6 p-6 sm:p-8">
        {/* Nome + WhatsApp */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nome" required error={errors.nome} icon={User}>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome completo"
              className={inputCls(!!errors.nome)}
              autoComplete="name"
            />
          </Field>
          <Field label="WhatsApp" required error={errors.whatsapp} icon={Phone}>
            <input
              type="tel"
              inputMode="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(formatPhoneBR(e.target.value))}
              placeholder="(75) 99147-2818"
              className={inputCls(!!errors.whatsapp)}
              autoComplete="tel"
            />
          </Field>
        </div>

        {/* Tipo de veículo */}
        <Field label="Tipo de veículo" required>
          <div className="grid grid-cols-2 gap-3">
            <ToggleCard
              active={tipoVeiculo === "Carro"}
              onClick={() => setTipoVeiculo("Carro")}
              icon={Car}
              label="Carro"
            />
            <ToggleCard
              active={tipoVeiculo === "Moto"}
              onClick={() => setTipoVeiculo("Moto")}
              icon={Bike}
              label="Moto"
            />
          </div>
        </Field>

        {/* Modelo + Placa */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Modelo do veículo" icon={Car}>
            <input
              type="text"
              value={modeloVeiculo}
              onChange={(e) => setModeloVeiculo(e.target.value)}
              placeholder="Ex.: Honda Civic"
              className={inputCls(false)}
            />
          </Field>
          <Field label="Placa (opcional)" icon={Hash}>
            <input
              type="text"
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              placeholder="ABC-1D23"
              maxLength={8}
              className={cn(inputCls(false), "uppercase")}
            />
          </Field>
        </div>

        {/* Serviço */}
        <Field label="Serviço desejado" required error={errors.servico} icon={Wrench}>
          <select
            value={servicoId}
            onChange={(e) => setServicoId(e.target.value)}
            className={cn(inputCls(!!errors.servico), "appearance-none pr-10")}
          >
            <option value="" disabled>
              Selecione um serviço…
            </option>
            {(["Carros", "Motos", "Adicionais"] as const)
              .filter((g) => services.some((s) => s.group === g))
              .map((group) => (
                <optgroup key={group} label={group}>
                  {services
                    .filter((s) => s.group === group)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                </optgroup>
              ))}
          </select>
        </Field>

        {/* Porte — só para carro */}
        {showPorte && (
          <Field
            label="Porte do veículo"
            hint={
              service && !priceDependsOnSize(service)
                ? "Este serviço tem preço único, mas informe o porte mesmo assim."
                : undefined
            }
          >
            <div className="grid grid-cols-2 gap-3">
              <ToggleCard
                active={porte === "Sedan/Hatch"}
                onClick={() => setPorte("Sedan/Hatch")}
                label="Sedan / Hatch"
                sublabel="carro pequeno"
              />
              <ToggleCard
                active={porte === "SUV"}
                onClick={() => setPorte("SUV")}
                label="SUV"
                sublabel="carro grande"
              />
            </div>
          </Field>
        )}

        {/* Data */}
        <Field label="Data desejada" required error={errors.data} icon={Calendar}>
          <input
            type="date"
            value={data}
            min={minDate}
            onChange={(e) => setData(e.target.value)}
            className={cn(inputCls(!!errors.data), "[color-scheme:dark]")}
          />
        </Field>

        {/* Horário — consulta dinâmica de disponibilidade no n8n */}
        <Field label="Horário desejado" required error={errors.horario} icon={Clock}>
          {!data ? (
            <p className="rounded-xl border border-dashed border-copper bg-background/30 px-4 py-3 text-sm text-foreground-muted/70">
              Selecione uma data para ver os horários disponíveis.
            </p>
          ) : slotsState === "loading" ? (
            <p className="flex items-center gap-2 rounded-xl border border-copper bg-background/40 px-4 py-3 text-sm text-foreground-muted">
              <Loader2 className="h-4 w-4 animate-spin text-copper-light" />
              Consultando horários disponíveis…
            </p>
          ) : slotsState === "error" ? (
            <p className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Não foi possível carregar os horários disponíveis.
            </p>
          ) : slots.length === 0 ? (
            <p className="rounded-xl border border-copper bg-background/40 px-4 py-3 text-sm text-foreground-muted">
              Nenhum horário disponível nesta data.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((s) => (
                <button
                  key={s.time}
                  type="button"
                  disabled={!s.available}
                  aria-pressed={horario === s.time}
                  title={s.available ? undefined : "Horário ocupado"}
                  onClick={() => s.available && setHorario(s.time)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all",
                    !s.available
                      ? "cursor-not-allowed border-white/10 bg-white/5 text-foreground-muted/40 line-through"
                      : horario === s.time
                        ? "border-copper-light bg-copper/15 text-white shadow-copper"
                        : "border-copper bg-background/40 text-foreground-muted hover:border-copper-light/60 hover:text-white"
                  )}
                >
                  {s.time}
                </button>
              ))}
            </div>
          )}
        </Field>

        {/* Observações */}
        <Field label="Observações" icon={MessageSquare}>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Alguma informação adicional? (opcional)"
            rows={3}
            className={cn(inputCls(false), "resize-none")}
          />
        </Field>
      </div>

      {/* Coluna do resumo */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card-surface overflow-hidden">
          <div className="border-b border-copper bg-background/40 px-6 py-4">
            <h3 className="font-display text-lg font-extrabold uppercase text-white">
              Resumo
            </h3>
          </div>
          <dl className="space-y-3 p-6 text-sm">
            <SummaryRow label="Nome" value={nome || "—"} />
            <SummaryRow label="WhatsApp" value={whatsapp || "—"} />
            <SummaryRow
              label="Veículo"
              value={
                [tipoVeiculo, modeloVeiculo, isCar ? porte : ""]
                  .filter(Boolean)
                  .join(" · ") || "—"
              }
            />
            <SummaryRow label="Serviço" value={service?.label || "—"} />
            <SummaryRow label="Data" value={formatDateBR(data) || "—"} />
            <SummaryRow label="Horário" value={horario || "—"} />

            <div className="!mt-5 flex items-center justify-between border-t border-copper pt-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                Valor estimado
              </dt>
              <dd className="font-display text-2xl font-extrabold text-gradient-copper">
                {valorLabel}
              </dd>
            </div>
          </dl>

          <div className="px-6 pb-6">
            {status === "error" && (
              <p className="mb-3 flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                Não foi possível enviar agora. Tente novamente ou fale direto no
                WhatsApp.
              </p>
            )}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={status === "sending"}
            >
              {status === "sending" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Enviando…
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Enviar agendamento
                </>
              )}
            </Button>
            <p className="mt-3 text-center text-[11px] text-foreground-muted/70">
              * Valor estimado. A confirmação é feita pela nossa equipe via
              WhatsApp.
            </p>
          </div>
        </div>
      </aside>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponentes                                                     */
/* ------------------------------------------------------------------ */

function inputCls(hasError: boolean) {
  return cn(
    "w-full rounded-xl border bg-background/60 px-4 py-3 text-sm text-white placeholder:text-foreground-muted/50 outline-none transition-colors focus:border-copper-light focus:ring-2 focus:ring-copper/30",
    hasError ? "border-red-500/60" : "border-copper"
  );
}

function Field({
  label,
  required,
  error,
  hint,
  icon: Icon,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
        {Icon && <Icon className="h-4 w-4 text-copper-light" />}
        {label}
        {required && <span className="text-copper-light">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-foreground-muted/70">{hint}</p>
      )}
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function ToggleCard({
  active,
  onClick,
  icon: Icon,
  label,
  sublabel,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  sublabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all",
        active
          ? "border-copper-light bg-copper/15 text-white shadow-copper"
          : "border-copper bg-background/40 text-foreground-muted hover:border-copper-light/60 hover:text-white"
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span className="flex flex-col items-center leading-tight">
        {label}
        {sublabel && (
          <span className="text-[10px] font-normal text-foreground-muted">
            {sublabel}
          </span>
        )}
      </span>
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
        {label}
      </dt>
      <dd className="text-right text-sm text-white">{value}</dd>
    </div>
  );
}
