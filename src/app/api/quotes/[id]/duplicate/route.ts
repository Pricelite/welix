import { getAuthenticatedUser } from "@/lib/auth";
import { fetchQuoteRecord, syncClientSnapshot } from "@/lib/crm-server";
import { ApiError, jsonError, jsonSuccess } from "@/lib/http";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function createQuoteNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const suffix = String(Date.now()).slice(-6);
  return `DEV-${year}-${suffix}`;
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const user = await getAuthenticatedUser().catch(() => null);

    if (!user) {
      throw new ApiError("Authentification requise", 401);
    }

    const { id } = await context.params;
    const supabase = createSupabaseAdminClient();
    const current = await fetchQuoteRecord(supabase, user.id, id);

    if (!current || !current.clientId) {
      throw new ApiError("Devis introuvable", 404);
    }

    const { data, error } = await supabase
      .from("quotes")
      .insert({
        user_id: user.id,
        client_id: current.clientId,
        quote_number: createQuoteNumber(),
        trade: current.trade,
        status: "Brouillon",
        date: new Date().toISOString(),
        description: current.description,
        material: current.material,
        labor: current.labor,
        estimated_time: current.estimatedTime,
        recommended_price: current.recommendedPrice,
        vat_rate: current.vatRate,
        subtotal: current.subtotal,
        vat: current.vat,
        total: current.total,
        amount: current.amount,
      })
      .select("id")
      .single();

    if (error || !data) {
      throw new Error(`Impossible de dupliquer le devis: ${error?.message ?? "duplication incomplète"}`);
    }

    await syncClientSnapshot(supabase, user.id, current.clientId);
    const quote = await fetchQuoteRecord(supabase, user.id, data.id);

    return jsonSuccess({ ok: true, quote });
  } catch (error) {
    return jsonError(error, "Erreur serveur lors de la duplication du devis");
  }
}
