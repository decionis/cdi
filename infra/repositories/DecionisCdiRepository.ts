import type { CdiRepository } from "./CdiRepository";
import type { DecionisCdiGateway } from "@/infra/api/DecionisCdiGateway";
import type { CustomerAccount } from "@/domain/accounts/CustomerAccount";
import type {
  CustomerOpportunity,
  OpportunityReview,
  OpportunityReviewResult,
} from "@/domain/opportunities/CustomerOpportunity";
import type { PortfolioSnapshot } from "@/domain/portfolio/PortfolioSnapshot";
import { CdiGatewayError } from "@/infra/errors/CdiErrors";

export class DecionisCdiRepository implements CdiRepository {
  constructor(private readonly gateway: DecionisCdiGateway) {}

  getPortfolio(): Promise<PortfolioSnapshot> {
    return this.gateway.getPortfolio();
  }

  async getAccount(accountId: string): Promise<CustomerAccount | null> {
    try {
      return await this.gateway.getAccount(accountId);
    } catch (error) {
      if (error instanceof CdiGatewayError && error.status === 404) return null;
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
