import { z } from "zod";

export const EvidenceImpactSchema = z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"]);
export const EvidenceFreshnessSchema = z.enum([
  "LIVE",
  "CURRENT",
  "AGING",
  "STALE",
]);

export const EvidenceSignalSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  detail: z.string().min(1),
  source: z.string().min(1),
  sourceRecordId: z.string().min(1),
  observedAt: z.string().datetime(),
  freshness: EvidenceFreshnessSchema,
  confidence: z.number().min(0).max(1),
  impact: EvidenceImpactSchema,
  category: z.enum(["USAGE", "SUPPORT", "CRM", "TRANSACTION", "KYC_KYB"]),
});

export type EvidenceSignal = z.infer<typeof EvidenceSignalSchema>;
