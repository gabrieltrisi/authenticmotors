import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppointmentsAdmin } from "@/components/admin/AppointmentsAdmin";

export const metadata: Metadata = {
  title: "Agendamentos · Admin",
  // Área administrativa não deve ser indexada por buscadores.
  robots: { index: false, follow: false },
};

export default function AdminAgendamentosPage() {
  // Sem autenticação/backend ainda: bloqueia em produção (Vercel),
  // permanecendo acessível apenas em desenvolvimento local.
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return <AppointmentsAdmin />;
}
