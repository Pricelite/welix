import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ClientRecord = {
  id: string;
  name: string;
  contact: string | null;
  email: string | null;
  city: string | null;
  revenue: string | null;
  last_quote: string | null;
};

export type QuoteRecord = {
  id: string;
  quote_number: string;
  client_name: string;
  trade: string | null;
  amount: string | null;
  status: string;
  date: string | null;
};

export async function listClientsForUser(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("clients")
    .select("id, name, contact, email, city, revenue, last_quote")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Impossible de charger les clients: ${error.message}`);
  }

  return (data as ClientRecord[] | null) ?? [];
}

export async function listQuotesForUser(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("quotes")
    .select("id, quote_number, client_name, trade, amount, status, date")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Impossible de charger les devis: ${error.message}`);
  }

  return (data as QuoteRecord[] | null) ?? [];
}
