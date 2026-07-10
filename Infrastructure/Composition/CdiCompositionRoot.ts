import type { NextRequest } from "next/server";
import { AccountService } from "@/Application/Accounts/AccountService";
import { DashboardService } from "@/Application/Dashboard/DashboardService";
import { OpportunityService } from "@/Application/Opportunities/OpportunityService";
import type { CdiSession } from "@/Domain/Auth/CdiSession";
import { CdiSessionResolver } from "@/Infrastructure/Auth/CdiSessionResolver";
import { CdiRuntimeConfig } from "@/Infrastructure/Config/CdiRuntimeConfig";
import { CdiRepositoryFactory } from "@/Infrastructure/Repositories/CdiRepositoryFactory";
import type { CdiApplicationContext } from "./CdiApplicationContext";

export class CdiCompositionRoot {
  private readonly sessionResolver: CdiSessionResolver;
  private readonly repositoryFactory: CdiRepositoryFactory;

  constructor(config = CdiRuntimeConfig.fromEnvironment()) {
    this.sessionResolver = new CdiSessionResolver(config);
    this.repositoryFactory = new CdiRepositoryFactory(config);
  }

  async createServerContext(): Promise<CdiApplicationContext> {
    const session = await this.sessionResolver.resolveServerSession();
    return this.createContext(session);
  }

  createRequestContext(request: NextRequest): CdiApplicationContext {
    const session = this.sessionResolver.resolveRequestSession(request);
    return this.createContext(session);
  }

  private createContext(session: CdiSession): CdiApplicationContext {
    const repository = this.repositoryFactory.create(session);
    return {
      session,
      dashboard: new DashboardService(repository),
      accounts: new AccountService(repository),
      opportunities: new OpportunityService(repository, session),
    };
  }
}
