import type { Metadata } from "next";
import { AdminGate } from "@/components/admin/AdminGate";
import { Faturamento } from "@/components/admin/Faturamento";

export const metadata: Metadata = {
  title: "Faturamento · Admin",
  // Área administrativa não deve ser indexada por buscadores.
  robots: { index: false, follow: false },
};

export default function AdminFaturamentoPage() {
  // Mesma proteção simples por senha das demais áreas do painel.
  return (
    <AdminGate>
      <Faturamento />
    </AdminGate>
  );
}
