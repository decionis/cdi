import { describe, expect, it } from "vitest";
import { CdiFormat } from "./CdiFormat";

describe("CdiFormat", () => {
  it("formats normalized confidence independently of percentage values", () => {
    expect(CdiFormat.confidence(0.93)).toBe("93%");
    expect(CdiFormat.percent(93)).toBe("93%");
  });

  it("formats compact monetary limits", () => {
    expect(CdiFormat.money(1_000_000, "USD")).toContain("$1M");
  });
});
