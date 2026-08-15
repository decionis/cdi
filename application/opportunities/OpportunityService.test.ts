import { describe, expect, it } from "vitest";
import type { StewardSession } from "@/domain/auth/StewardSession";
import { StewardForbiddenError } from "@/infra/errors/StewardErrors";
import { DemoStewardRepository } from "@/infra/repositories/DemoStewardRepository";
import { OpportunityService } from "./OpportunityService";

function session(roles: StewardSession["roles"]): StewardSession {
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
      new DemoStewardRepository(),
      session(["VIEWER"]),
    );

    await expect(
      service.review("opp-kilo-limit", { decision: "APPROVE" }),
    ).rejects.toBeInstanceOf(StewardForbiddenError);
  });

  it("validates and forwards an approver review", async () => {
    const service = new OpportunityService(
      new DemoStewardRepository(),
      session(["APPROVER"]),
    );

    const result = await service.review("opp-kilo-limit", {
      decision: "HOLD",
    });

    expect(result.opportunity.status).toBe("HELD");
  });
});
