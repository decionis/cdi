import { describe, expect, it } from "vitest";
import { DemoCdiRepository } from "./DemoCdiRepository";

describe("DemoCdiRepository", () => {
  it("returns a contract-valid governed portfolio", async () => {
    const repository = new DemoCdiRepository();
    const portfolio = await repository.getPortfolio();

    expect(portfolio.dataStatus).toBe("DEMO");
    expect(portfolio.accounts).toHaveLength(4);
    expect(portfolio.opportunities).toHaveLength(3);
    expect(portfolio.opportunities.every((item) => item.dossierId)).toBe(true);
  });

  it("returns account evidence without exposing connector credentials", async () => {
    const repository = new DemoCdiRepository();
    const account = await repository.getAccount("acct-atlas");

    expect(account?.evidence).toHaveLength(3);
    expect(account?.connectors[0]).not.toHaveProperty("credentials");
    expect(account?.policyEnvelope.automaticChangesEnabled).toBe(false);
  });

  it("records review state without executing a downstream action", async () => {
    const repository = new DemoCdiRepository();
    const result = await repository.reviewOpportunity("opp-atlas-limit", {
      decision: "APPROVE",
    });

    expect(result.opportunity.status).toBe("APPROVED");
    expect(result.reviewId).toContain("review-demo");
  });
});
