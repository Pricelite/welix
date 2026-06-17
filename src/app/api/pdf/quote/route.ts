import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";

export async function GET() {
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("Welix", 20, 24);

  doc.setFontSize(16);
  doc.text("Devis - Remplacement chauffe-eau 200L", 20, 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Description", 20, 62);
  doc.text(
    "Remplacement d'un chauffe-eau electrique 200L avec depose, pose, raccordements et controle.",
    20,
    70,
    { maxWidth: 170 },
  );

  const rows = [
    ["Materiel", "Chauffe-eau 200L, groupe de securite, raccords", "820 EUR"],
    ["Main d'oeuvre", "Depose, pose, raccordements et essais", "460 EUR"],
    ["TVA", "10%", "128 EUR"],
  ];

  let y = 94;
  rows.forEach(([label, detail, amount]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(detail, 58, y, { maxWidth: 92 });
    doc.text(amount, 168, y, { align: "right" });
    y += 16;
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Total TTC", 20, y + 14);
  doc.text("1 408 EUR", 168, y + 14, { align: "right" });

  const buffer = Buffer.from(doc.output("arraybuffer"));

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="welix-devis.pdf"',
    },
  });
}
