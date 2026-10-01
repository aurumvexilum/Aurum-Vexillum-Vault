import { describe, expect, it } from "vitest";
import { validateOrigin } from "./origin-validator";

describe("origin validation security regressions", () => {
  it("rejects non-HTTPS origins", () => {
    const result = validateOrigin("http://malicious-site.com");
    expect(result.isValid).toBe(false);
    expect(result.blockReason).toContain("HTTPS");
  });

  it("rejects punycode-based domains", () => {
    const result = validateOrigin("https://xn--malicous-9ua.com");
    expect(result.isValid).toBe(false);
    expect(result.warnings.join(" ")).toContain("PUNYCODE");
  });

  it("rejects known phishing origins", () => {
    const result = validateOrigin("https://wax-wallet-fake.com");
    expect(result.isValid).toBe(false);
    expect(result.blockReason).toContain("known to be malicious");
  });

  it("warns on lookalike domains", () => {
    const result = validateOrigin("https://wxa-wallet.example.com");
    expect(result.warnings.some((w) => w.includes("LOOKALIKE_DOMAIN"))).toBe(true);
  });

  it("warns when the origin changed from the prior approved origin", () => {
    const result = validateOrigin("https://new-origin.example.com", "https://old-origin.example.com");
    expect(result.warnings.some((w) => w.includes("ORIGIN_CHANGED"))).toBe(true);
  });

  it("allows a trusted origin without warnings", () => {
    const result = validateOrigin("https://wax.bloks.io");
    expect(result.isValid).toBe(true);
    expect(result.blockReason).toBeUndefined();
  });
});
