import type { StewardRepository } from "./StewardRepository";
import type { DecionisStewardGateway } from "@/infra/api/DecionisStewardGateway";
import type { CustomerAccount } from "@/domain/accounts/CustomerAccount";
import type {
  CustomerOpportunity,
  OpportunityReview,
  OpportunityReviewResult,
} from "@/domain/opportunities/CustomerOpportunity";
import type { PortfolioSnapshot } from "@/domain/portfolio/PortfolioSnapshot";
import { StewardGatewayError } from "@/infra/errors/StewardErrors";

export class DecionisStewardRepository implements StewardRepository {
  constructor(private readonly gateway: DecionisStewardGateway) {}

  getPortfolio(): Promise<PortfolioSnapshot> {
    return this.gateway.getPortfolio();
  }

  async getAccount(accountId: string): Promise<CustomerAccount | null> {
    try {
      return await this.gateway.getAccount(accountId);
    } catch (error) {
      if (error instanceof StewardGatewayError && error.status === 404)
        return null;
      throw error;
    }
  }

  listOpportunities(): Promise<CustomerOpportunity[]> {
    return this.gateway.listOpportunities();
  }

  reviewOpportunity(
    opportunityId: string,
    review: OpportunityReview,
  ): Promise<OpportunityReviewResult> {
    return this.gateway.reviewOpportunity(opportunityId, review);
  }
}
