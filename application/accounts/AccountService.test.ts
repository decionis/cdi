import { describe, expect, it, vi } from "vitest";
import { AccountService } from "./AccountService";
import { StewardNotFoundError } from "@/infra/errors/StewardErrors";
import type { StewardRepository } from "@/infra/repositories/StewardRepository";
import type { CustomerAccount } from "@/domain/accounts/CustomerAccount";

function repositoryReturning(
  account: CustomerAccount | null,
): StewardRepository {
  return {
    getPortfolio: vi.fn(),
    getAccount: vi.fn().mockResolvedValue(account),
    getOpportunities: vi.fn(),
    reviewOpportunity: vi.fn(),
  } as unknown as StewardRepository;
}

describe("AccountService", () => {
  it("returns the account the repository resolves", async () => {
    const account = { id: "acct-kilo" } as CustomerAccount;
    const service = new AccountService(repositoryReturning(account));

    await expect(service.requireAccount("acct-kilo")).resolves.toBe(account);
  });

  it("raises a typed not-found error rather than returning null", async () => {
    // Route handlers map StewardNotFoundError to a 404. Returning null here would
    // surface as a 500 from a downstream property access instead.
    const service = new AccountService(repositoryReturning(null));

    await expect(service.requireAccount("acct-missing")).rejects.toThrow(
      StewardNotFoundError,
    );
  });

  it("passes the requested identifier through unmodified", async () => {
    const repository = repositoryReturning({ id: "x" } as CustomerAccount);
    const service = new AccountService(repository);

    await service.requireAccount("acct-kilo");

    expect(repository.getAccount).toHaveBeenCalledWith("acct-kilo");
  });
});
