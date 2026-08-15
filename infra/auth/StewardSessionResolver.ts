import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import type { StewardSession } from "@/domain/auth/StewardSession";
import { StewardRuntimeConfig } from "@/infra/config/StewardRuntimeConfig";
import { StewardUnauthorizedError } from "@/infra/errors/StewardErrors";

export class StewardSessionResolver {
  constructor(private readonly config: StewardRuntimeConfig) {}

  async resolveServerSession(): Promise<StewardSession> {
    if (this.config.dataMode === "demo") return this.createDemoSession();

    const cookieStore = await cookies();
    return this.createLiveSession(
      cookieStore.get(this.config.accessTokenCookie)?.value,
      cookieStore.get(this.config.orgIdCookie)?.value,
      cookieStore.get("decionis_display_name")?.value,
      cookieStore.get("decionis_roles")?.value,
    );
  }

  resolveRequestSession(request: NextRequest): StewardSession {
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

  private createDemoSession(): StewardSession {
    return {
      subject: "demo-operator",
      displayName: "Erin Example",
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
  ): StewardSession {
    const effectiveToken = accessToken ?? this.config.serviceToken;
    if (!effectiveToken || !orgId) throw new StewardUnauthorizedError();

    const roles = (rolesValue ?? "VIEWER")
      .split(",")
      .map((role) => role.trim())
      .filter((role): role is StewardSession["roles"][number] =>
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
