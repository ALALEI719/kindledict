import { NextResponse } from "next/server";

import { resolveCreemAccessUpdate, verifyCreemSignature } from "@/lib/creem";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("creem-signature");
  const rawBody = await request.text();

  try {
    if (!verifyCreemSignature(rawBody, signature)) {
      return NextResponse.json(
        { ok: false, error: "Invalid webhook signature." },
        { status: 400 },
      );
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Webhook secret is not configured.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const update = resolveCreemAccessUpdate(payload);
  if (!update) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (!update.userId) {
    console.warn("[creem:webhook] Missing metadata.referenceId for event", {
      eventType: update.eventType,
      email: update.email,
    });
    return NextResponse.json({ ok: true, ignored: true, reason: "missing_user_id" });
  }

  try {
    const admin = createSupabaseAdminClient();
    const timestamp = new Date().toISOString();
    const { error } = await admin.from("customer_access").upsert(
      {
        user_id: update.userId,
        access_status: update.accessStatus,
        plan_slug: update.planSlug,
        source: "creem",
        purchased_at: update.accessStatus === "active" ? timestamp : null,
        expires_at: update.expiresAt,
      },
      { onConflict: "user_id" },
    );

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      applied: true,
      eventType: update.eventType,
      accessStatus: update.accessStatus,
    });
  } catch (error) {
    console.error("[creem:webhook]", error);
    const message =
      error instanceof Error ? error.message : "Failed to sync customer access.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
