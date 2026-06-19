import { getAuthenticatedUser } from "@/lib/auth";
import { fetchClientRecord, clientSelect } from "@/lib/crm-server";
import { ApiError, jsonError, jsonSuccess, parseJson } from "@/lib/http";
import { createClientSchema } from "@/lib/schemas";
import { sanitizeNullableText, sanitizePlainText } from "@/lib/sanitize";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const user = await getAuthenticatedUser().catch(() => null);

    if (!user) {
      throw new ApiError("Authentification requise", 401);
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("clients")
      .select(clientSelect)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Impossible de charger les clients: ${error.message}`);
    }

    return jsonSuccess({ clients: data ?? [] });
  } catch (error) {
    return jsonError(error, "Erreur serveur lors du chargement des clients");
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser().catch(() => null);

    if (!user) {
      throw new ApiError("Authentification requise", 401);
    }

    const body = await parseJson(request, createClientSchema);
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("clients")
      .insert({
        user_id: user.id,
        name: sanitizePlainText(body.name, 160),
        contact: sanitizeNullableText(body.contact, 160),
        email: sanitizeNullableText(body.email, 200),
        city: sanitizeNullableText(body.city, 120),
        revenue: 0,
      })
      .select("id")
      .single();

    if (error || !data) {
      throw new Error(`Impossible de créer le client: ${error?.message ?? "création incomplète"}`);
    }

    const client = await fetchClientRecord(supabase, user.id, data.id);
    return jsonSuccess({ ok: true, client });
  } catch (error) {
    return jsonError(error, "Erreur serveur lors de la création du client");
  }
}
