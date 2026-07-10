import { z } from "zod";
import { AccountSummarySchema } from "@/domain/accounts/CustomerAccount";
import { CustomerOpportunitySchema } from "@/domain/opportunities/CustomerOpportunity";

export const PortfolioSummarySchema = z.object({
  totalAccounts: z.number().int().nonnegative(),
  healthyAccounts: z.number().int().nonnegative(),
  accountsWithFriction: z.number().int().nonnegative(),
  expansionReady: z.number().int().nonnegative(),
  reviewsRequired: z.number().int().nonnegative(),
  averageEvidenceCoverage: z.number().min(0).max(100),
});

export const PortfolioSnapshotSchema = z.object({
  generatedAt: z.string().datetime(),
  dataStatus: z.enum(["LIVE", "DEMO"]),
  summary: PortfolioSummarySchema,
  accounts: z.array(AccountSummarySchema),
  opportunities: z.array(CustomerOpportunitySchema),
});

export type PortfolioSummary = z.infer<typeof PortfolioSummarySchema>;
export type PortfolioSnapshot = z.infer<typeof PortfolioSnapshotSchema>;
