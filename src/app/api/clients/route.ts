import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser().catch(() => null);

    if (!user) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as
      | {
          name?: string;
          contact?: string;
          email?: string;
          city?: string;
        }
      | null;

    const name = body?.name?.trim();

    if (!name) {
      return NextResponse.json({ error: "Le nom du client est obligatoire" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("clients").insert({
      user_id: user.id,
      name,
      contact: body?.contact?.trim() || null,
      email: body?.email?.trim() || null,
      city: body?.city?.trim() || null,
      revenue: "0 EUR",
      last_quote: null,
    });

    if (error) {
      return NextResponse.json(
        { error: `Impossible de créer le client: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Erreur serveur lors de la création du client: ${error.message}`
            : "Erreur serveur lors de la création du client",
      },
      { status: 500 },
    );
  }
}
