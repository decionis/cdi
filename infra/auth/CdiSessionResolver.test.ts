/**
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import {
  CdiRuntimeConfig,
  type CdiDataMode,
} from "@/infra/config/CdiRuntimeConfig";
import { CdiUnauthorizedError } from "@/infra/errors/CdiErrors";
import { CdiSessionResolver } from "./CdiSessionResolver";

function config(
  dataMode: CdiDataMode,
  overrides: Partial<{ serviceToken: string | null }> = {},
) {
  return new CdiRuntimeConfig({
    dataMode,
    apiBaseUrl: "https://api.decionis.com",
    serviceToken: overrides.serviceToken ?? null,
    accessTokenCookie: "decionis_access_token",
    orgIdCookie: "decionis_org_id",
    signInUrl: "https://decionis.com/sign-in",
    timeoutMs: 8_000,
  });
}

function request(
  init: Partial<{
    cookies: Record<string, string>;
    headers: Record<string, string>;
  }> = {},
) {
  const cookieHeader = Object.entries(init.cookies ?? {})
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");

  return new NextRequest("https://cdi.decionis.com/api/cdi/portfolio", {
    headers: {
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      ...(init.headers ?? {}),
    },
  });
}

const liveCookies = {
  decionis_access_token: "token-abc",
  decionis_org_id: "org-1",
};

describe("CdiSessionResolver — demo mode", () => {
  it("returns a fixture session without requiring any credential", () => {
    const session = new CdiSessionResolver(
      config("demo"),
    ).resolveRequestSession(request());

    expect(session.mode).toBe("DEMO");
    expect(session.accessToken).toBeNull();
    expect(session.orgId).toBe("demo-fintech");
  });

  it("grants the demo operator approval rights, so demo mode must never be production", () => {
    // The demo session is deliberately privileged so the review flow is
    // exercisable without a Decionis tenant. CdiRuntimeConfig is what keeps this
    // out of production by defaulting NODE_ENV=production to live mode.
    const session = new CdiSessionResolver(
      config("demo"),
    ).resolveRequestSession(request());

    expect(session.roles).toContain("ADMIN");
    expect(session.roles).toContain("APPROVER");
  });

  it("ignores any credential presented by the caller", () => {
    const session = new CdiSessionResolver(
      config("demo"),
    ).resolveRequestSession(
      request({
        cookies: {
          decionis_access_token: "attacker",
          decionis_org_id: "other-org",
        },
        headers: { authorization: "Bearer attacker" },
      }),
    );

    expect(session.orgId).toBe("demo-fintech");
    expect(session.accessToken).toBeNull();
  });
});

describe("CdiSessionResolver — live mode", () => {
  const resolver = new CdiSessionResolver(config("live"));

  it("rejects a request with no credential", () => {
    expect(() => resolver.resolveRequestSession(request())).toThrow(
      CdiUnauthorizedError,
    );
  });

  it("rejects a token without an organization scope", () => {
    // Without an org id there is no tenant boundary to enforce, so a token
    // alone must not produce a session.
    expect(() =>
      resolver.resolveRequestSession(
        request({ cookies: { decionis_access_token: "token-abc" } }),
      ),
    ).toThrow(CdiUnauthorizedError);
  });

  it("rejects an organization scope without a token", () => {
    expect(() =>
      resolver.resolveRequestSession(
        request({ cookies: { decionis_org_id: "org-1" } }),
      ),
    ).toThrow(CdiUnauthorizedError);
  });

  it("builds a live session from the handoff cookies", () => {
    const session = resolver.resolveRequestSession(
      request({ cookies: liveCookies }),
    );

    expect(session.mode).toBe("LIVE");
    expect(session.accessToken).toBe("token-abc");
    expect(session.orgId).toBe("org-1");
  });

  it("prefers a bearer token over the cookie", () => {
    const session = resolver.resolveRequestSession(
      request({
        cookies: liveCookies,
        headers: { authorization: "Bearer header-token" },
      }),
    );

    expect(session.accessToken).toBe("header-token");
  });

  it("ignores a non-bearer authorization scheme and falls back to the cookie", () => {
    const session = resolver.resolveRequestSession(
      request({
        cookies: liveCookies,
        headers: { authorization: "Basic dXNlcjpwYXNz" },
      }),
    );

    expect(session.accessToken).toBe("token-abc");
  });

  it("prefers the org header over the cookie", () => {
    const session = resolver.resolveRequestSession(
      request({
        cookies: liveCookies,
        headers: { "x-decionis-org-id": "org-from-header" },
      }),
    );

    expect(session.orgId).toBe("org-from-header");
  });

  it("uses the service token when the caller presents none", () => {
    const withServiceToken = new CdiSessionResolver(
      config("live", { serviceToken: "service-token" }),
    );

    const session = withServiceToken.resolveRequestSession(
      request({ cookies: { decionis_org_id: "org-1" } }),
    );

    expect(session.accessToken).toBe("service-token");
  });
});

describe("CdiSessionResolver — role parsing", () => {
  const resolver = new CdiSessionResolver(config("live"));

  function rolesFor(rolesCookie?: string) {
    return resolver.resolveRequestSession(
      request({
        cookies: {
          ...liveCookies,
          ...(rolesCookie === undefined ? {} : { decionis_roles: rolesCookie }),
        },
      }),
    ).roles;
  }

  it("parses a comma-separated role list", () => {
    expect(rolesFor("APPROVER,ADMIN")).toEqual(["APPROVER", "ADMIN"]);
  });

  it("tolerates surrounding whitespace", () => {
    expect(rolesFor(" APPROVER , ADMIN ")).toEqual(["APPROVER", "ADMIN"]);
  });

  it("drops unrecognized roles rather than trusting them", () => {
    expect(rolesFor("SUPERUSER,ADMIN")).toEqual(["ADMIN"]);
  });

  it("falls back to VIEWER when no role is recognized", () => {
    // The privilege floor. An unparseable or hostile role claim must never
    // produce an empty role set, which downstream checks could misread.
    expect(rolesFor("root,superuser,*")).toEqual(["VIEWER"]);
  });

  it("falls back to VIEWER when the claim is absent", () => {
    expect(rolesFor(undefined)).toEqual(["VIEWER"]);
  });

  it("does not grant approval rights by default", () => {
    // A session that reaches OpportunityService without an explicit APPROVER or
    // ADMIN claim must not be able to review.
    const roles = rolesFor(undefined);

    expect(roles).not.toContain("APPROVER");
    expect(roles).not.toContain("ADMIN");
  });

  it("is case-sensitive, so a lowercase claim does not elevate", () => {
    expect(rolesFor("admin,approver")).toEqual(["VIEWER"]);
  });
});

describe("CdiSessionResolver — display name", () => {
  it("URL-decodes the display name from the handoff cookie", () => {
    const session = new CdiSessionResolver(
      config("live"),
    ).resolveRequestSession(
      request({
        cookies: { ...liveCookies, decionis_display_name: "Erin%20Example" },
      }),
    );

    expect(session.displayName).toBe("Erin Example");
  });

  it("falls back to a generic name when none is supplied", () => {
    const session = new CdiSessionResolver(
      config("live"),
    ).resolveRequestSession(request({ cookies: liveCookies }));

    expect(session.displayName).toBe("Decionis operator");
  });
});
