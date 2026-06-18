import { redirect } from "next/navigation";
import { upsertProfileFromUser } from "@/lib/billing";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user;
}

export async function requireAuthenticatedUser() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      redirect("/connexion");
    }

    try {
      await upsertProfileFromUser(user);
    } catch {
      // Keep the session usable even if profile sync is temporarily unavailable.
    }

    return user;
  } catch {
    redirect("/connexion");
  }
}
