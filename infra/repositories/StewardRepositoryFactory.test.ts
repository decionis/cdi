import { describe, expect, it } from "vitest";
import { StewardRepositoryFactory } from "./StewardRepositoryFactory";
import { DemoStewardRepository } from "./DemoStewardRepository";
import { DecionisStewardRepository } from "./DecionisStewardRepository";
import { StewardUnauthorizedError } from "@/infra/errors/StewardErrors";
import type { StewardRuntimeConfig } from "@/infra/config/StewardRuntimeConfig";
import type { StewardSession } from "@/domain/auth/StewardSession";

/**
 * The demo/live switch.
 *
 * EvidencePack.md tells reviewers that a live failure never falls back to
 * fixtures. This is where that is decided, so it is asserted here directly
 * rather than inferred from the demo repository's behaviour.
 */

function config(
  overrides: Partial<StewardRuntimeConfig> = {},
): StewardRuntimeConfig {
  return {
    dataMode: "live",
    apiBaseUrl: "https://api.decionis.com",
    timeoutMs: 5000,
    ...overrides,
  } as StewardRuntimeConfig;
}

const liveSession: StewardSession = {
  subject: "operator-1",
  displayName: "Erin Example",
  orgId: "org-1",
  roles: ["APPROVER"],
  accessToken: "token-abc",
  mode: "LIVE",
};

const demoSession: StewardSession = {
  ...liveSession,
  accessToken: null,
  mode: "DEMO",
};

describe("StewardRepositoryFactory", () => {
  it("builds the demo repository in demo mode", () => {
    const factory = new StewardRepositoryFactory(config({ dataMode: "demo" }));

    expect(factory.create(demoSession)).toBeInstanceOf(DemoStewardRepository);
  });

  it("builds the live repository when the configuration is complete", () => {
    const factory = new StewardRepositoryFactory(config());

    expect(factory.create(liveSession)).toBeInstanceOf(
      DecionisStewardRepository,
    );
  });

  it("refuses rather than falling back to fixtures when the token is missing", () => {
    // The defect this prevents: a live deployment losing its credential and
    // silently serving demo evidence, which an operator would act on as though
    // it were their own customer data.
    const factory = new StewardRepositoryFactory(config());

    expect(() => factory.create({ ...liveSession, accessToken: null })).toThrow(
      StewardUnauthorizedError,
    );
  });

  it("refuses rather than falling back when the API base URL is missing", () => {
    const factory = new StewardRepositoryFactory(config({ apiBaseUrl: "" }));

    expect(() => factory.create(liveSession)).toThrow(StewardUnauthorizedError);
  });

  it("never returns a demo repository in live mode, whatever the session", () => {
    // The property, stated once: in live mode there is no input that produces
    // fixtures. Either a live repository or an error.
    const factory = new StewardRepositoryFactory(config());

    for (const session of [liveSession, demoSession]) {
      let result: unknown;
      try {
        result = factory.create(session);
      } catch (error) {
        expect(error).toBeInstanceOf(StewardUnauthorizedError);
        continue;
      }
      expect(result).not.toBeInstanceOf(DemoStewardRepository);
    }
  });

  it("ignores the session mode and honours the configured data mode", () => {
    // A DEMO-mode session must not be able to talk a live-configured
    // deployment into serving fixtures.
    const factory = new StewardRepositoryFactory(config());

    expect(() => factory.create(demoSession)).toThrow(StewardUnauthorizedError);
  });
});
