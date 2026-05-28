import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const redirectUrl = new URL("/account", request.url);
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

  await supabase.auth.signOut();
  return response;
}
