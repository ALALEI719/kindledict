/** Map browser/network failures to a clearer message (e.g. "Failed to fetch"). */
export function friendlyFetchError(
  error: unknown,
  fallback: string,
  networkHint: string,
): string {
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return networkHint;
  }
  if (error instanceof Error) {
    if (error.message === "Failed to fetch" || error.message.includes("Failed to fetch")) {
      return networkHint;
    }
    return error.message;
  }
  return fallback;
}

/** Parse a fetch response as JSON; surface plain-text platform errors (e.g. 413). */
export async function readApiJson<T extends { ok?: boolean; error?: string }>(
  response: Response,
  fallbackError: string,
): Promise<T> {
  const text = await response.text();

  try {
    return JSON.parse(text) as T;
  } catch {
    const lower = text.toLowerCase();
    if (
      response.status === 413 ||
      lower.includes("request entity too large") ||
      lower.includes("payload too large")
    ) {
      throw new Error(fallbackError);
    }
    const snippet = text.trim().slice(0, 160);
    throw new Error(snippet || `${fallbackError} (HTTP ${response.status})`);
  }
}
