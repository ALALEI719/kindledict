import crypto from "node:crypto";

type JsonObject = Record<string, unknown>;

export type CreemAccessStatus = "active" | "revoked";

export interface CreemAccessUpdate {
  eventType: string;
  accessStatus: CreemAccessStatus;
  userId: string | null;
  email: string | null;
  planSlug: string | null;
  expiresAt: string | null;
}

function asObject(value: unknown): JsonObject | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readPath(source: unknown, path: string[]): unknown {
  let current: unknown = source;
  for (const segment of path) {
    const object = asObject(current);
    if (!object) return null;
    current = object[segment];
  }
  return current;
}

function firstString(source: unknown, paths: string[][]): string | null {
  for (const path of paths) {
    const value = getString(readPath(source, path));
    if (value) return value;
  }
  return null;
}

function normalizeCreemApiBaseUrl(value: string | undefined): string {
  const trimmed = value?.trim() || "https://api.creem.io";
  return trimmed.replace(/\/+$/, "");
}

export function isCreemCheckoutConfigured(): boolean {
  return Boolean(
    process.env.CREEM_API_KEY?.trim() && process.env.CREEM_PRODUCT_ID?.trim(),
  );
}

export function isCreemWebhookConfigured(): boolean {
  return Boolean(process.env.CREEM_WEBHOOK_SECRET?.trim());
}

export function getCreemPlanSlug(): string {
  return process.env.CREEM_PLAN_SLUG?.trim() || "reader-access";
}

export function getCreemWebhookSecret(): string {
  const secret = process.env.CREEM_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error(
      "Creem webhook secret is not configured. Set CREEM_WEBHOOK_SECRET.",
    );
  }
  return secret;
}

function buildCheckoutEndpoint() {
  const baseUrl = normalizeCreemApiBaseUrl(process.env.CREEM_API_BASE_URL);
  if (baseUrl.endsWith("/v1")) return `${baseUrl}/checkouts`;
  return `${baseUrl}/v1/checkouts`;
}

function resolveCheckoutUrl(payload: unknown): string | null {
  return firstString(payload, [
    ["checkoutUrl"],
    ["checkout_url"],
    ["url"],
    ["checkout", "checkoutUrl"],
    ["checkout", "checkout_url"],
    ["data", "checkoutUrl"],
    ["data", "checkout_url"],
    ["data", "url"],
    ["data", "checkout", "checkoutUrl"],
    ["data", "checkout", "checkout_url"],
  ]);
}

export async function createCreemCheckoutSession(input: {
  userId: string;
  email: string;
  successUrl: string;
}) {
  const apiKey = process.env.CREEM_API_KEY?.trim();
  const productId = process.env.CREEM_PRODUCT_ID?.trim();

  if (!apiKey || !productId) {
    throw new Error(
      "Creem checkout is not configured. Set CREEM_API_KEY and CREEM_PRODUCT_ID.",
    );
  }

  const payload = {
    product_id: productId,
    success_url: input.successUrl,
    customer: {
      email: input.email,
    },
    metadata: {
      referenceId: input.userId,
      userId: input.userId,
      email: input.email,
      planSlug: getCreemPlanSlug(),
    },
  };

  const response = await fetch(buildCheckoutEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const raw = await response.text();
  let data: unknown = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
  }

  if (!response.ok) {
    const message =
      firstString(data, [["error"], ["message"], ["details"]]) ||
      `Creem checkout request failed with ${response.status}.`;
    throw new Error(message);
  }

  const checkoutUrl = resolveCheckoutUrl(data);
  if (!checkoutUrl) {
    throw new Error("Creem checkout response did not include a checkout URL.");
  }

  return { checkoutUrl, data };
}

export function verifyCreemSignature(payload: string, signature: string | null) {
  if (!signature) return false;

  const expected = crypto
    .createHmac("sha256", getCreemWebhookSecret())
    .update(payload)
    .digest("hex");

  const actualBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  if (actualBuffer.length !== expectedBuffer.length) return false;

  return crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

export function resolveCreemAccessUpdate(payload: unknown): CreemAccessUpdate | null {
  const eventType = firstString(payload, [["eventType"]]);
  if (!eventType) return null;

  const object = asObject(readPath(payload, ["object"])) || {};
  const objectStatus = getString(object.status);
  const userId =
    firstString(object, [["metadata", "referenceId"], ["metadata", "userId"]]) ||
    firstString(payload, [["metadata", "referenceId"], ["metadata", "userId"]]);
  const email =
    firstString(object, [["customer", "email"]]) ||
    firstString(payload, [["customer", "email"]]);
  const productId =
    firstString(object, [["product", "id"], ["product_id"]]) ||
    process.env.CREEM_PRODUCT_ID?.trim() ||
    null;
  const configuredProductId = process.env.CREEM_PRODUCT_ID?.trim() || null;

  if (configuredProductId && productId && configuredProductId !== productId) {
    return null;
  }

  const expiresAt =
    firstString(object, [["current_period_end_date"], ["expires_at"]]) || null;
  const planSlug =
    firstString(object, [["metadata", "planSlug"]]) ||
    firstString(payload, [["metadata", "planSlug"]]) ||
    getCreemPlanSlug();

  const activateEvents = new Set([
    "subscription.active",
    "subscription.paid",
    "checkout.completed",
    "order.paid",
    "transaction.paid",
  ]);
  const revokeEvents = new Set([
    "subscription.canceled",
    "subscription.expired",
    "subscription.past_due",
    "subscription.paused",
    "refund.created",
    "dispute.created",
  ]);

  if (activateEvents.has(eventType)) {
    return {
      eventType,
      accessStatus: "active",
      userId,
      email,
      planSlug,
      expiresAt,
    };
  }

  if (eventType === "subscription.scheduled_cancel") {
    return {
      eventType,
      accessStatus: "active",
      userId,
      email,
      planSlug,
      expiresAt,
    };
  }

  if (eventType === "subscription.update" && objectStatus === "active") {
    return {
      eventType,
      accessStatus: "active",
      userId,
      email,
      planSlug,
      expiresAt,
    };
  }

  if (revokeEvents.has(eventType)) {
    return {
      eventType,
      accessStatus: "revoked",
      userId,
      email,
      planSlug,
      expiresAt,
    };
  }

  return null;
}
