import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const next = String(formData.get("next") ?? "/account");
  const redirectUrl = new URL(next, request.url);
  const response = NextResponse.redirect(redirectUrl);

  if (!email) {
    redirectUrl.searchParams.set("error", "missing-email");
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = createSupabaseServerClient({
    getAll() {
      return [];
    },
    setAll(cookiesToSet) {
      for (const cookie of cookiesToSet) {
        response.cookies.set(cookie.name, cookie.value, cookie.options);
      }
    },
  });

  const origin = new URL(request.url).origin;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    redirectUrl.searchParams.set("error", error.message);
    return NextResponse.redirect(redirectUrl);
  }

  redirectUrl.searchParams.set("sent", "1");
  return NextResponse.redirect(redirectUrl);
}
