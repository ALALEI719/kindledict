import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") || "/dashboard";
  const redirectUrl = new URL(next, request.url);
  const response = NextResponse.redirect(redirectUrl);

  const supabase = createSupabaseServerClient({
    getAll() {
      return request.headers
        .get("cookie")
        ?.split(";")
        .map((chunk) => chunk.trim())
        .filter(Boolean)
        .map((chunk) => {
          const index = chunk.indexOf("=");
          return {
            name: chunk.slice(0, index),
            value: chunk.slice(index + 1),
          };
        }) ?? [];
    },
    setAll(cookiesToSet) {
      for (const cookie of cookiesToSet) {
        response.cookies.set(cookie.name, cookie.value, cookie.options);
      }
    },
  });

  const tokenHash = url.searchParams.get("token_hash");
  const typeParam = url.searchParams.get("type");
  const code = url.searchParams.get("code");
  if (tokenHash && typeParam) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: typeParam as EmailOtpType,
    });
    if (error) {
      redirectUrl.searchParams.set("error", error.message);
      return NextResponse.redirect(redirectUrl);
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      redirectUrl.searchParams.set("error", error.message);
      return NextResponse.redirect(redirectUrl);
    }
  }

  redirectUrl.searchParams.set("signed_in", "1");
  return NextResponse.redirect(redirectUrl);
}
