import { NextResponse } from "next/server";
import { upsertProfileFromUser } from "@/lib/billing";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/connexion?error=missing_code`);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(`${origin}/connexion?error=auth_callback_failed`);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await upsertProfileFromUser(user);
    }

    return NextResponse.redirect(`${origin}/dashboard`);
  } catch {
    return NextResponse.redirect(`${origin}/connexion?error=auth_callback_failed`);
  }
}
