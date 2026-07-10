import {
  CustomerAccountSchema,
  type CustomerAccount,
} from "@/Domain/Accounts/CustomerAccount";
import {
  CustomerOpportunitySchema,
  OpportunityReviewResultSchema,
  type CustomerOpportunity,
  type OpportunityReview,
  type OpportunityReviewResult,
} from "@/Domain/Opportunities/CustomerOpportunity";
import {
  PortfolioSnapshotSchema,
  type PortfolioSnapshot,
} from "@/Domain/Portfolio/PortfolioSnapshot";
import { DemoCdiData } from "@/Infrastructure/Demo/DemoCdiData";
import { CdiNotFoundError } from "@/Infrastructure/Errors/CdiErrors";
import type { CdiRepository } from "./CdiRepository";

export class DemoCdiRepository implements CdiRepository {
  async getPortfolio(): Promise<PortfolioSnapshot> {
    return PortfolioSnapshotSchema.parse(DemoCdiData.portfolio());
  }

  async getAccount(accountId: string): Promise<CustomerAccount | null> {
    const account = DemoCdiData.account(accountId);
    return account ? CustomerAccountSchema.parse(account) : null;
  }

  async listOpportunities(): Promise<CustomerOpportunity[]> {
    return DemoCdiData.opportunities().map((opportunity) =>
      CustomerOpportunitySchema.parse(opportunity),
    );
  }

  async reviewOpportunity(
    opportunityId: string,
    review: OpportunityReview,
  ): Promise<OpportunityReviewResult> {
    const opportunity = DemoCdiData.opportunities().find(
      (candidate) => candidate.id === opportunityId,
    );
    if (!opportunity) throw new CdiNotFoundError("Opportunity");

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
