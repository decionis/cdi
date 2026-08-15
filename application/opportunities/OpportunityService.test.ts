import { describe, expect, it } from "vitest";
import type { CdiSession } from "@/domain/auth/CdiSession";
import { CdiForbiddenError } from "@/infra/errors/CdiErrors";
import { DemoCdiRepository } from "@/infra/repositories/DemoCdiRepository";
import { OpportunityService } from "./OpportunityService";

function session(roles: CdiSession["roles"]): CdiSession {
  return {
    subject: "test-user",
    displayName: "Test User",
    orgId: "test-org",
    roles,
    accessToken: null,
    mode: "DEMO",
  };
}

describe("OpportunityService", () => {
  it("requires an approver role for reviews", async () => {
    const service = new OpportunityService(
      new DemoCdiRepository(),
      session(["VIEWER"]),
    );

    await expect(
      service.review("opp-kilo-limit", { decision: "APPROVE" }),
    ).rejects.toBeInstanceOf(CdiForbiddenError);
  });

  it("validates and forwards an approver review", async () => {
    const service = new OpportunityService(
      new DemoCdiRepository(),
      session(["APPROVER"]),
    );

    const result = await service.review("opp-kilo-limit", {
      decision: "HOLD",
    });

    expect(result.opportunity.status).toBe("HELD");
  });
});
