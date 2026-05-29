export function formatAccountError(error: string | null) {
  if (!error) return null;

  const normalized = error.toLowerCase();
  if (
    normalized.includes("pkce code verifier not found") ||
    normalized.includes("flow state not found") ||
    normalized.includes("expired") ||
    normalized.includes("invalid token")
  ) {
    return "That email link is no longer valid here. Request a new one, or use password sign-in below.";
  }

  if (error === "missing-email") {
    return "Please enter your email address.";
  }

  if (error === "missing-password") {
    return "Please enter your password.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "Email or password is incorrect.";
  }

  if (normalized.includes("user already registered")) {
    return "This email already has an account. Sign in instead.";
  }

  return error;
}
