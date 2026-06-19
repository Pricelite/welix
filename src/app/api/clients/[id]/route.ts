import { getAuthenticatedUser } from "@/lib/auth";
import { fetchClientRecord } from "@/lib/crm-server";
import { ApiError, jsonError, jsonSuccess, parseJson } from "@/lib/http";
import { updateClientSchema } from "@/lib/schemas";
import { sanitizeNullableText, sanitizePlainText } from "@/lib/sanitize";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await getAuthenticatedUser().catch(() => null);

    if (!user) {
      throw new ApiError("Authentification requise", 401);
    }

    const { id } = await context.params;
    const body = await parseJson(request, updateClientSchema);
    const updates: Record<string, string | null> = {};

    if (typeof body.name === "string") {
      updates.name = sanitizePlainText(body.name, 160);
    }

    if (body.contact !== undefined) {
      updates.contact = sanitizeNullableText(body.contact, 160);
    }

    if (body.email !== undefined) {
      updates.email = sanitizeNullableText(body.email, 200);
    }

    if (body.city !== undefined) {
      updates.city = sanitizeNullableText(body.city, 120);
    }

    if (typeof body.archived === "boolean") {
      updates.archived_at = body.archived ? new Date().toISOString() : null;
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("clients").update(updates).eq("user_id", user.id).eq("id", id);

    if (error) {
      throw new Error(`Impossible de mettre à jour le client: ${error.message}`);
    }

    const client = await fetchClientRecord(supabase, user.id, id);

    if (!client) {
      throw new ApiError("Client introuvable", 404);
    }

    return jsonSuccess({ ok: true, client });
  } catch (error) {
    return jsonError(error, "Erreur serveur lors de la mise à jour du client");
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

    const [{ count: quotesCount, error: quotesError }, { count: invoicesCount, error: invoicesError }] =
      await Promise.all([
        supabase
          .from("quotes")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("client_id", id),
        supabase
          .from("invoices")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("client_id", id),
      ]);

    if (quotesError || invoicesError) {
      throw new Error(
        `Impossible de vérifier les dépendances du client: ${quotesError?.message ?? invoicesError?.message}`,
      );
    }

    if ((quotesCount ?? 0) > 0 || (invoicesCount ?? 0) > 0) {
      throw new ApiError(
        "Ce client possède déjà des devis ou des factures. Archive-le plutôt que de le supprimer.",
        409,
      );
    }

    const { error } = await supabase.from("clients").delete().eq("user_id", user.id).eq("id", id);

    if (error) {
      throw new Error(`Impossible de supprimer le client: ${error.message}`);
    }

    return jsonSuccess({ ok: true, id });
  } catch (error) {
    return jsonError(error, "Erreur serveur lors de la suppression du client");
  }
}
