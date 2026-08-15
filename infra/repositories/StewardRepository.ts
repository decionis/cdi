import type { CustomerAccount } from "@/domain/accounts/CustomerAccount";
import type {
  CustomerOpportunity,
  OpportunityReview,
  OpportunityReviewResult,
} from "@/domain/opportunities/CustomerOpportunity";
import type { PortfolioSnapshot } from "@/domain/portfolio/PortfolioSnapshot";

export interface StewardRepository {
  getPortfolio(): Promise<PortfolioSnapshot>;
  getAccount(accountId: string): Promise<CustomerAccount | null>;
  listOpportunities(): Promise<CustomerOpportunity[]>;
  reviewOpportunity(
    opportunityId: string,
    review: OpportunityReview,
  ): Promise<OpportunityReviewResult>;
}
