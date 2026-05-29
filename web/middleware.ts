import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/account") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  const response = NextResponse.next();

  if (!isSupabaseConfigured()) {
    return response;
  }

  const supabase = createSupabaseServerClient({
    getAll() {
      return request.cookies.getAll().map(({ name, value }) => ({ name, value }));
    },
    setAll(cookiesToSet) {
      for (const cookie of cookiesToSet) {
        response.cookies.set(cookie.name, cookie.value, cookie.options);
      }
    },
  });

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/account", "/dashboard", "/app", "/auth/:path*"],
};
