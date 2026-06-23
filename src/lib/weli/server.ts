import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { WeliMemoryCategory, WeliMemoryItem } from "@/lib/weli/types";

type WeliMemoryRow = {
  id: string;
  label: string;
  value: string;
  category: WeliMemoryCategory;
  created_at: string;
};

function normalizeWeliMemory(row: WeliMemoryRow): WeliMemoryItem {
  return {
    id: row.id,
    label: row.label,
    value: row.value,
    category: row.category,
    createdAt: row.created_at,
  };
}

export async function listWeliMemoriesForUser(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("weli_memories")
    .select("id, label, value, category, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    if (/could not find the table/i.test(error.message)) {
      return [];
    }

    throw new Error(`Impossible de charger la mémoire Weli: ${error.message}`);
  }

  return ((data as WeliMemoryRow[] | null) ?? []).map(normalizeWeliMemory);
}

export async function createWeliMemoryForUser(
  userId: string,
  payload: {
    label: string;
    value: string;
    category: WeliMemoryCategory;
  },
) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("weli_memories")
    .insert({
      user_id: userId,
      label: payload.label,
      value: payload.value,
      category: payload.category,
    })
    .select("id, label, value, category, created_at")
    .single();

  if (error || !data) {
    throw new Error(`Impossible d'enregistrer la mémoire Weli: ${error?.message ?? "creation incomplete"}`);
  }

  return normalizeWeliMemory(data as WeliMemoryRow);
}

export async function deleteWeliMemoryForUser(userId: string, memoryId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("weli_memories").delete().eq("user_id", userId).eq("id", memoryId);

  if (error) {
    throw new Error(`Impossible de supprimer la mémoire Weli: ${error.message}`);
  }
}

export async function clearWeliMemoriesForUser(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("weli_memories").delete().eq("user_id", userId);

  if (error) {
    throw new Error(`Impossible de vider la mémoire Weli: ${error.message}`);
  }
}
