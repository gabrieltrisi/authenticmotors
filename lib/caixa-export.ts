/**
 * Exportação de relatórios do Caixa (client-side).
 *
 * - CSV: gerado sem dependências, com BOM UTF-8 e separador ";" (amigável ao
 *   Excel pt-BR, que usa vírgula decimal).
 * - PDF: usa jsPDF + jspdf-autotable, carregados sob demanda (dynamic import)
 *   para não pesarem no bundle inicial do painel.
 */
import {
  TYPE_META,
  PAYMENT_META,
  formatDateBR,
  formatBRL,
  formatPeriodLabel,
  periodFileTag,
  summarize,
  type CashMovement,
  type Period,
} from "@/lib/caixa";

/** Troca o NBSP ( ) que o toLocaleString insere após "R$" por espaço normal. */
function plainCurrency(value: number): string {
  return formatBRL(value).replace(/ /g, " ");
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/*  CSV                                                                */
/* ------------------------------------------------------------------ */

const CSV_HEADER = [
  "Data",
  "Tipo",
  "Descrição",
  "Cliente",
  "Serviço",
  "Forma de pagamento",
  "Categoria",
  "Valor",
  "Observações",
];

function csvCell(value: string): string {
  const s = value ?? "";
  // Escapa se contiver separador, aspas ou quebra de linha.
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function buildCsv(items: CashMovement[]): string {
  const rows = items.map((m) => [
    formatDateBR(m.movementDate),
    TYPE_META[m.type].label,
    m.description,
    m.customerName ?? "",
    m.serviceName ?? "",
    PAYMENT_META[m.paymentMethod],
    m.category ?? "",
    m.amount.toFixed(2).replace(".", ","),
    m.notes ?? "",
  ]);
  const lines = [CSV_HEADER, ...rows]
    .map((cols) => cols.map((c) => csvCell(String(c))).join(";"))
    .join("\r\n");
  // ﻿ (BOM) para o Excel reconhecer UTF-8.
  return `﻿${lines}`;
}

export function downloadCsv(items: CashMovement[], period: Period): void {
  const blob = new Blob([buildCsv(items)], {
    type: "text/csv;charset=utf-8;",
  });
  triggerDownload(blob, `caixa-authentic-motors-${periodFileTag(period)}.csv`);
}

/* ------------------------------------------------------------------ */
/*  PDF                                                                */
/* ------------------------------------------------------------------ */

const COPPER: [number, number, number] = [176, 101, 49];
const INK: [number, number, number] = [38, 38, 38];
const MUTED: [number, number, number] = [120, 120, 120];

export async function downloadPdf(
  items: CashMovement[],
  period: Period
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const totals = summarize(items);
  const left = 40;

  // Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text("Relatório de Caixa — Authentic Motors", left, 48);

  // Período
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(`Período: ${formatPeriodLabel(period)}`, left, 68);

  // Resumo
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  const resumo = [
    `Entradas: ${plainCurrency(totals.entradas)}`,
    `Saídas: ${plainCurrency(totals.saidas)}`,
    `Saldo: ${plainCurrency(totals.saldo)}`,
    `Lançamentos: ${items.length}`,
  ].join("        ");
  doc.text(resumo, left, 92);

  // Tabela
  autoTable(doc, {
    startY: 110,
    head: [
      ["Data", "Tipo", "Descrição", "Cliente", "Serviço", "Pagamento", "Valor"],
    ],
    body: items.map((m) => [
      formatDateBR(m.movementDate),
      TYPE_META[m.type].label,
      m.description,
      m.customerName ?? "",
      m.serviceName ?? "",
      PAYMENT_META[m.paymentMethod],
      `${m.type === "ENTRY" ? "+" : "-"}${plainCurrency(m.amount)}`,
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 5,
      textColor: INK,
      lineColor: [225, 225, 225],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: COPPER,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [248, 244, 240] },
    columnStyles: { 6: { halign: "right" } },
    margin: { left, right: 40 },
  });

  doc.save(`caixa-authentic-motors-${periodFileTag(period)}.pdf`);
}
