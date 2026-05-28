import { cookies } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";

import { LegalLayout } from "@/components/landing/legal-layout";
import { isCreemCheckoutConfigured } from "@/lib/creem";
import { getAccountAccessState } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account — KindleDict",
  description: "Sign in to KindleDict and manage your purchased reading access.",
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const cookieStore = await cookies();
  const account = await getAccountAccessState({
    getAll() {
      return cookieStore.getAll().map(({ name, value }) => ({ name, value }));
    },
  });
  const params = await searchParams;
  const sent = params.sent === "1";
  const signedIn = params.signed_in === "1";
  const checkout = typeof params.checkout === "string" ? params.checkout : null;
  const error = typeof params.error === "string" ? params.error : null;
  const paymentLink = process.env.NEXT_PUBLIC_KINDLE_DICT_PAYMENT_LINK_URL;
  const creemConfigured = isCreemCheckoutConfigured();

  return (
    <LegalLayout title="Account">
      {!account.configured ? (
        <>
          <p>
            Supabase auth is not configured yet. Add
            {" "}
            <code>NEXT_PUBLIC_SUPABASE_URL</code>
            {" "}
            and
            {" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
            {" "}
            to enable registration and sign-in.
          </p>
          <p>
            Until then, KindleDict can still enforce the free chapter limit with
            signed cookies, but paid access will need manual support.
          </p>
        </>
      ) : account.signedIn ? (
        <>
          {signedIn ? <p>Signed in successfully.</p> : null}
          {checkout === "success" ? (
            <p>
              Payment finished and you have been sent back from checkout. If access
              still shows as free trial below, wait a few seconds for the webhook
              to sync and refresh this page.
            </p>
          ) : null}
          {checkout === "already_active" ? <p>This account already has paid access.</p> : null}
          {error === "signin_required" ? <p>Please sign in before starting checkout.</p> : null}
          {error === "auth_not_configured" ? (
            <p>Supabase auth is not configured yet, so checkout cannot be tied to an account.</p>
          ) : null}
          {error && error !== "signin_required" && error !== "auth_not_configured" ? (
            <p>Checkout error: {error}</p>
          ) : null}
          <p>
            Signed in as <strong>{account.email}</strong>.
          </p>
          <p>
            Access status: <strong>{account.paid ? "Paid" : "Free trial only"}</strong>
            {account.planSlug ? <> · plan: <code>{account.planSlug}</code></> : null}
          </p>
          <p>
            {account.paid
              ? "Your account can generate beyond the free chapter limit."
              : "This account has not been granted paid access yet. Start checkout below. Your payment will be matched back to this email and account."}
          </p>
          <div className="flex gap-3">
            <form action="/auth/logout" method="post">
              <button type="submit" className="btn btn-secondary">
                Sign out
              </button>
            </form>
            {account.paid ? null : creemConfigured ? (
              <form action="/api/creem/checkout" method="post">
                <button type="submit" className="btn btn-primary">
                  Buy access
                </button>
              </form>
            ) : paymentLink ? (
              <a href={paymentLink} className="btn btn-primary">
                Buy access
              </a>
            ) : (
              <Link href="/contact" className="btn btn-primary">
                Contact for access
              </Link>
            )}
          </div>
        </>
      ) : (
        <>
          <p>
            Create an account with email magic link login. After purchase, your
            access can follow you across devices instead of relying on browser cookies.
          </p>
          {sent ? <p>Magic link sent. Check your inbox and open it in this browser.</p> : null}
          {error ? <p>Sign-in error: {error}</p> : null}
          <form action="/auth/login" method="post" className="flex max-w-md flex-col gap-3">
            <label>
              Email
              <input
                type="email"
                name="email"
                required
                className="mt-2 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2"
                placeholder="reader@example.com"
              />
            </label>
            <input type="hidden" name="next" value="/account" />
            <button type="submit" className="btn btn-primary">
              Send magic link
            </button>
          </form>
          <p>
            After signing in, return to the builder at <Link href="/app">/app</Link>.
          </p>
        </>
      )}
    </LegalLayout>
  );
}
