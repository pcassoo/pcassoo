import { NextRequest, NextResponse } from "next/server";
import {
  GHLWebhookPayload,
  LEAD_EVENTS,
  isRevenueBasedLendingLead,
  parseLeadFromPayload,
  verifyGHLSignature,
} from "@/lib/gohighlevel";
import { buildLeadEmbed, postLeadEmbed } from "@/lib/discord";

export async function POST(req: NextRequest): Promise<NextResponse> {
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Verify webhook signature if secret is set
  const signature =
    req.headers.get("x-ghl-signature") ??
    req.headers.get("x-hub-signature-256");
  const secret = process.env.GHL_WEBHOOK_SECRET ?? "";

  if (!verifyGHLSignature(rawBody, signature, secret)) {
    console.warn("[GHL] Webhook signature verification failed");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: GHLWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Only process relevant event types
  if (!LEAD_EVENTS.has(payload.type)) {
    return NextResponse.json({ skipped: true, type: payload.type });
  }

  // Filter to revenue-based lending leads only
  if (!isRevenueBasedLendingLead(payload)) {
    return NextResponse.json({ skipped: true, reason: "not-rbl-lead" });
  }

  const lead = parseLeadFromPayload(payload);
  const embed = buildLeadEmbed(lead);

  try {
    await postLeadEmbed(embed);
    console.info(`[GHL] Posted lead embed for ${lead.fullName} (${lead.id})`);
    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (err) {
    console.error("[GHL] Failed to post Discord embed:", err);
    return NextResponse.json(
      { error: "Failed to send Discord notification" },
      { status: 500 }
    );
  }
}

// Allow GHL to verify the endpoint via GET
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: "ok", service: "ghl-discord-webhook" });
}
