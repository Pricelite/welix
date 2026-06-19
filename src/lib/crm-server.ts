import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const clientSelect =
  "id, name, contact, email, city, revenue, archived_at, created_at, last_quote_id, last_quote:quotes!clients_last_quote_id_fkey(quote_number)";

export const quoteSelect =
  "id, quote_number, client_id, trade, status, date, description, material, labor, estimated_time, recommended_price, vat_rate, subtotal, vat, total, amount, created_at, updated_at, client:clients!quotes_client_id_fkey(id, name)";

type SupabaseAdmin = ReturnType<typeof createSupabaseAdminClient>;

function pickSingle<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export function normalizeClientRecord(
  row:
    | {
        id: string;
        name: string;
        contact: string | null;
        email: string | null;
        city: string | null;
        revenue: number | null;
        archived_at: string | null;
        created_at: string | null;
        last_quote_id: string | null;
        last_quote: { quote_number: string | null }[] | { quote_number: string | null } | null;
      }
    | null
    | undefined,
) {
  if (!row) {
    return null;
  }

  const lastQuote = pickSingle(row.last_quote);

  return {
    id: row.id,
    name: row.name,
    contact: row.contact,
    email: row.email,
    city: row.city,
    revenue: row.revenue ?? 0,
    archivedAt: row.archived_at,
    lastQuoteId: row.last_quote_id,
    lastQuoteNumber: lastQuote?.quote_number ?? null,
    createdAt: row.created_at,
  };
}

export function normalizeQuoteRecord(
  row:
    | {
        id: string;
        quote_number: string;
        client_id: string | null;
        trade: string | null;
        status: string;
        date: string | null;
        description: string;
        material: string | null;
        labor: string | null;
        estimated_time: string | null;
        recommended_price: number | null;
        vat_rate: number | null;
        subtotal: number | null;
        vat: number | null;
        total: number | null;
        amount: number | null;
        created_at: string | null;
        updated_at: string | null;
        client:
          | { id: string; name: string | null }[]
          | { id: string; name: string | null }
          | null;
      }
    | null
    | undefined,
) {
  if (!row) {
    return null;
  }

  const client = pickSingle(row.client);

  return {
    id: row.id,
    quoteNumber: row.quote_number,
    clientId: row.client_id,
    clientName: client?.name || "Client non renseigné",
    trade: row.trade,
    status: row.status,
    date: row.date,
    description: row.description,
    material: row.material,
    labor: row.labor,
    estimatedTime: row.estimated_time,
    recommendedPrice: row.recommended_price ?? 0,
    vatRate: row.vat_rate ?? 0,
    subtotal: row.subtotal ?? 0,
    vat: row.vat ?? 0,
    total: row.total ?? 0,
    amount: row.amount ?? row.total ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchClientRecord(admin: SupabaseAdmin, userId: string, clientId: string) {
  const { data, error } = await admin
    .from("clients")
    .select(clientSelect)
    .eq("user_id", userId)
    .eq("id", clientId)
    .maybeSingle();

  if (error) {
    throw new Error(`Impossible de charger le client: ${error.message}`);
  }

  return normalizeClientRecord(data as never);
}

export async function fetchQuoteRecord(admin: SupabaseAdmin, userId: string, quoteId: string) {
  const { data, error } = await admin
    .from("quotes")
    .select(quoteSelect)
    .eq("user_id", userId)
    .eq("id", quoteId)
    .maybeSingle();

  if (error) {
    throw new Error(`Impossible de charger le devis: ${error.message}`);
  }

  return normalizeQuoteRecord(data as never);
}

export async function syncClientSnapshot(admin: SupabaseAdmin, userId: string, clientId: string) {
  const [{ data: totals, error: totalsError }, { data: latestQuote, error: latestError }] =
    await Promise.all([
      admin
        .from("quotes")
        .select("total")
        .eq("user_id", userId)
        .eq("client_id", clientId),
      admin
        .from("quotes")
        .select("id")
        .eq("user_id", userId)
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (totalsError) {
    throw new Error(`Impossible de recalculer le revenu client: ${totalsError.message}`);
  }

  if (latestError) {
    throw new Error(`Impossible de recalculer le dernier devis client: ${latestError.message}`);
  }

  const revenue = ((totals as Array<{ total?: number | null }> | null) ?? []).reduce(
    (sum, quote) => sum + (quote.total ?? 0),
    0,
  );

  const { error: updateError } = await admin
    .from("clients")
    .update({
      revenue: Number(revenue.toFixed(2)),
      last_quote_id: (latestQuote as { id?: string } | null)?.id ?? null,
    })
    .eq("user_id", userId)
    .eq("id", clientId);

  if (updateError) {
    throw new Error(`Impossible de synchroniser le client: ${updateError.message}`);
  }
}
