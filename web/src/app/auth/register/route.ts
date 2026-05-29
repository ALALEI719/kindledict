import { NextResponse } from "next/server";

import {
  authJsonResponse,
  createAuthCookieJar,
  wantsJsonAuthResponse,
} from "@/lib/auth-response";
import { createSupabaseServerClient, parseCookieHeader } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");
  const redirectUrl = new URL(next, request.url);
  const wantsJson = wantsJsonAuthResponse(request);
  const cookieJar = createAuthCookieJar();

  function fail(error: string, status = 400) {
    if (wantsJson) {
      return authJsonResponse({ ok: false, error }, cookieJar, status);
    }
    redirectUrl.searchParams.set("error", error);
    return cookieJar.applyTo(NextResponse.redirect(redirectUrl));
  }

  if (!email) return fail("missing-email");
  if (!password) return fail("missing-password");
  if (password.length < 8) {
    return fail("Password must be at least 8 characters.");
  }

  const supabase = createSupabaseServerClient({
    getAll() {
      return parseCookieHeader(request.headers.get("cookie"));
    },
    setAll: cookieJar.setAll,
  });

  const origin = new URL(request.url).origin;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) return fail(error.message);

  if (data.session) {
    if (wantsJson) {
      return authJsonResponse({ ok: true, redirect: next }, cookieJar);
    }
    redirectUrl.searchParams.set("signed_in", "1");
    return cookieJar.applyTo(NextResponse.redirect(redirectUrl));
  }

  if (wantsJson) {
    return authJsonResponse(
      { ok: true, registered: true, message: "registered" },
      cookieJar,
    );
  }

  redirectUrl.searchParams.set("registered", "1");
  return cookieJar.applyTo(NextResponse.redirect(redirectUrl));
}
