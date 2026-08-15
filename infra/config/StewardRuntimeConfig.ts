import { z } from "zod";

const RuntimeEnvironmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  STEWARD_DATA_MODE: z.enum(["demo", "live"]).optional(),
  DECIONIS_API_BASE_URL: z.string().url().optional(),
  DECIONIS_STEWARD_SERVICE_TOKEN: z.string().min(1).optional(),
  STEWARD_ACCESS_TOKEN_COOKIE: z
    .string()
    .min(1)
    .default("decionis_access_token"),
  STEWARD_ORG_ID_COOKIE: z.string().min(1).default("decionis_org_id"),
  NEXT_PUBLIC_DECIONIS_SIGN_IN_URL: z
    .string()
    .url()
    .default("https://decionis.com/sign-in"),
});

export type StewardDataMode = "demo" | "live";

export interface StewardRuntimeValues {
  dataMode: StewardDataMode;
  apiBaseUrl: string | null;
  serviceToken: string | null;
  accessTokenCookie: string;
  orgIdCookie: string;
  signInUrl: string;
  timeoutMs: number;
}

export class StewardRuntimeConfig {
  readonly dataMode: StewardDataMode;
  readonly apiBaseUrl: string | null;
  readonly serviceToken: string | null;
  readonly accessTokenCookie: string;
  readonly orgIdCookie: string;
  readonly signInUrl: string;
  readonly timeoutMs: number;

  constructor(values: StewardRuntimeValues) {
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
  ): StewardRuntimeConfig {
    const parsed = RuntimeEnvironmentSchema.parse(environment);
    const dataMode =
      parsed.STEWARD_DATA_MODE ??
      (parsed.NODE_ENV === "production" ? "live" : "demo");

    if (dataMode === "live" && !parsed.DECIONIS_API_BASE_URL) {
      throw new Error(
        "DECIONIS_API_BASE_URL is required when STEWARD_DATA_MODE=live",
      );
    }

    return new StewardRuntimeConfig({
      dataMode,
      apiBaseUrl: parsed.DECIONIS_API_BASE_URL?.replace(/\/+$/, "") ?? null,
      serviceToken: parsed.DECIONIS_STEWARD_SERVICE_TOKEN ?? null,
      accessTokenCookie: parsed.STEWARD_ACCESS_TOKEN_COOKIE,
      orgIdCookie: parsed.STEWARD_ORG_ID_COOKIE,
      signInUrl: parsed.NEXT_PUBLIC_DECIONIS_SIGN_IN_URL,
      timeoutMs: 8_000,
    });
  }
}
