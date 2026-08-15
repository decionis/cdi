import { describe, expect, it, vi } from "vitest";
import { DecionisStewardGateway } from "./DecionisStewardGateway";
import type { JsonHttpClient } from "./JsonHttpClient";

/**
 * The upstream boundary.
 *
 * Two properties matter here and neither is visible from the type signature:
 * every request carries the caller's organisation scope, and every identifier
 * that reaches a URL is encoded. The first is what keeps one tenant's evidence
 * out of another's view; the second is what stops a crafted account id from
 * rewriting the path it lands in.
 */

function gatewayWith(orgId = "org-1") {
  const httpClient = {
    get: vi.fn().mockResolvedValue({ opportunities: [] }),
    post: vi.fn().mockResolvedValue({}),
  } as unknown as JsonHttpClient;

  return { httpClient, gateway: new DecionisStewardGateway(httpClient, orgId) };
}

describe("DecionisStewardGateway — organisation scoping", () => {
  it("scopes the portfolio request to the session organisation", async () => {
    const { httpClient, gateway } = gatewayWith();

    await gateway.getPortfolio();

    expect(httpClient.get).toHaveBeenCalledWith(
      expect.stringContaining("org_id=org-1"),
      expect.anything(),
    );
  });

  it("scopes an account request to the session organisation", async () => {
    const { httpClient, gateway } = gatewayWith();

    await gateway.getAccount("acct-kilo");

    expect(httpClient.get).toHaveBeenCalledWith(
      expect.stringContaining("org_id=org-1"),
      expect.anything(),
    );
  });

  it("scopes a review to the session organisation in the body", async () => {
    const { httpClient, gateway } = gatewayWith();

    await gateway.reviewOpportunity("opp-1", { decision: "APPROVE" });

    expect(httpClient.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ org_id: "org-1", decision: "APPROVE" }),
      expect.anything(),
    );
  });

  it("carries the organisation on every listing request", async () => {
    const { httpClient, gateway } = gatewayWith("org-other");

    await gateway.listOpportunities();

    expect(httpClient.get).toHaveBeenCalledWith(
      expect.stringContaining("org_id=org-other"),
      expect.anything(),
    );
  });
});

describe("DecionisStewardGateway — identifier encoding", () => {
  it("encodes an account identifier into the path", async () => {
    // An unencoded identifier could otherwise introduce a query separator or a
    // path segment and change which resource is addressed.
    const { httpClient, gateway } = gatewayWith();

    await gateway.getAccount("acct/../admin?x=1");

    const url = vi.mocked(httpClient.get).mock.calls[0]![0];
    expect(url).not.toContain("../");
    expect(url).toContain("acct%2F..%2Fadmin%3Fx%3D1");
  });

  it("encodes an opportunity identifier into the review path", async () => {
    const { httpClient, gateway } = gatewayWith();

    await gateway.reviewOpportunity("opp/../escalate", { decision: "HOLD" });

    const url = vi.mocked(httpClient.post).mock.calls[0]![0];
    expect(url).not.toContain("../");
    expect(url).toContain("opp%2F..%2Fescalate");
  });

  it("encodes an organisation identifier containing a separator", async () => {
    const { httpClient, gateway } = gatewayWith("org&admin=1");

    await gateway.getPortfolio();

    const url = vi.mocked(httpClient.get).mock.calls[0]![0];
    expect(url).toContain("org_id=org%26admin%3D1");
  });
});

describe("DecionisStewardGateway — response shaping", () => {
  it("unwraps the opportunity list rather than returning the envelope", async () => {
    const { httpClient, gateway } = gatewayWith();
    vi.mocked(httpClient.get).mockResolvedValue({
      opportunities: [{ id: "opp-1" }],
    });

    await expect(gateway.listOpportunities()).resolves.toEqual([
      { id: "opp-1" },
    ]);
  });
});
