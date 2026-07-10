import { z } from "zod";

const RuntimeEnvironmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  CDI_DATA_MODE: z.enum(["demo", "live"]).optional(),
  DECIONIS_API_BASE_URL: z.string().url().optional(),
  DECIONIS_CDI_SERVICE_TOKEN: z.string().min(1).optional(),
  CDI_ACCESS_TOKEN_COOKIE: z.string().min(1).default("decionis_access_token"),
  CDI_ORG_ID_COOKIE: z.string().min(1).default("decionis_org_id"),
  NEXT_PUBLIC_DECIONIS_SIGN_IN_URL: z
    .string()
    .url()
    .default("https://decionis.com/sign-in"),
});

export type CdiDataMode = "demo" | "live";

export interface CdiRuntimeValues {
  dataMode: CdiDataMode;
  apiBaseUrl: string | null;
  serviceToken: string | null;
  accessTokenCookie: string;
  orgIdCookie: string;
  signInUrl: string;
  timeoutMs: number;
}

export class CdiRuntimeConfig {
  readonly dataMode: CdiDataMode;
  readonly apiBaseUrl: string | null;
  readonly serviceToken: string | null;
  readonly accessTokenCookie: string;
  readonly orgIdCookie: string;
  readonly signInUrl: string;
  readonly timeoutMs: number;

  constructor(values: CdiRuntimeValues) {
    this.dataMode = values.dataMode;
    this.apiBaseUrl = values.apiBaseUrl;
    this.serviceToken = values.serviceToken;
    this.accessTokenCookie = values.accessTokenCookie;
    this.orgIdCookie = values.orgIdCookie;
    this.signInUrl = values.signInUrl;
    this.timeoutMs = values.timeoutMs;
  }

  static fromEnvironment(
    environment: NodeJS.ProcessEnv = process.env,
  ): CdiRuntimeConfig {
    const parsed = RuntimeEnvironmentSchema.parse(environment);
    const dataMode =
      parsed.CDI_DATA_MODE ??
      (parsed.NODE_ENV === "production" ? "live" : "demo");

    if (dataMode === "live" && !parsed.DECIONIS_API_BASE_URL) {
      throw new Error(
        "DECIONIS_API_BASE_URL is required when CDI_DATA_MODE=live",
      );
    }

    return new CdiRuntimeConfig({
      dataMode,
      apiBaseUrl: parsed.DECIONIS_API_BASE_URL?.replace(/\/+$/, "") ?? null,
      serviceToken: parsed.DECIONIS_CDI_SERVICE_TOKEN ?? null,
      accessTokenCookie: parsed.CDI_ACCESS_TOKEN_COOKIE,
      orgIdCookie: parsed.CDI_ORG_ID_COOKIE,
      signInUrl: parsed.NEXT_PUBLIC_DECIONIS_SIGN_IN_URL,
      timeoutMs: 8_000,
    });
  }
}
