import { describe, expect, it } from "vitest";
import { CdiRuntimeConfig } from "./CdiRuntimeConfig";

describe("CdiRuntimeConfig", () => {
  it("defaults to demo outside production", () => {
    const config = CdiRuntimeConfig.fromEnvironment({
      NODE_ENV: "development",
    });

    expect(config.dataMode).toBe("demo");
    expect(config.apiBaseUrl).toBeNull();
  });

  it("requires the Decionis API in live mode", () => {
    expect(() =>
      CdiRuntimeConfig.fromEnvironment({
        NODE_ENV: "production",
        CDI_DATA_MODE: "live",
      }),
    ).toThrow("DECIONIS_API_BASE_URL");
  });

  it("normalizes a configured API base", () => {
    const config = CdiRuntimeConfig.fromEnvironment({
      NODE_ENV: "production",
      CDI_DATA_MODE: "live",
      DECIONIS_API_BASE_URL: "https://api.decionis.com/",
    });

    expect(config.apiBaseUrl).toBe("https://api.decionis.com");
  });
});
