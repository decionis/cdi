import type { CdiSession } from "@/Domain/Auth/CdiSession";
import { CdiRuntimeConfig } from "@/Infrastructure/Config/CdiRuntimeConfig";
import { DecionisCdiGateway } from "@/Infrastructure/Api/DecionisCdiGateway";
import { JsonHttpClient } from "@/Infrastructure/Api/JsonHttpClient";
import { CdiUnauthorizedError } from "@/Infrastructure/Errors/CdiErrors";
import type { CdiRepository } from "./CdiRepository";
import { DecionisCdiRepository } from "./DecionisCdiRepository";
import { DemoCdiRepository } from "./DemoCdiRepository";

export class CdiRepositoryFactory {
  constructor(private readonly config: CdiRuntimeConfig) {}

  create(session: CdiSession): CdiRepository {
    if (this.config.dataMode === "demo") return new DemoCdiRepository();
    if (!this.config.apiBaseUrl || !session.accessToken)
      throw new CdiUnauthorizedError();

    const httpClient = new JsonHttpClient({
      baseUrl: this.config.apiBaseUrl,
      bearerToken: session.accessToken,
      orgId: session.orgId,
      timeoutMs: this.config.timeoutMs,
    });
    return new DecionisCdiRepository(
      new DecionisCdiGateway(httpClient, session.orgId),
    );
  }
}
