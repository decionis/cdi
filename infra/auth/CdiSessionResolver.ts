import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import type { CdiSession } from "@/domain/auth/CdiSession";
import { CdiRuntimeConfig } from "@/infra/config/CdiRuntimeConfig";
import { CdiUnauthorizedError } from "@/infra/errors/CdiErrors";

export class CdiSessionResolver {
  constructor(private readonly config: CdiRuntimeConfig) {}

  async resolveServerSession(): Promise<CdiSession> {
    if (this.config.dataMode === "demo") return this.createDemoSession();

    const cookieStore = await cookies();
    return this.createLiveSession(
      cookieStore.get(this.config.accessTokenCookie)?.value,
      cookieStore.get(this.config.orgIdCookie)?.value,
      cookieStore.get("decionis_display_name")?.value,
      cookieStore.get("decionis_roles")?.value,
    );
  }

  resolveRequestSession(request: NextRequest): CdiSession {
    if (this.config.dataMode === "demo") return this.createDemoSession();

    const authorization = request.headers.get("authorization");
    const bearerToken = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : undefined;

    return this.createLiveSession(
      bearerToken ?? request.cookies.get(this.config.accessTokenCookie)?.value,
      request.headers.get("x-decionis-org-id") ??
        request.cookies.get(this.config.orgIdCookie)?.value,
      request.cookies.get("decionis_display_name")?.value,
      request.cookies.get("decionis_roles")?.value,
    );
  }

  private createDemoSession(): CdiSession {
    return {
      subject: "demo-operator",
      displayName: "Amina Okafor",
      orgId: "demo-fintech",
      roles: ["ADMIN", "APPROVER"],
      accessToken: null,
      mode: "DEMO",
    };
  }

  private createLiveSession(
    accessToken?: string,
    orgId?: string,
    displayName?: string,
    rolesValue?: string,
  ): CdiSession {
    const effectiveToken = accessToken ?? this.config.serviceToken;
    if (!effectiveToken || !orgId) throw new CdiUnauthorizedError();

    const roles = (rolesValue ?? "VIEWER")
      .split(",")
      .map((role) => role.trim())
      .filter((role): role is CdiSession["roles"][number] =>
        ["VIEWER", "OPERATOR", "APPROVER", "ADMIN"].includes(role),
      );

    return {
      subject: "decionis-user",
      displayName: displayName
        ? decodeURIComponent(displayName)
        : "Decionis operator",
      orgId,
      roles: roles.length > 0 ? roles : ["VIEWER"],
      accessToken: effectiveToken,
      mode: "LIVE",
    };
  }
}
