import { cookies } from "next/headers";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DashboardView } from "@/components/dashboard-view";
import { formatAccountError } from "@/lib/account-errors";
import { isCreemCheckoutConfigured } from "@/lib/creem";
import { getAccountAccessState } from "@/lib/supabase/server";

import "@/components/landing/landing.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard — KindleDict",
  description: "Manage your KindleDict access, billing, and account settings.",
};

export default async function DashboardPage({
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

  if (!account.configured || !account.signedIn) {
    redirect("/?auth=login&next=/dashboard");
  }

  const params = await searchParams;

  return (
    <DashboardView
      account={account}
      signedIn={params.signed_in === "1"}
      checkout={typeof params.checkout === "string" ? params.checkout : null}
      error={formatAccountError(typeof params.error === "string" ? params.error : null)}
      paymentLink={process.env.NEXT_PUBLIC_KINDLE_DICT_PAYMENT_LINK_URL}
      creemConfigured={isCreemCheckoutConfigured()}
    />
  );
}
