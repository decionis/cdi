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
import { JsonHttpClient } from "./JsonHttpClient";
import { z } from "zod";

const OpportunityListSchema = z.object({
  opportunities: z.array(CustomerOpportunitySchema),
});

export class DecionisStewardGateway {
  constructor(
    private readonly httpClient: JsonHttpClient,
    private readonly orgId: string,
  ) {}

  getPortfolio(): Promise<PortfolioSnapshot> {
    return this.httpClient.get(
      `/v1/cdi/portfolio?org_id=${encodeURIComponent(this.orgId)}`,
      PortfolioSnapshotSchema,
    );
  }

  getAccount(accountId: string): Promise<CustomerAccount> {
    return this.httpClient.get(
      `/v1/cdi/accounts/${encodeURIComponent(accountId)}?org_id=${encodeURIComponent(this.orgId)}`,
      CustomerAccountSchema,
    );
  }

  async listOpportunities(): Promise<CustomerOpportunity[]> {
    const response = await this.httpClient.get(
      `/v1/cdi/opportunities?org_id=${encodeURIComponent(this.orgId)}`,
      OpportunityListSchema,
    );
    return response.opportunities;
  }

  reviewOpportunity(
    opportunityId: string,
    review: OpportunityReview,
  ): Promise<OpportunityReviewResult> {
    return this.httpClient.post(
      `/v1/cdi/opportunities/${encodeURIComponent(opportunityId)}/reviews`,
      { org_id: this.orgId, ...review },
      OpportunityReviewResultSchema,
    );
  }
}
