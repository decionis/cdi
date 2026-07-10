import type { CdiSession } from "@/domain/auth/CdiSession";
import {
  OpportunityReviewSchema,
  type CustomerOpportunity,
  type OpportunityReviewResult,
} from "@/domain/opportunities/CustomerOpportunity";
import { CdiForbiddenError } from "@/infra/errors/CdiErrors";
import type { CdiRepository } from "@/infra/repositories/CdiRepository";

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
