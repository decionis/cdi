import { z } from "zod";
import { EvidenceSignalSchema } from "@/Domain/Evidence/EvidenceSignal";
import { SourceHealthSchema } from "@/Domain/Common/SourceHealth";

export const AccountStateSchema = z.enum([
  "HEALTHY",
  "FRICTION",
  "REVIEW_REQUIRED",
  "EXPANSION_READY",
]);

export const MoneySchema = z.object({
  amount: z.number().nonnegative(),
  currency: z.string().length(3),
});

export const ConnectorHealthSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  health: SourceHealthSchema,
  lastSyncAt: z.string().datetime().nullable(),
});

export const AccountSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  externalReference: z.string().min(1),
  segment: z.string().min(1),
  primaryRegion: z.string().min(1),
  corridors: z.array(z.string().min(1)),
  state: AccountStateSchema,
  owner: z.string().min(1),
  healthScore: z.number().min(0).max(100),
  evidenceCoverage: z.number().min(0).max(100),
  limitUtilization: z.number().min(0).max(200),
  currentLimit: MoneySchema,
  proposedLimit: MoneySchema.nullable(),
  updatedAt: z.string().datetime(),
});

export const AccountTimelineEventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  detail: z.string().min(1),
  occurredAt: z.string().datetime(),
  kind: z.enum(["SIGNAL", "DECISION", "ACTION", "OUTCOME"]),
});

export const CustomerAccountSchema = AccountSummarySchema.extend({
  connectors: z.array(ConnectorHealthSchema),
  evidence: z.array(EvidenceSignalSchema),
  timeline: z.array(AccountTimelineEventSchema),
  policyEnvelope: z.object({
    policyVersion: z.string().min(1),
    maximumAutoIncreasePercent: z.number().min(0).max(100),
    reviewThreshold: MoneySchema,
    automaticChangesEnabled: z.boolean(),
  }),
});

export type AccountState = z.infer<typeof AccountStateSchema>;
export type Money = z.infer<typeof MoneySchema>;
export type ConnectorHealth = z.infer<typeof ConnectorHealthSchema>;
export type AccountSummary = z.infer<typeof AccountSummarySchema>;
export type AccountTimelineEvent = z.infer<typeof AccountTimelineEventSchema>;
export type CustomerAccount = z.infer<typeof CustomerAccountSchema>;
