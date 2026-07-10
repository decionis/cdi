import { z } from "zod";
import { DecisionDispositionSchema } from "@/domain/common/DecisionDisposition";

export const OpportunityKindSchema = z.enum([
  "FRICTION_INTERVENTION",
  "KYC_KYB_ESCALATION",
  "PROCESSING_LIMIT_REVIEW",
  "EXPANSION_OUTREACH",
  "HOLD_FOR_MORE_EVIDENCE",
  "NO_ACTION",
]);

export const OpportunityStatusSchema = z.enum([
  "OPEN",
  "IN_REVIEW",
  "APPROVED",
  "REJECTED",
  "HELD",
  "COMPLETED",
]);

export const CustomerOpportunitySchema = z.object({
  id: z.string().min(1),
  accountId: z.string().min(1),
  accountName: z.string().min(1),
  kind: OpportunityKindSchema,
  status: OpportunityStatusSchema,
  title: z.string().min(1),
  rationale: z.string().min(1),
  recommendedAction: z.string().min(1),
  disposition: DecisionDispositionSchema,
  confidence: z.number().min(0).max(1),
  evidenceCoverage: z.number().min(0).max(100),
  evidenceIds: z.array(z.string().min(1)),
  priority: z.enum(["ROUTINE", "ELEVATED", "URGENT"]),
  createdAt: z.string().datetime(),
  dossierId: z.string().min(1).nullable(),
});

export const OpportunityReviewSchema = z.object({
  decision: z.enum(["APPROVE", "REJECT", "HOLD"]),
  note: z.string().trim().max(2000).optional(),
});

export const OpportunityReviewResultSchema = z.object({
  opportunity: CustomerOpportunitySchema,
  reviewId: z.string().min(1),
  recordedAt: z.string().datetime(),
});

export type OpportunityKind = z.infer<typeof OpportunityKindSchema>;
export type OpportunityStatus = z.infer<typeof OpportunityStatusSchema>;
export type CustomerOpportunity = z.infer<typeof CustomerOpportunitySchema>;
export type OpportunityReview = z.infer<typeof OpportunityReviewSchema>;
export type OpportunityReviewResult = z.infer<
  typeof OpportunityReviewResultSchema
>;
