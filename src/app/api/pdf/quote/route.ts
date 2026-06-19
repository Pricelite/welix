import { jsPDF } from "jspdf";
import { getAuthenticatedUser } from "@/lib/auth";
import { ApiError, jsonError } from "@/lib/http";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(value)
    .replace(/\u00a0/g, " ");
}

function pickSingle<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

function drawLabelValue(doc: jsPDF, label: string, value: string, x: number, y: number, maxWidth = 80) {
  doc.setFont("helvetica", "bold");
  doc.text(label, x, y);
  doc.setFont("helvetica", "normal");
  doc.text(value, x, y + 6, { maxWidth });
}

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser().catch(() => null);

    if (!user) {
      throw new ApiError("Authentification requise", 401);
    }

    const url = new URL(request.url);
    const quoteId = url.searchParams.get("id");
    const supabase = createSupabaseAdminClient();

    let query = supabase
      .from("quotes")
      .select(
        "quote_number, description, material, labor, estimated_time, subtotal, vat, total, vat_rate, date, created_at, client:clients!quotes_client_id_fkey(name, contact, email, city), profile:profiles!quotes_user_id_fkey(company_name, full_name, email, phone, address, trade)",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (quoteId) {
      query = query.eq("id", quoteId);
    }

    const { data: rows, error } = await query;

    if (error) {
      throw new Error(`Impossible de charger le devis: ${error.message}`);
    }

    const quote = rows?.[0] as
      | {
          quote_number: string;
          description: string;
          material: string | null;
          labor: string | null;
          estimated_time: string | null;
          subtotal: number | null;
          vat: number | null;
          total: number | null;
          vat_rate: number | null;
          date: string | null;
          created_at: string | null;
          client:
            | { name: string | null; contact: string | null; email: string | null; city: string | null }[]
            | { name: string | null; contact: string | null; email: string | null; city: string | null }
            | null;
          profile:
            | { company_name: string | null; full_name: string | null; email: string | null; phone: string | null; address: string | null; trade: string | null }[]
            | { company_name: string | null; full_name: string | null; email: string | null; phone: string | null; address: string | null; trade: string | null }
            | null;
        }
      | undefined;

    if (!quote) {
      throw new ApiError("Aucun devis disponible pour générer le PDF", 404);
    }

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const client = pickSingle(quote.client);
    const profile = pickSingle(quote.profile);
    const subtotal = quote.subtotal ?? 0;
    const vat = quote.vat ?? 0;
    const total = quote.total ?? 0;
    const issueDate = quote.date || quote.created_at || new Date().toISOString();

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 32, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text(profile?.company_name || "Welix", 16, 18);
    doc.setFontSize(10);
    doc.text(profile?.trade || "CRM & devis professionnels", 16, 24);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(20);
    doc.text("DEVIS", 150, 18);
    doc.setFontSize(11);
    doc.text(quote.quote_number, 150, 24);

    drawLabelValue(doc, "Émetteur", profile?.full_name || profile?.company_name || "Profil Welix", 16, 46, 70);
    drawLabelValue(doc, "Contact", [profile?.email, profile?.phone].filter(Boolean).join(" • ") || "-", 16, 62, 80);
    drawLabelValue(doc, "Adresse", profile?.address || "-", 16, 78, 80);

    drawLabelValue(doc, "Client", client?.name || "Client non renseigné", 110, 46, 70);
    drawLabelValue(
      doc,
      "Coordonnées",
      [client?.contact, client?.email, client?.city].filter(Boolean).join(" • ") || "-",
      110,
      62,
      80,
    );
    drawLabelValue(doc, "Date", new Date(issueDate).toLocaleDateString("fr-FR"), 110, 78, 80);

    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(16, 96, 178, 38, 4, 4);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Description de la prestation", 20, 104);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.text(quote.description, 20, 111, { maxWidth: 168 });

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(16, 142, 178, 56, 4, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Poste", 20, 151);
    doc.text("Détail", 66, 151);
    doc.text("Montant", 184, 151, { align: "right" });

    const rowsToRender = [
      ["Matériaux", quote.material || "Selon besoins du chantier", formatCurrency(subtotal * 0.45)],
      ["Main d'œuvre", quote.labor || "Préparation, exécution et finitions", formatCurrency(subtotal * 0.55)],
      ["Durée estimée", quote.estimated_time || "À confirmer", ""],
      ["TVA", `${quote.vat_rate ?? 10}%`, formatCurrency(vat)],
    ];

    let y = 160;
    for (const [label, detail, amount] of rowsToRender) {
      doc.setFont("helvetica", "bold");
      doc.text(label, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(detail, 66, y, { maxWidth: 92 });
      if (amount) {
        doc.text(amount, 184, y, { align: "right" });
      }
      y += 10;
    }

    doc.setFillColor(15, 23, 42);
    doc.roundedRect(120, 208, 74, 34, 4, 4, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Total TTC", 126, 220);
    doc.setFontSize(20);
    doc.text(formatCurrency(total), 188, 234, { align: "right" });

    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      "Devis généré par Welix. Validité, conditions de règlement et modalités d'exécution à compléter selon votre activité.",
      16,
      262,
      { maxWidth: 178 },
    );

    const buffer = Buffer.from(doc.output("arraybuffer"));

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${quote.quote_number}.pdf"`,
      },
    });
  } catch (error) {
    return jsonError(error, "Erreur serveur lors de la génération du PDF");
  }
}
