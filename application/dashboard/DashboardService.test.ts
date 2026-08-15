import { describe, expect, it, vi } from "vitest";
import { DashboardService } from "./DashboardService";
import type { StewardRepository } from "@/infra/repositories/StewardRepository";
import type { PortfolioSnapshot } from "@/domain/portfolio/PortfolioSnapshot";

describe("DashboardService", () => {
  it("returns the portfolio the repository resolves", async () => {
    const snapshot = { dataStatus: "DEMO" } as PortfolioSnapshot;
    const repository = {
      getPortfolio: vi.fn().mockResolvedValue(snapshot),
    } as unknown as StewardRepository;

    await expect(new DashboardService(repository).getPortfolio()).resolves.toBe(
      snapshot,
    );
  });

  it("does not swallow an upstream failure", async () => {
    // The dashboard must surface a failure rather than render an empty
    // portfolio, which an operator would read as "nothing needs attention".
    const repository = {
      getPortfolio: vi.fn().mockRejectedValue(new Error("upstream down")),
    } as unknown as StewardRepository;

    await expect(
      new DashboardService(repository).getPortfolio(),
    ).rejects.toThrow("upstream down");
  });
});
