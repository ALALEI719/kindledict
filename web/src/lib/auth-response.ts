import { NextResponse } from "next/server";

export function wantsJsonAuthResponse(request: Request): boolean {
  const accept = request.headers.get("Accept") ?? "";
  return accept.includes("application/json");
}

export function createAuthCookieJar() {
  const jar = new NextResponse(null);

  return {
    setAll(cookiesToSet: { name: string; value: string; options: object }[]) {
      for (const cookie of cookiesToSet) {
        jar.cookies.set(cookie.name, cookie.value, cookie.options);
      }
    },
    applyTo(response: NextResponse) {
      for (const cookie of jar.cookies.getAll()) {
        response.cookies.set(cookie);
      }
      return response;
    },
  };
}

export function authJsonResponse(
  body: Record<string, unknown>,
  cookieJar?: ReturnType<typeof createAuthCookieJar>,
  status = 200,
) {
  const response = NextResponse.json(body, { status });
  return cookieJar ? cookieJar.applyTo(response) : response;
}
