import type { StewardSession } from "@/domain/auth/StewardSession";
import { StewardRuntimeConfig } from "@/infra/config/StewardRuntimeConfig";
import { DecionisStewardGateway } from "@/infra/api/DecionisStewardGateway";
import { JsonHttpClient } from "@/infra/api/JsonHttpClient";
import { StewardUnauthorizedError } from "@/infra/errors/StewardErrors";
import type { StewardRepository } from "./StewardRepository";
import { DecionisStewardRepository } from "./DecionisStewardRepository";
import { DemoStewardRepository } from "./DemoStewardRepository";

export class StewardRepositoryFactory {
  constructor(private readonly config: StewardRuntimeConfig) {}

  create(session: StewardSession): StewardRepository {
    if (this.config.dataMode === "demo") return new DemoStewardRepository();
    if (!this.config.apiBaseUrl || !session.accessToken)
      throw new StewardUnauthorizedError();

    const httpClient = new JsonHttpClient({
      baseUrl: this.config.apiBaseUrl,
      bearerToken: session.accessToken,
      orgId: session.orgId,
      timeoutMs: this.config.timeoutMs,
    });
    return new DecionisStewardRepository(
      new DecionisStewardGateway(httpClient, session.orgId),
    );
  }
}
