import type { Metadata } from "next";
import { AppointmentsAdmin } from "@/components/admin/AppointmentsAdmin";

export const metadata: Metadata = {
  title: "Agendamentos · Admin",
  // Área administrativa não deve ser indexada por buscadores.
  robots: { index: false, follow: false },
};

export default function AdminAgendamentosPage() {
  // Acesso liberado em produção, protegido por senha simples (client-side).
  return <AppointmentsAdmin />;
}
