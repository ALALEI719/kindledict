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
