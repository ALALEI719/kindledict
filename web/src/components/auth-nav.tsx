"use client";

import Link from "next/link";

import { useAuth } from "@/components/auth-provider";
import { useLocale } from "@/components/locale-provider";

export function AuthNav() {
  const { session, loading, openAuthModal } = useAuth();
  const { messages: m } = useLocale();

  if (loading) {
    return <span className="auth-nav-placeholder" aria-hidden="true" />;
  }

  if (session.signedIn) {
    return (
      <Link href="/dashboard" className="auth-nav-link">
        {m.common.dashboard}
      </Link>
    );
  }

  return (
    <button type="button" className="auth-nav-button" onClick={() => openAuthModal("login")}>
      {m.common.signInRegister}
    </button>
  );
}
