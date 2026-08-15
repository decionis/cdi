import { describe, expect, it, vi } from "vitest";
import { AccountService } from "./AccountService";
import { CdiNotFoundError } from "@/infra/errors/CdiErrors";
import type { CdiRepository } from "@/infra/repositories/CdiRepository";
import type { CustomerAccount } from "@/domain/accounts/CustomerAccount";

function repositoryReturning(account: CustomerAccount | null): CdiRepository {
  return {
    getPortfolio: vi.fn(),
    getAccount: vi.fn().mockResolvedValue(account),
    getOpportunities: vi.fn(),
    reviewOpportunity: vi.fn(),
  } as unknown as CdiRepository;
}

describe("AccountService", () => {
  it("returns the account the repository resolves", async () => {
    const account = { id: "acct-kilo" } as CustomerAccount;
    const service = new AccountService(repositoryReturning(account));

    await expect(service.requireAccount("acct-kilo")).resolves.toBe(account);
  });

  it("raises a typed not-found error rather than returning null", async () => {
    // Route handlers map CdiNotFoundError to a 404. Returning null here would
    // surface as a 500 from a downstream property access instead.
    const service = new AccountService(repositoryReturning(null));

    await expect(service.requireAccount("acct-missing")).rejects.toThrow(
      CdiNotFoundError,
    );
  });

  it("passes the requested identifier through unmodified", async () => {
    const repository = repositoryReturning({ id: "x" } as CustomerAccount);
    const service = new AccountService(repository);

    await service.requireAccount("acct-kilo");

    expect(repository.getAccount).toHaveBeenCalledWith("acct-kilo");
  });
});
