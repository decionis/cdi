import {
  CustomerAccountSchema,
  type CustomerAccount,
} from "@/domain/accounts/CustomerAccount";
import {
  CustomerOpportunitySchema,
  OpportunityReviewResultSchema,
  type CustomerOpportunity,
  type OpportunityReview,
  type OpportunityReviewResult,
} from "@/domain/opportunities/CustomerOpportunity";
import {
  PortfolioSnapshotSchema,
  type PortfolioSnapshot,
} from "@/domain/portfolio/PortfolioSnapshot";
import { DemoStewardData } from "@/infra/demo/DemoStewardData";
import { StewardNotFoundError } from "@/infra/errors/StewardErrors";
import type { StewardRepository } from "./StewardRepository";

export class DemoStewardRepository implements StewardRepository {
  async getPortfolio(): Promise<PortfolioSnapshot> {
    return PortfolioSnapshotSchema.parse(DemoStewardData.portfolio());
  }

  async getAccount(accountId: string): Promise<CustomerAccount | null> {
    const account = DemoStewardData.account(accountId);
    return account ? CustomerAccountSchema.parse(account) : null;
  }

  async listOpportunities(): Promise<CustomerOpportunity[]> {
    return DemoStewardData.opportunities().map((opportunity) =>
      CustomerOpportunitySchema.parse(opportunity),
    );
  }

  async reviewOpportunity(
    opportunityId: string,
    review: OpportunityReview,
  ): Promise<OpportunityReviewResult> {
    const opportunity = DemoStewardData.opportunities().find(
      (candidate) => candidate.id === opportunityId,
    );
    if (!opportunity) throw new StewardNotFoundError("Opportunity");

    const statusByDecision = {
      APPROVE: "APPROVED",
      REJECT: "REJECTED",
      HOLD: "HELD",
    } as const;

    return OpportunityReviewResultSchema.parse({
      opportunity: {
        ...opportunity,
        status: statusByDecision[review.decision],
      },
      reviewId: `review-demo-${opportunityId}-${review.decision.toLowerCase()}`,
      recordedAt: "2026-07-10T15:45:00.000Z",
    });
  }
}
