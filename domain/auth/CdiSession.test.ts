import { describe, expect, it } from "vitest";
import { CdiRoleSchema, CdiSessionSchema } from "./CdiSession";

/**
 * The session contract is what every role check downstream trusts. These assert
 * the shape refuses the states that would quietly widen access — an empty role
 * array, an unknown role, a session with no organisation scope.
 */

const validSession = {
  subject: "operator-1",
  displayName: "Erin Example",
  orgId: "org-1",
  roles: ["APPROVER"],
  accessToken: "token-abc",
  mode: "LIVE",
};

describe("CdiRoleSchema", () => {
  it("accepts exactly the four defined roles", () => {
    for (const role of ["VIEWER", "OPERATOR", "APPROVER", "ADMIN"]) {
      expect(CdiRoleSchema.parse(role)).toBe(role);
    }
  });

  it("rejects an unknown role rather than passing it through", () => {
    // A role that survives parsing unrecognised is a role no check will match
    // and no check will refuse.
    expect(() => CdiRoleSchema.parse("SUPERUSER")).toThrow();
  });

  it("is case-sensitive", () => {
    // CdiSessionResolver upper-cases claims before parsing; this asserts the
    // schema is not quietly doing it as well and masking a resolver change.
    expect(() => CdiRoleSchema.parse("admin")).toThrow();
  });
});

describe("CdiSessionSchema", () => {
  it("accepts a complete live session", () => {
    expect(() => CdiSessionSchema.parse(validSession)).not.toThrow();
  });

  it("accepts a demo session carrying no access token", () => {
    // Demo mode is credential-free by design, so a null token is valid — but
    // only null, never an empty string.
    expect(() =>
      CdiSessionSchema.parse({
        ...validSession,
        accessToken: null,
        mode: "DEMO",
      }),
    ).not.toThrow();
  });

  it("rejects an empty role array", () => {
    // An empty array is the dangerous case: every `roles.includes(...)` check
    // returns false, which reads as "denied" but means "unauthenticated state
    // reached a code path that assumed otherwise".
    expect(() =>
      CdiSessionSchema.parse({ ...validSession, roles: [] }),
    ).toThrow();
  });

  it("rejects an empty access token, which is not the same as absent", () => {
    expect(() =>
      CdiSessionSchema.parse({ ...validSession, accessToken: "" }),
    ).toThrow();
  });

  it("rejects a session with no organisation scope", () => {
    // orgId is what keeps one tenant's evidence out of another's view.
    expect(() =>
      CdiSessionSchema.parse({ ...validSession, orgId: "" }),
    ).toThrow();
  });

  it("rejects an unknown mode", () => {
    expect(() =>
      CdiSessionSchema.parse({ ...validSession, mode: "STAGING" }),
    ).toThrow();
  });

  it("rejects a session missing the subject", () => {
    const withoutSubject = { ...validSession };
    delete (withoutSubject as Partial<typeof validSession>).subject;
    expect(() => CdiSessionSchema.parse(withoutSubject)).toThrow();
  });
});
