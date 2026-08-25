import type { Metadata } from "next";
import { AdminGate } from "@/components/admin/AdminGate";
import { CashRegister } from "@/components/admin/CashRegister";

export const metadata: Metadata = {
  title: "Caixa · Admin",
  // Área administrativa não deve ser indexada por buscadores.
  robots: { index: false, follow: false },
};

export default function AdminCaixaPage() {
  // Mesma proteção simples por senha do painel de agendamentos.
  return (
    <AdminGate>
      <CashRegister />
    </AdminGate>
  );
}
