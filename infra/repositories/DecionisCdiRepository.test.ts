import { describe, expect, it, vi } from "vitest";
import { DecionisCdiRepository } from "./DecionisCdiRepository";
import { CdiGatewayError } from "@/infra/errors/CdiErrors";
import type { DecionisCdiGateway } from "@/infra/api/DecionisCdiGateway";

function repositoryWith(gateway: Partial<DecionisCdiGateway>) {
  return new DecionisCdiRepository(gateway as DecionisCdiGateway);
}

describe("DecionisCdiRepository", () => {
  it("treats a 404 account as absent rather than as a failure", async () => {
    // A missing account is a 404 to the caller, not a 500. This is the only
    // status the repository is allowed to soften.
    const repository = repositoryWith({
      getAccount: vi
        .fn()
        .mockRejectedValue(new CdiGatewayError("nope", 404, null)),
    });

    await expect(repository.getAccount("acct-missing")).resolves.toBeNull();
  });

  it("propagates any other gateway failure", async () => {
    // The important half: a 500 upstream must not read as "no such account",
    // which would render an empty page as though the answer were known.
    const repository = repositoryWith({
      getAccount: vi
        .fn()
        .mockRejectedValue(new CdiGatewayError("boom", 500, null)),
    });

    await expect(repository.getAccount("acct-kilo")).rejects.toThrow(
      CdiGatewayError,
    );
  });

  it("propagates a non-gateway error untouched", async () => {
    const repository = repositoryWith({
      getAccount: vi.fn().mockRejectedValue(new TypeError("network")),
    });

    await expect(repository.getAccount("acct-kilo")).rejects.toThrow(TypeError);
  });

  it("does not soften a 404 on any other operation", async () => {
    // Only getAccount has a meaningful "absent" answer. A 404 from the
    // portfolio endpoint is a misconfiguration and must surface as one.
    const repository = repositoryWith({
      getPortfolio: vi
        .fn()
        .mockRejectedValue(new CdiGatewayError("nope", 404, null)),
    });

    await expect(repository.getPortfolio()).rejects.toThrow(CdiGatewayError);
  });

  it("forwards a review to the gateway unchanged", async () => {
    const reviewOpportunity = vi.fn().mockResolvedValue({ reviewId: "r-1" });
    const repository = repositoryWith({ reviewOpportunity });

    await repository.reviewOpportunity("opp-1", {
      decision: "HOLD",
      note: "waiting on KYB",
    });

    expect(reviewOpportunity).toHaveBeenCalledWith("opp-1", {
      decision: "HOLD",
      note: "waiting on KYB",
    });
  });

  it("passes the portfolio and opportunity list straight through", async () => {
    const snapshot = { dataStatus: "LIVE" };
    const repository = repositoryWith({
      getPortfolio: vi.fn().mockResolvedValue(snapshot),
      listOpportunities: vi.fn().mockResolvedValue([{ id: "opp-1" }]),
    });

    await expect(repository.getPortfolio()).resolves.toBe(snapshot);
    await expect(repository.listOpportunities()).resolves.toEqual([
      { id: "opp-1" },
    ]);
  });
});
