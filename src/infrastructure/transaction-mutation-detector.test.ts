import { describe, expect, it } from "vitest";
import { createTransactionSnapshot, verifyTransactionIntegrity } from "./transaction-mutation-detector";

describe("transaction mutation detection regressions", () => {
  it("accepts an unchanged payload", async () => {
    const payload = { account: "alice.wam", quantity: "1.00000000 WAX", recipient: "bob.wam" };
    const { hash } = await createTransactionSnapshot(payload, "https://wax.bloks.io", "alice.wam", "mainnet");

    const result = await verifyTransactionIntegrity(payload, hash, "https://wax.bloks.io", "alice.wam", "mainnet");
    expect(result.isValid).toBe(true);
  });

  it("rejects a mutated payload after preview", async () => {
    const payload = { account: "alice.wam", quantity: "1.00000000 WAX", recipient: "bob.wam" };
    const { hash } = await createTransactionSnapshot(payload, "https://wax.bloks.io", "alice.wam", "mainnet");

    const mutated = { ...payload, recipient: "mallory.wam" };
    const result = await verifyTransactionIntegrity(mutated, hash, "https://wax.bloks.io", "alice.wam", "mainnet");
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("changed since approval");
  });

  it("rejects origin changes after preview", async () => {
    const payload = { account: "alice.wam", quantity: "1.00000000 WAX", recipient: "bob.wam" };
    const { hash } = await createTransactionSnapshot(payload, "https://wax.bloks.io", "alice.wam", "mainnet");

    const result = await verifyTransactionIntegrity(payload, hash, "https://phish.example", "alice.wam", "mainnet");
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Origin changed");
  });

  it("rejects account changes after preview", async () => {
    const payload = { account: "alice.wam", quantity: "1.00000000 WAX", recipient: "bob.wam" };
    const { hash } = await createTransactionSnapshot(payload, "https://wax.bloks.io", "alice.wam", "mainnet");

    const result = await verifyTransactionIntegrity(payload, hash, "https://wax.bloks.io", "charlie.wam", "mainnet");
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Account changed");
  });

  it("rejects network changes after preview", async () => {
    const payload = { account: "alice.wam", quantity: "1.00000000 WAX", recipient: "bob.wam" };
    const { hash } = await createTransactionSnapshot(payload, "https://wax.bloks.io", "alice.wam", "mainnet");

    const result = await verifyTransactionIntegrity(payload, hash, "https://wax.bloks.io", "alice.wam", "testnet");
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Network changed");
  });
});
