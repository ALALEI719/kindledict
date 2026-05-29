"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useLocale } from "@/components/locale-provider";
import { formatAccountError } from "@/lib/account-errors";

import "@/components/landing/landing.css";

export type AuthMode = "login" | "register";

interface AuthModalProps {
  open: boolean;
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export function AuthModal({
  open,
  mode,
  onModeChange,
  onClose,
  onSuccess,
}: AuthModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { messages: m } = useLocale();
  const a = m.auth;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const nextPath = useMemo(
    () => searchParams.get("next") || "/dashboard",
    [searchParams],
  );

  useEffect(() => {
    if (!open) return;
    const urlError = searchParams.get("error");
    setError(formatAccountError(urlError));
    setSuccessMessage(null);
  }, [open, searchParams]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
    const formData = new FormData();
    formData.set("email", email.trim());
    formData.set("password", password);
    formData.set("next", nextPath);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
        redirect?: string;
        registered?: boolean;
      };

      if (!response.ok || !data.ok) {
        setError(formatAccountError(data.error ?? a.genericError));
        return;
      }

      if (data.registered) {
        setSuccessMessage(a.registerSuccess);
        onModeChange("login");
        return;
      }

      await onSuccess();
      onClose();
      router.push(data.redirect || nextPath);
      router.refresh();
    } catch {
      setError(a.genericError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-modal-root" role="presentation" onClick={onClose}>
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="auth-modal-close"
          aria-label={a.close}
          onClick={onClose}
        >
          ×
        </button>

        <p className="auth-modal-kicker">{mode === "login" ? a.signInKicker : a.registerKicker}</p>
        <h2 id="auth-modal-title">
          {mode === "login" ? a.welcomeBack : a.createAccountTitle}
        </h2>
        <p className="auth-modal-sub">
          {mode === "login" ? a.signInSubtitle : a.registerSubtitle}
        </p>

        {successMessage ? (
          <div className="auth-modal-banner auth-modal-banner-success">{successMessage}</div>
        ) : null}
        {error ? (
          <div className="auth-modal-banner auth-modal-banner-error">{error}</div>
        ) : null}

        <form className="auth-modal-form" onSubmit={handleSubmit}>
          <label className="account-field">
            <span>{a.email}</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder={a.emailPlaceholder}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="account-field">
            <span>{a.password}</span>
            <input
              type="password"
              name="password"
              required
              minLength={mode === "register" ? 8 : undefined}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder={mode === "register" ? a.passwordPlaceholder : a.passwordSignInPlaceholder}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button type="submit" className="btn btn-primary auth-modal-submit" disabled={submitting}>
            {submitting
              ? a.submitting
              : mode === "login"
                ? a.signIn
                : a.register}
          </button>
        </form>

        <p className="auth-modal-switch">
          {mode === "login" ? a.noAccount : a.hasAccount}{" "}
          <button
            type="button"
            className="auth-modal-switch-btn"
            onClick={() => {
              setError(null);
              setSuccessMessage(null);
              onModeChange(mode === "login" ? "register" : "login");
            }}
          >
            {mode === "login" ? a.register : a.signIn}
          </button>
        </p>
      </div>
    </div>
  );
}
