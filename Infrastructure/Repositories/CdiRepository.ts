import type { CustomerAccount } from "@/Domain/Accounts/CustomerAccount";
import type {
  CustomerOpportunity,
  OpportunityReview,
  OpportunityReviewResult,
} from "@/Domain/Opportunities/CustomerOpportunity";
import type { PortfolioSnapshot } from "@/Domain/Portfolio/PortfolioSnapshot";

export interface CdiRepository {
  getPortfolio(): Promise<PortfolioSnapshot>;
  getAccount(accountId: string): Promise<CustomerAccount | null>;
  listOpportunities(): Promise<CustomerOpportunity[]>;
  reviewOpportunity(
    opportunityId: string,
    review: OpportunityReview,
  ): Promise<OpportunityReviewResult>;
}
