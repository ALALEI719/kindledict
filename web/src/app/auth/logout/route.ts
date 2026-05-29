import { NextResponse } from "next/server";

import {
  authJsonResponse,
  createAuthCookieJar,
  wantsJsonAuthResponse,
} from "@/lib/auth-response";
import { createSupabaseServerClient, parseCookieHeader } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const wantsJson = wantsJsonAuthResponse(request);
  const redirectUrl = new URL("/", request.url);
  const cookieJar = createAuthCookieJar();

  const supabase = createSupabaseServerClient({
    getAll() {
      return parseCookieHeader(request.headers.get("cookie"));
    },
    setAll: cookieJar.setAll,
  });

  await supabase.auth.signOut();

  if (wantsJson) {
    return authJsonResponse({ ok: true }, cookieJar);
  }

  return cookieJar.applyTo(NextResponse.redirect(redirectUrl));
}
