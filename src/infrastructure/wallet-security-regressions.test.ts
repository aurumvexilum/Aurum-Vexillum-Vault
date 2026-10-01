import { describe, expect, it } from "vitest";
import { validateOrigin } from "./origin-validator";
import { createTransactionSnapshot, verifyTransactionIntegrity } from "./transaction-mutation-detector";
import { getTrustedContract } from "./trusted-contracts";

describe("wallet security regressions", () => {
  it("rejects untrusted contract names", () => {
    expect(() => getTrustedContract("malicious.contract", "WAX", "transfer")).toThrow(/trusted registry/i);
  });

  it("rejects unknown symbol on a trusted contract", () => {
    expect(() => getTrustedContract("eosio.token", "FAKE", "transfer")).toThrow(/not approved/i);
  });

  it("rejects unknown action on a trusted contract", () => {
    expect(() => getTrustedContract("eosio.token", "WAX", "approve")).toThrow(/not approved/i);
  });

  it("rejects malicious phishing origins with no exception", () => {
    const result = validateOrigin("https://wax-wallet-fake.com");
    expect(result.isValid).toBe(false);
    expect(result.blockReason).toContain("malicious");
  });

  it("rejects punycode spoofing before signing", () => {
    const result = validateOrigin("https://xn--w4x-5fa.example.com");
    expect(result.warnings.some((warning) => warning.includes("PUNYCODE"))).toBe(true);
  });

  it("rejects a mutated payload even when the same account is used", async () => {
    const payload = { account: "alice.wam", recipient: "bob.wam", quantity: "1.00000000 WAX" };
    const { hash } = await createTransactionSnapshot(payload, "https://wax.bloks.io", "alice.wam", "mainnet");
    const mutatedPayload = { ...payload, recipient: "mallory.wam" };

    const result = await verifyTransactionIntegrity(
      mutatedPayload,
      hash,
      "https://wax.bloks.io",
      "alice.wam",
      "mainnet",
    );

    expect(result.isValid).toBe(false);
    expect(result.error).toContain("changed since approval");
  });

  it("requires re-approval when the network changes", async () => {
    const payload = { account: "alice.wam", recipient: "bob.wam", quantity: "1.00000000 WAX" };
    const { hash } = await createTransactionSnapshot(payload, "https://wax.bloks.io", "alice.wam", "mainnet");

    const result = await verifyTransactionIntegrity(payload, hash, "https://wax.bloks.io", "alice.wam", "testnet");
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Network changed");
  });
});
