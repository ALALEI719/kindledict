import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

import {
  getSupabaseAdminConfig,
  getSupabaseConfig,
  isSupabaseConfigured,
} from "./config";

export type CookieAdapter = {
  getAll: () => { name: string; value: string }[];
  setAll?: (cookies: { name: string; value: string; options: CookieOptions }[]) => void;
};

export function parseCookieHeader(
  cookieHeader: string | null | undefined,
): { name: string; value: string }[] {
  if (!cookieHeader) return [];

  return cookieHeader
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const index = chunk.indexOf("=");
      return index >= 0
        ? {
            name: chunk.slice(0, index),
            value: chunk.slice(index + 1),
          }
        : { name: chunk, value: "" };
    });
}

export function createSupabaseServerClient(cookieAdapter: CookieAdapter) {
  const { url, anonKey } = getSupabaseConfig();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieAdapter.getAll();
      },
      setAll(cookiesToSet) {
        cookieAdapter.setAll?.(cookiesToSet);
      },
    },
  });
}

export function createSupabaseAdminClient() {
  const { url, serviceRoleKey } = getSupabaseAdminConfig();

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export interface AccountAccessState {
  configured: boolean;
  signedIn: boolean;
  userId: string | null;
  email: string | null;
  paid: boolean;
  accessStatus: string | null;
  planSlug: string | null;
}

export async function getAccountAccessState(cookieAdapter: CookieAdapter): Promise<AccountAccessState> {
  if (!isSupabaseConfigured()) {
    return {
      configured: false,
      signedIn: false,
      userId: null,
      email: null,
      paid: false,
      accessStatus: null,
      planSlug: null,
    };
  }

  const supabase = createSupabaseServerClient(cookieAdapter);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      configured: true,
      signedIn: false,
      userId: null,
      email: null,
      paid: false,
      accessStatus: null,
      planSlug: null,
    };
  }

  const { data } = await supabase
    .from("customer_access")
    .select("access_status, plan_slug")
    .eq("user_id", user.id)
    .maybeSingle();

  const accessStatus =
    typeof data?.access_status === "string" ? data.access_status : null;
  const planSlug = typeof data?.plan_slug === "string" ? data.plan_slug : null;

  return {
    configured: true,
    signedIn: true,
    userId: user.id,
    email: user.email ?? null,
    paid: accessStatus === "active" || accessStatus === "paid" || accessStatus === "lifetime",
    accessStatus,
    planSlug,
  };
}

export async function getAccountAccessStateFromCookieHeader(
  cookieHeader: string | null | undefined,
): Promise<AccountAccessState> {
  return getAccountAccessState({
    getAll() {
      return parseCookieHeader(cookieHeader);
    },
  });
}
