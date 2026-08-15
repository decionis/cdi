/**
 * @vitest-environment node
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { config, middleware } from "./middleware";

function request(
  pathname: string,
  cookies: Record<string, string> = {},
): NextRequest {
  const cookieHeader = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");

  return new NextRequest(`https://cdi.decionis.com${pathname}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  });
}

/** NextResponse.next() is identifiable by the header Next uses internally. */
function isPassThrough(response: Response): boolean {
  return response.headers.get("x-middleware-next") === "1";
}

const validSession = {
  decionis_access_token: "token-abc",
  decionis_org_id: "org-1",
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("middleware — demo mode", () => {
  it("lets every request through when the data mode is demo", () => {
    vi.stubEnv("CDI_DATA_MODE", "demo");

    for (const path of ["/", "/accounts/acct-kilo", "/api/cdi/portfolio"]) {
      expect(isPassThrough(middleware(request(path)))).toBe(true);
    }
  });

  it("defaults to demo outside production", () => {
    vi.stubEnv("CDI_DATA_MODE", "");
    vi.stubEnv("NODE_ENV", "development");

    expect(isPassThrough(middleware(request("/")))).toBe(true);
  });
});

describe("middleware — live mode", () => {
  function goLive() {
    vi.stubEnv("CDI_DATA_MODE", "live");
  }

  it("defaults to live in production even with no explicit data mode", () => {
    // The safe default: an unconfigured production deployment gates requests
    // rather than serving them unauthenticated.
    vi.stubEnv("CDI_DATA_MODE", "");
    vi.stubEnv("NODE_ENV", "production");

    const response = middleware(request("/"));

    expect(isPassThrough(response)).toBe(false);
    expect(response.status).toBe(307);
  });

  it("redirects an unauthenticated page request to sign-in", () => {
    goLive();

    const response = middleware(request("/accounts/acct-kilo"));

    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location") ?? "");
    expect(location.pathname).toBe("/sign-in");
    expect(location.searchParams.get("returnTo")).toBe("/accounts/acct-kilo");
  });

  it("answers an unauthenticated API request with 401 rather than a redirect", async () => {
    // An API client following a redirect to an HTML sign-in page would surface
    // a parse error instead of the actual authentication failure.
    goLive();

    const response = middleware(request("/api/cdi/portfolio"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: "UNAUTHORIZED",
    });
  });

  it("admits a request carrying both handoff cookies", () => {
    goLive();

    expect(
      isPassThrough(middleware(request("/api/cdi/portfolio", validSession))),
    ).toBe(true);
  });

  it("rejects a token without an organization scope", () => {
    goLive();

    const response = middleware(
      request("/api/cdi/portfolio", { decionis_access_token: "token-abc" }),
    );

    expect(response.status).toBe(401);
  });

  it("rejects an organization scope without a token", () => {
    goLive();

    const response = middleware(
      request("/api/cdi/portfolio", { decionis_org_id: "org-1" }),
    );

    expect(response.status).toBe(401);
  });

  it("rejects an empty cookie value", () => {
    goLive();

    const response = middleware(
      request("/api/cdi/portfolio", {
        decionis_access_token: "",
        decionis_org_id: "org-1",
      }),
    );

    expect(response.status).toBe(401);
  });

  it("leaves the health probe reachable without a session", () => {
    // Load balancers and uptime checks have no Decionis session.
    goLive();

    expect(isPassThrough(middleware(request("/api/health")))).toBe(true);
  });

  it("gates every other API route", () => {
    goLive();

    for (const path of [
      "/api/cdi/portfolio",
      "/api/cdi/opportunities",
      "/api/cdi/accounts/acct-kilo",
      "/api/cdi/opportunities/opp-1/review",
    ]) {
      expect(middleware(request(path)).status).toBe(401);
    }
  });

  it("honours configured cookie names", () => {
    goLive();
    vi.stubEnv("CDI_ACCESS_TOKEN_COOKIE", "custom_token");
    vi.stubEnv("CDI_ORG_ID_COOKIE", "custom_org");

    expect(
      isPassThrough(
        middleware(
          request("/api/cdi/portfolio", {
            custom_token: "token-abc",
            custom_org: "org-1",
          }),
        ),
      ),
    ).toBe(true);

    // The default names must not be accepted once custom ones are configured.
    expect(middleware(request("/api/cdi/portfolio", validSession)).status).toBe(
      401,
    );
  });
});

describe("middleware — matcher", () => {
  it("exempts only immutable static assets", () => {
    // The matcher is part of the security boundary: anything it excludes is
    // never seen by the middleware at all, so it receives no policy either.
    expect(config.matcher).toHaveLength(1);
    for (const exemption of ["_next/static", "_next/image", "favicon.ico"]) {
      expect(config.matcher[0]).toContain(exemption);
    }
  });

  it("matches the sign-in page so it still receives a policy", () => {
    // sign-in was previously excluded from the matcher to avoid a redirect
    // loop. That also left the one page an unauthenticated visitor always
    // reaches with no Content-Security-Policy. It is matched now and allowed
    // through the session gate explicitly instead.
    expect(config.matcher[0]).not.toContain("sign-in");
  });
});

describe("middleware — Content-Security-Policy", () => {
  function policyFor(response: Response): string {
    const policy = response.headers.get("content-security-policy");
    expect(policy).not.toBeNull();
    return policy ?? "";
  }

  it("is applied in demo mode", () => {
    // A demo deployment is public-facing. The policy is not a live-mode
    // concern, and gating it behind the session check would have left the
    // public demo without one.
    vi.stubEnv("CDI_DATA_MODE", "demo");

    expect(policyFor(middleware(request("/")))).toContain("default-src 'self'");
  });

  it("is applied to an authenticated live request", () => {
    vi.stubEnv("CDI_DATA_MODE", "live");

    expect(policyFor(middleware(request("/", validSession)))).toContain(
      "default-src 'self'",
    );
  });

  it("is applied to a 401 refusal", () => {
    // A refused request is still a response leaving this application.
    vi.stubEnv("CDI_DATA_MODE", "live");

    const response = middleware(request("/api/cdi/portfolio"));

    expect(response.status).toBe(401);
    expect(policyFor(response)).toContain("default-src 'self'");
  });

  it("is applied to a sign-in redirect", () => {
    vi.stubEnv("CDI_DATA_MODE", "live");

    const response = middleware(request("/accounts/acct-kilo"));

    expect(response.status).toBe(307);
    expect(policyFor(response)).toContain("default-src 'self'");
  });

  it("is applied to the unauthenticated sign-in page", () => {
    vi.stubEnv("CDI_DATA_MODE", "live");

    const response = middleware(request("/sign-in"));

    expect(isPassThrough(response)).toBe(true);
    expect(policyFor(response)).toContain("default-src 'self'");
  });

  it("forbids framing, plugins, and base-tag hijacking", () => {
    vi.stubEnv("CDI_DATA_MODE", "demo");
    const policy = policyFor(middleware(request("/")));

    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("base-uri 'self'");
    expect(policy).toContain("form-action 'self'");
  });

  it("never allows inline or eval script in production", () => {
    // The whole point of the nonce. If these ever appear in a production
    // policy, the CSP is decorative.
    vi.stubEnv("CDI_DATA_MODE", "live");
    vi.stubEnv("NODE_ENV", "production");

    const scriptSrc = policyFor(middleware(request("/", validSession)))
      .split(";")
      .map((directive) => directive.trim())
      .find((directive) => directive.startsWith("script-src"));

    expect(scriptSrc).toBeDefined();
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
    expect(scriptSrc).toContain("'strict-dynamic'");
  });

  it("issues a fresh nonce for every request", () => {
    // A reused nonce is no better than 'unsafe-inline'.
    vi.stubEnv("CDI_DATA_MODE", "demo");

    const nonces = Array.from({ length: 5 }, () => {
      const match = /'nonce-([^']+)'/.exec(policyFor(middleware(request("/"))));
      return match?.[1];
    });

    expect(nonces.every(Boolean)).toBe(true);
    expect(new Set(nonces).size).toBe(5);
  });

  it("forwards the nonce to the app so Next can stamp its own scripts", () => {
    vi.stubEnv("CDI_DATA_MODE", "demo");

    const response = middleware(request("/"));
    const forwarded = response.headers.get("x-middleware-request-x-nonce");
    const policyNonce = /'nonce-([^']+)'/.exec(policyFor(response))?.[1];

    expect(forwarded).toBeTruthy();
    expect(forwarded).toBe(policyNonce);
  });
});
