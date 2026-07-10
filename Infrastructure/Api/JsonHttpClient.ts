import type { ZodType } from "zod";
import { CdiGatewayError } from "@/Infrastructure/Errors/CdiErrors";

export type FetchClient = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Response>;

export interface JsonHttpClientOptions {
  baseUrl: string;
  bearerToken: string;
  orgId: string;
  timeoutMs: number;
  fetchClient?: FetchClient;
}

export class JsonHttpClient {
  private readonly baseUrl: string;
  private readonly bearerToken: string;
  private readonly orgId: string;
  private readonly timeoutMs: number;
  private readonly fetchClient: FetchClient;

  constructor(options: JsonHttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.bearerToken = options.bearerToken;
    this.orgId = options.orgId;
    this.timeoutMs = options.timeoutMs;
    this.fetchClient = options.fetchClient ?? fetch;
  }

  async get<T>(path: string, schema: ZodType<T>): Promise<T> {
    return this.request(path, schema, { method: "GET" });
  }

  async post<T>(path: string, body: unknown, schema: ZodType<T>): Promise<T> {
    return this.request(path, schema, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  private async request<T>(
    path: string,
    schema: ZodType<T>,
    init: RequestInit,
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchClient(`${this.baseUrl}${path}`, {
        ...init,
        cache: "no-store",
        headers: {
          authorization: `Bearer ${this.bearerToken}`,
          "content-type": "application/json",
          "x-decionis-org-id": this.orgId,
        },
        signal: controller.signal,
      });
      const body = await this.parseBody(response);
      if (!response.ok) {
        throw new CdiGatewayError(
          this.readErrorMessage(body, response.statusText),
          response.status,
          body,
        );
      }
      return schema.parse(body);
    } finally {
      clearTimeout(timeout);
    }
  }

  private async parseBody(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return { message: text };
    }
  }

  private readErrorMessage(body: unknown, fallback: string): string {
    if (body && typeof body === "object" && "message" in body) {
      return String((body as { message: unknown }).message);
    }
    return fallback || "Decionis CDI request failed";
  }
}
