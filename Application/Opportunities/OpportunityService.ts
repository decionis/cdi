import type { CdiSession } from "@/Domain/Auth/CdiSession";
import {
  OpportunityReviewSchema,
  type CustomerOpportunity,
  type OpportunityReviewResult,
} from "@/Domain/Opportunities/CustomerOpportunity";
import { CdiForbiddenError } from "@/Infrastructure/Errors/CdiErrors";
import type { CdiRepository } from "@/Infrastructure/Repositories/CdiRepository";

export class OpportunityService {
  constructor(
    private readonly repository: CdiRepository,
    private readonly session: CdiSession,
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
      throw new CdiForbiddenError();
    }
    const review = OpportunityReviewSchema.parse(input);
    return this.repository.reviewOpportunity(opportunityId, review);
  }
}
