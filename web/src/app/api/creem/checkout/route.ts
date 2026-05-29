import { NextResponse } from "next/server";

import { createCreemCheckoutSession } from "@/lib/creem";
import { getAccountAccessStateFromCookieHeader } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const accountUrl = new URL("/dashboard", origin);
  const cookieHeader = request.headers.get("cookie");
  const account = await getAccountAccessStateFromCookieHeader(cookieHeader);

  if (!account.configured) {
    accountUrl.searchParams.set("error", "auth_not_configured");
    return NextResponse.redirect(accountUrl, { status: 303 });
  }

  if (!account.signedIn || !account.userId || !account.email) {
    accountUrl.searchParams.set("error", "signin_required");
    return NextResponse.redirect(accountUrl, { status: 303 });
  }

  if (account.paid) {
    accountUrl.searchParams.set("checkout", "already_active");
    return NextResponse.redirect(accountUrl, { status: 303 });
  }

  try {
    const successUrl = new URL("/dashboard", origin);
    successUrl.searchParams.set("checkout", "success");

    const { checkoutUrl } = await createCreemCheckoutSession({
      userId: account.userId,
      email: account.email,
      successUrl: successUrl.toString(),
    });

    return NextResponse.redirect(checkoutUrl, { status: 303 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create checkout.";
    accountUrl.searchParams.set("error", message);
    return NextResponse.redirect(accountUrl, { status: 303 });
  }
}
