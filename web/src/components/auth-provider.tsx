"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthModal, type AuthMode } from "@/components/auth-modal";

export interface SessionState {
  configured: boolean;
  signedIn: boolean;
  email: string | null;
  paid: boolean;
  planSlug: string | null;
}

const defaultSession: SessionState = {
  configured: false,
  signedIn: false,
  email: null,
  paid: false,
  planSlug: null,
};

interface AuthContextValue {
  session: SessionState;
  loading: boolean;
  refreshSession: () => Promise<void>;
  openAuthModal: (mode?: AuthMode) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<SessionState>(defaultSession);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<AuthMode>("login");

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch("/api/health", { cache: "no-store" });
      const data = (await response.json()) as {
        account?: Partial<SessionState>;
      };
      setSession({
        configured: Boolean(data.account?.configured),
        signedIn: Boolean(data.account?.signedIn),
        email: data.account?.email ?? null,
        paid: Boolean(data.account?.paid),
        planSlug: data.account?.planSlug ?? null,
      });
    } catch {
      setSession(defaultSession);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    const auth = searchParams.get("auth");
    if (auth === "login" || auth === "register") {
      setModalMode(auth);
      setModalOpen(true);
    }
  }, [searchParams]);

  const openAuthModal = useCallback((mode: AuthMode = "login") => {
    setModalMode(mode);
    setModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setModalOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    if (params.has("auth")) {
      params.delete("auth");
      params.delete("next");
      params.delete("error");
      const query = params.toString();
      router.replace(query ? `${window.location.pathname}?${query}` : window.location.pathname);
    }
  }, [router, searchParams]);

  const value = useMemo(
    () => ({
      session,
      loading,
      refreshSession,
      openAuthModal,
      closeAuthModal,
    }),
    [session, loading, refreshSession, openAuthModal, closeAuthModal],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal
        open={modalOpen}
        mode={modalMode}
        onModeChange={setModalMode}
        onClose={closeAuthModal}
        onSuccess={refreshSession}
      />
    </AuthContext.Provider>
  );
}
