import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function createQuoteNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const suffix = String(Date.now()).slice(-6);
  return `DEV-${year}-${suffix}`;
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser().catch(() => null);

    if (!user) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as
      | {
          clientName?: string;
          trade?: string;
          description?: string;
          material?: string;
          labor?: string;
          estimatedTime?: string;
          recommendedPrice?: number;
          vatRate?: number;
          vatAmount?: number;
          total?: number;
        }
      | null;

    if (!body?.description || typeof body.total !== "number") {
      return NextResponse.json({ error: "Le devis est incomplet" }, { status: 400 });
    }

    const quoteNumber = createQuoteNumber();
    const today = new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const clientName = body.clientName?.trim() || "Client à renseigner";
    const recommendedPrice = typeof body.recommendedPrice === "number" ? body.recommendedPrice : null;
    const vatRate = typeof body.vatRate === "number" ? body.vatRate : null;
    const vatAmount = typeof body.vatAmount === "number" ? body.vatAmount : null;
    const amountLabel = new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(body.total);

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("quotes").insert({
      user_id: user.id,
      quote_number: quoteNumber,
      client_name: clientName,
      trade: body.trade?.trim() || "Général",
      amount: amountLabel,
      status: "Brouillon",
      date: today,
      description: body.description,
      material: body.material || null,
      labor: body.labor || null,
      estimated_time: body.estimatedTime || null,
      recommended_price: recommendedPrice,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      total: body.total,
    });

    if (error) {
      return NextResponse.json(
        { error: `Impossible d'enregistrer le devis: ${error.message}` },
        { status: 500 },
      );
    }

    const { error: clientUpdateError } = await supabase
      .from("clients")
      .update({ last_quote: quoteNumber })
      .eq("user_id", user.id)
      .eq("name", clientName);

    if (clientUpdateError) {
      return NextResponse.json(
        { error: `Devis créé, mais client non synchronisé: ${clientUpdateError.message}` },
        { status: 500 },
      );
    }

    const { data: existingClient } = await supabase
      .from("clients")
      .select("revenue")
      .eq("user_id", user.id)
      .eq("name", clientName)
      .maybeSingle();

    const previousRevenue = (existingClient as { revenue?: string | null } | null)?.revenue ?? "0 EUR";
    const previousMatch = previousRevenue.match(/[\d\s.,]+/);
    const previousValue = previousMatch
      ? Number(previousMatch[0].replace(/\s/g, "").replace(",", "."))
      : 0;
    const nextRevenue = new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(previousValue + body.total);

    await supabase
      .from("clients")
      .update({ revenue: nextRevenue })
      .eq("user_id", user.id)
      .eq("name", clientName);

    return NextResponse.json({ ok: true, quoteNumber });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Erreur serveur lors de l'enregistrement du devis: ${error.message}`
            : "Erreur serveur lors de l'enregistrement du devis",
      },
      { status: 500 },
    );
  }
}
