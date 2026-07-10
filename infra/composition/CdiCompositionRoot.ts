import type { NextRequest } from "next/server";
import { AccountService } from "@/application/accounts/AccountService";
import { DashboardService } from "@/application/dashboard/DashboardService";
import { OpportunityService } from "@/application/opportunities/OpportunityService";
import type { CdiSession } from "@/domain/auth/CdiSession";
import { CdiSessionResolver } from "@/infra/auth/CdiSessionResolver";
import { CdiRuntimeConfig } from "@/infra/config/CdiRuntimeConfig";
import { CdiRepositoryFactory } from "@/infra/repositories/CdiRepositoryFactory";
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
