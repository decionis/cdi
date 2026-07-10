import type { CustomerAccount } from "@/Domain/Accounts/CustomerAccount";
import { CdiNotFoundError } from "@/Infrastructure/Errors/CdiErrors";
import type { CdiRepository } from "@/Infrastructure/Repositories/CdiRepository";

export class AccountService {
  constructor(private readonly repository: CdiRepository) {}

  async requireAccount(accountId: string): Promise<CustomerAccount> {
    const account = await this.repository.getAccount(accountId);
    if (!account) throw new CdiNotFoundError("Account");
    return account;
  }
}
