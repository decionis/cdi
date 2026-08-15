/**
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  CdiForbiddenError,
  CdiGatewayError,
  CdiNotFoundError,
  CdiUnauthorizedError,
} from "@/infra/errors/CdiErrors";
import { CdiApiErrorMapper } from "./CdiApiErrorMapper";

async function mapped(error: unknown) {
  const response = CdiApiErrorMapper.toResponse(error);
  return { status: response.status, body: await response.json() };
}

describe("CdiApiErrorMapper", () => {
  it("maps an unauthorized error to 401", async () => {
    const { status, body } = await mapped(new CdiUnauthorizedError());

    expect(status).toBe(401);
    expect(body.error).toBe("UNAUTHORIZED");
  });

  it("maps a forbidden error to 403", async () => {
    const { status, body } = await mapped(new CdiForbiddenError());

    expect(status).toBe(403);
    expect(body.error).toBe("FORBIDDEN");
  });

  it("maps a not-found error to 404", async () => {
    const { status, body } = await mapped(new CdiNotFoundError("Account"));

    expect(status).toBe(404);
    expect(body.error).toBe("NOT_FOUND");
    expect(body.message).toBe("Account was not found");
  });

  it("maps a validation error to 400 with its issues", async () => {
    const parsed = z.object({ decision: z.string() }).safeParse({});
    expect(parsed.success).toBe(false);

    const { status, body } = await mapped(parsed.error);

    expect(status).toBe(400);
    expect(body.error).toBe("INVALID_REQUEST");
    expect(body.issues).toHaveLength(1);
  });

  it("passes an upstream gateway status through", async () => {
    const { status, body } = await mapped(
      new CdiGatewayError("Upstream rejected the review", 409, {}),
    );

    expect(status).toBe(409);
    expect(body.error).toBe("DECIONIS_GATEWAY_ERROR");
  });

  it("clamps an out-of-range gateway status to 502", async () => {
    // A gateway reporting a non-HTTP status must not produce an invalid
    // response status; 502 is the honest answer for "upstream misbehaved".
    for (const upstreamStatus of [0, 199, 600, 1000]) {
      const { status } = await mapped(
        new CdiGatewayError("odd status", upstreamStatus, {}),
      );

      expect(status).toBe(502);
    }
  });

  it("maps an unrecognized error to 500 without leaking its message", async () => {
    const { status, body } = await mapped(
      new Error("connect ECONNREFUSED 10.0.0.4:5432"),
    );

    expect(status).toBe(500);
    expect(body.error).toBe("INTERNAL_ERROR");
    expect(body.message).toBe("CDI could not complete the request");
    expect(JSON.stringify(body)).not.toContain("ECONNREFUSED");
  });

  it("maps a non-Error throwable to 500", async () => {
    const { status, body } = await mapped("something threw a string");

    expect(status).toBe(500);
    expect(body.error).toBe("INTERNAL_ERROR");
  });
});
