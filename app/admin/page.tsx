import type { Metadata } from "next";
import { AdminGate } from "@/components/admin/AdminGate";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Painel · Admin",
  // Área administrativa não deve ser indexada por buscadores.
  robots: { index: false, follow: false },
};

export default function AdminHomePage() {
  // Mesma proteção simples por senha dos demais painéis.
  return (
    <AdminGate>
      <AdminDashboard />
    </AdminGate>
  );
}
