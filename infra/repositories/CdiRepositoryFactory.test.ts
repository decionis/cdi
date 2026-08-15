import { describe, expect, it } from "vitest";
import { CdiRepositoryFactory } from "./CdiRepositoryFactory";
import { DemoCdiRepository } from "./DemoCdiRepository";
import { DecionisCdiRepository } from "./DecionisCdiRepository";
import { CdiUnauthorizedError } from "@/infra/errors/CdiErrors";
import type { CdiRuntimeConfig } from "@/infra/config/CdiRuntimeConfig";
import type { CdiSession } from "@/domain/auth/CdiSession";

/**
 * The demo/live switch.
 *
 * EvidencePack.md tells reviewers that a live failure never falls back to
 * fixtures. This is where that is decided, so it is asserted here directly
 * rather than inferred from the demo repository's behaviour.
 */

function config(overrides: Partial<CdiRuntimeConfig> = {}): CdiRuntimeConfig {
  return {
    dataMode: "live",
    apiBaseUrl: "https://api.decionis.com",
    timeoutMs: 5000,
    ...overrides,
  } as CdiRuntimeConfig;
}

const liveSession: CdiSession = {
  subject: "operator-1",
  displayName: "Erin Example",
  orgId: "org-1",
  roles: ["APPROVER"],
  accessToken: "token-abc",
  mode: "LIVE",
};

const demoSession: CdiSession = {
  ...liveSession,
  accessToken: null,
  mode: "DEMO",
};

describe("CdiRepositoryFactory", () => {
  it("builds the demo repository in demo mode", () => {
    const factory = new CdiRepositoryFactory(config({ dataMode: "demo" }));

    expect(factory.create(demoSession)).toBeInstanceOf(DemoCdiRepository);
  });

  it("builds the live repository when the configuration is complete", () => {
    const factory = new CdiRepositoryFactory(config());

    expect(factory.create(liveSession)).toBeInstanceOf(DecionisCdiRepository);
  });

  it("refuses rather than falling back to fixtures when the token is missing", () => {
    // The defect this prevents: a live deployment losing its credential and
    // silently serving demo evidence, which an operator would act on as though
    // it were their own customer data.
    const factory = new CdiRepositoryFactory(config());

    expect(() => factory.create({ ...liveSession, accessToken: null })).toThrow(
      CdiUnauthorizedError,
    );
  });

  it("refuses rather than falling back when the API base URL is missing", () => {
    const factory = new CdiRepositoryFactory(config({ apiBaseUrl: "" }));

    expect(() => factory.create(liveSession)).toThrow(CdiUnauthorizedError);
  });

  it("never returns a demo repository in live mode, whatever the session", () => {
    // The property, stated once: in live mode there is no input that produces
    // fixtures. Either a live repository or an error.
    const factory = new CdiRepositoryFactory(config());

    for (const session of [liveSession, demoSession]) {
      let result: unknown;
      try {
        result = factory.create(session);
      } catch (error) {
        expect(error).toBeInstanceOf(CdiUnauthorizedError);
        continue;
      }
      expect(result).not.toBeInstanceOf(DemoCdiRepository);
    }
  });

  it("ignores the session mode and honours the configured data mode", () => {
    // A DEMO-mode session must not be able to talk a live-configured
    // deployment into serving fixtures.
    const factory = new CdiRepositoryFactory(config());

    expect(() => factory.create(demoSession)).toThrow(CdiUnauthorizedError);
  });
});
