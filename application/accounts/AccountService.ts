import type { CustomerAccount } from "@/domain/accounts/CustomerAccount";
import { CdiNotFoundError } from "@/infra/errors/CdiErrors";
import type { CdiRepository } from "@/infra/repositories/CdiRepository";

export class AccountService {
  constructor(private readonly repository: CdiRepository) {}

  async requireAccount(accountId: string): Promise<CustomerAccount> {
    const account = await this.repository.getAccount(accountId);
    if (!account) throw new CdiNotFoundError("Account");
    return account;
  }
}
