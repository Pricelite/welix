import { getAuthenticatedUser } from "@/lib/auth";
import { fetchQuoteRecord, syncClientSnapshot } from "@/lib/crm-server";
import { ApiError, jsonError, jsonSuccess, parseJson } from "@/lib/http";
import { updateQuoteSchema } from "@/lib/schemas";
import { sanitizeNullableText, sanitizePlainText } from "@/lib/sanitize";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function roundAmount(value: number) {
  return Number(value.toFixed(2));
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await getAuthenticatedUser().catch(() => null);

    if (!user) {
      throw new ApiError("Authentification requise", 401);
    }

    const { id } = await context.params;
    const supabase = createSupabaseAdminClient();
    const current = await fetchQuoteRecord(supabase, user.id, id);

    if (!current) {
      throw new ApiError("Devis introuvable", 404);
    }

    const body = await parseJson(request, updateQuoteSchema);
    const nextClientId = body.clientId ?? current.clientId;

    if (!nextClientId) {
      throw new ApiError("Le client est obligatoire", 400);
    }

    const total = roundAmount(typeof body.total === "number" ? body.total : current.total);
    const recommendedPrice = roundAmount(
      typeof body.recommendedPrice === "number" ? body.recommendedPrice : current.recommendedPrice,
    );
    const vat = roundAmount(typeof body.vat === "number" ? body.vat : total - recommendedPrice);
    const subtotal = roundAmount(recommendedPrice);
    const vatRate =
      typeof body.vatRate === "number" ? roundAmount(body.vatRate) : current.vatRate || 10;

    const { error } = await supabase
      .from("quotes")
      .update({
        client_id: nextClientId,
        trade:
          typeof body.trade === "string"
            ? sanitizePlainText(body.trade, 120)
            : current.trade,
        description:
          typeof body.description === "string"
            ? sanitizePlainText(body.description, 3000)
            : current.description,
        material:
          body.material !== undefined
            ? sanitizeNullableText(body.material, 2000)
            : current.material,
        labor:
          body.labor !== undefined ? sanitizeNullableText(body.labor, 2000) : current.labor,
        estimated_time:
          body.estimatedTime !== undefined
            ? sanitizeNullableText(body.estimatedTime, 120)
            : current.estimatedTime,
        recommended_price: recommendedPrice,
        vat_rate: vatRate,
        vat,
        subtotal,
        total,
        amount: total,
        status: body.status ?? current.status,
      })
      .eq("user_id", user.id)
      .eq("id", id);

    if (error) {
      throw new Error(`Impossible de mettre à jour le devis: ${error.message}`);
    }

    await syncClientSnapshot(supabase, user.id, nextClientId);

    if (current.clientId && current.clientId !== nextClientId) {
      await syncClientSnapshot(supabase, user.id, current.clientId);
    }

    const quote = await fetchQuoteRecord(supabase, user.id, id);
    return jsonSuccess({ ok: true, quote });
  } catch (error) {
    return jsonError(error, "Erreur serveur lors de la mise à jour du devis");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await getAuthenticatedUser().catch(() => null);

    if (!user) {
      throw new ApiError("Authentification requise", 401);
    }

    const { id } = await context.params;
    const supabase = createSupabaseAdminClient();
    const current = await fetchQuoteRecord(supabase, user.id, id);

    if (!current) {
      throw new ApiError("Devis introuvable", 404);
    }

    const { count, error: invoiceLinkError } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("quote_id", id);

    if (invoiceLinkError) {
      throw new Error(`Impossible de vérifier les factures liées: ${invoiceLinkError.message}`);
    }

    if ((count ?? 0) > 0) {
      throw new ApiError(
        "Ce devis est déjà lié à une facture. Supprime ou détache d'abord la facture concernée.",
        409,
      );
    }

    const { error } = await supabase.from("quotes").delete().eq("user_id", user.id).eq("id", id);

    if (error) {
      throw new Error(`Impossible de supprimer le devis: ${error.message}`);
    }

    if (current.clientId) {
      await syncClientSnapshot(supabase, user.id, current.clientId);
    }

    return jsonSuccess({ ok: true, id });
  } catch (error) {
    return jsonError(error, "Erreur serveur lors de la suppression du devis");
  }
}
