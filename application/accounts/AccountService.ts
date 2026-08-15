import type { CustomerAccount } from "@/domain/accounts/CustomerAccount";
import { StewardNotFoundError } from "@/infra/errors/StewardErrors";
import type { StewardRepository } from "@/infra/repositories/StewardRepository";

export class AccountService {
  constructor(private readonly repository: StewardRepository) {}

  async requireAccount(accountId: string): Promise<CustomerAccount> {
    const account = await this.repository.getAccount(accountId);
    if (!account) throw new StewardNotFoundError("Account");
    return account;
  }
}
