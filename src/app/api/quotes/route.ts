import { getAuthenticatedUser } from "@/lib/auth";
import { fetchQuoteRecord, quoteSelect, syncClientSnapshot } from "@/lib/crm-server";
import { ApiError, jsonError, jsonSuccess, parseJson } from "@/lib/http";
import { quotePayloadSchema } from "@/lib/schemas";
import { sanitizeNullableText, sanitizePlainText } from "@/lib/sanitize";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function createQuoteNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const suffix = String(Date.now()).slice(-6);
  return `DEV-${year}-${suffix}`;
}

function roundAmount(value: number) {
  return Number(value.toFixed(2));
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser().catch(() => null);

    if (!user) {
      throw new ApiError("Authentification requise", 401);
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("quotes")
      .select(quoteSelect)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Impossible de charger les devis: ${error.message}`);
    }

    return jsonSuccess({ quotes: data ?? [] });
  } catch (error) {
    return jsonError(error, "Erreur serveur lors du chargement des devis");
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser().catch(() => null);

    if (!user) {
      throw new ApiError("Authentification requise", 401);
    }

    const body = await parseJson(request, quotePayloadSchema);
    const supabase = createSupabaseAdminClient();
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", user.id)
      .eq("id", body.clientId)
      .maybeSingle();

    if (clientError) {
      throw new Error(`Impossible de charger le client: ${clientError.message}`);
    }

    if (!client) {
      throw new ApiError("Client introuvable", 404);
    }

    const total = roundAmount(body.total);
    const recommendedPrice = roundAmount(body.recommendedPrice);
    const vatRate = roundAmount(body.vatRate);
    const vat = roundAmount(body.vatAmount);
    const subtotal = roundAmount(recommendedPrice);

    const { data: created, error } = await supabase
      .from("quotes")
      .insert({
        user_id: user.id,
        client_id: client.id,
        quote_number: createQuoteNumber(),
        trade: sanitizePlainText(body.trade, 120),
        amount: total,
        status: body.status ?? "Brouillon",
        date: new Date().toISOString(),
        description: sanitizePlainText(body.description, 3000),
        material: sanitizeNullableText(body.material, 2000),
        labor: sanitizeNullableText(body.labor, 2000),
        estimated_time: sanitizeNullableText(body.estimatedTime, 120),
        recommended_price: recommendedPrice,
        vat_rate: vatRate,
        vat,
        subtotal,
        total,
      })
      .select("id")
      .single();

    if (error || !created) {
      throw new Error(`Impossible d'enregistrer le devis: ${error?.message ?? "création incomplète"}`);
    }

    await syncClientSnapshot(supabase, user.id, client.id);
    const quote = await fetchQuoteRecord(supabase, user.id, created.id);

    return jsonSuccess({ ok: true, quote });
  } catch (error) {
    return jsonError(error, "Erreur serveur lors de l'enregistrement du devis");
  }
}
