import type { CdiRepository } from "./CdiRepository";
import type { DecionisCdiGateway } from "@/Infrastructure/Api/DecionisCdiGateway";
import type { CustomerAccount } from "@/Domain/Accounts/CustomerAccount";
import type {
  CustomerOpportunity,
  OpportunityReview,
  OpportunityReviewResult,
} from "@/Domain/Opportunities/CustomerOpportunity";
import type { PortfolioSnapshot } from "@/Domain/Portfolio/PortfolioSnapshot";
import { CdiGatewayError } from "@/Infrastructure/Errors/CdiErrors";

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
