import { ParsedLead } from "./discord";

// GHL webhook event types we care about
export const LEAD_EVENTS = new Set([
  "ContactCreate",
  "ContactUpdate",
  "OpportunityCreate",
  "OpportunityStatusUpdate",
  "FormSubmission",
]);

// Tags that identify revenue-based lending leads
const RBL_TAGS = [
  "revenue based lending",
  "rbl",
  "revenue-based",
  "merchant cash advance",
  "mca",
  "business funding",
];

export interface GHLWebhookPayload {
  type: string;
  locationId: string;
  id?: string;
  contact?: GHLContact;
  opportunity?: GHLOpportunity;
  customData?: Record<string, string>;
}

export interface GHLContact {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  source?: string;
  customFields?: Array<{ id: string; field_value: string; key?: string }>;
}

export interface GHLOpportunity {
  id: string;
  name?: string;
  pipelineId?: string;
  pipelineName?: string;
  pipelineStageId?: string;
  pipelineStageName?: string;
  monetaryValue?: number;
  contact?: GHLContact;
}

export function isRevenueBasedLendingLead(payload: GHLWebhookPayload): boolean {
  const tags = [
    ...(payload.contact?.tags ?? []),
    ...(payload.opportunity?.contact?.tags ?? []),
  ].map((t) => t.toLowerCase());

  const pipeline = (
    payload.opportunity?.pipelineName ?? ""
  ).toLowerCase();

  // Match by tag or pipeline name
  return (
    RBL_TAGS.some((t) => tags.some((tag) => tag.includes(t))) ||
    RBL_TAGS.some((t) => pipeline.includes(t)) ||
    pipeline.includes("lending") ||
    pipeline.includes("funding")
  );
}

function getCustomField(
  fields: GHLContact["customFields"],
  ...keys: string[]
): string {
  if (!fields) return "";
  const lower = keys.map((k) => k.toLowerCase());
  const match = fields.find((f) =>
    lower.some(
      (k) =>
        f.key?.toLowerCase().includes(k) ||
        f.id?.toLowerCase().includes(k)
    )
  );
  return match?.field_value ?? "";
}

export function parseLeadFromPayload(payload: GHLWebhookPayload): ParsedLead {
  const contact = payload.contact ?? payload.opportunity?.contact;
  const opp = payload.opportunity;
  const custom = contact?.customFields ?? [];

  const firstName = contact?.firstName ?? "";
  const lastName = contact?.lastName ?? "";

  const monthlyRevenue =
    getCustomField(custom, "monthly_revenue", "monthly revenue", "revenue") ||
    getCustomField(custom, "gross_revenue", "annual revenue");

  const loanAmount =
    getCustomField(custom, "loan_amount", "requested_amount", "funding_amount") ||
    (opp?.monetaryValue ? `$${opp.monetaryValue.toLocaleString()}` : "");

  const timeInBusiness = getCustomField(
    custom,
    "time_in_business",
    "years_in_business",
    "business_age"
  );

  const businessName = getCustomField(
    custom,
    "business_name",
    "company",
    "company_name"
  );

  return {
    id: contact?.id ?? opp?.id ?? payload.id ?? "unknown",
    fullName: [firstName, lastName].filter(Boolean).join(" ") || "Unknown",
    email: contact?.email ?? "",
    phone: contact?.phone ?? "",
    businessName,
    monthlyRevenue,
    loanAmount,
    timeInBusiness,
    source: contact?.source ?? "",
    pipeline: opp?.pipelineName ?? "",
    stage: opp?.pipelineStageName ?? "",
    tags: contact?.tags ?? [],
  };
}

export function verifyGHLSignature(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) return !secret; // skip verification if no secret configured
  const crypto = require("crypto");
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return signature === expected || signature === `sha256=${expected}`;
}
