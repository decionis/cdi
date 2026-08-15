import type { StewardSession } from "@/domain/auth/StewardSession";
import {
  OpportunityReviewSchema,
  type CustomerOpportunity,
  type OpportunityReviewResult,
} from "@/domain/opportunities/CustomerOpportunity";
import { StewardForbiddenError } from "@/infra/errors/StewardErrors";
import type { StewardRepository } from "@/infra/repositories/StewardRepository";

export class OpportunityService {
  constructor(
    private readonly repository: StewardRepository,
    private readonly session: StewardSession,
  ) {}

  list(): Promise<CustomerOpportunity[]> {
    return this.repository.listOpportunities();
  }

  async review(
    opportunityId: string,
    input: unknown,
  ): Promise<OpportunityReviewResult> {
    if (
      !this.session.roles.some(
        (role) => role === "APPROVER" || role === "ADMIN",
      )
    ) {
      throw new StewardForbiddenError();
    }
    const review = OpportunityReviewSchema.parse(input);
    return this.repository.reviewOpportunity(opportunityId, review);
  }
}
