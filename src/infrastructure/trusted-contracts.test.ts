import { describe, expect, it } from "vitest";
import { getTrustedContract } from "./trusted-contracts";
describe("trusted contract controls", () => { it("allows the verified WAX transfer contract", () => { expect(getTrustedContract("eosio.token", "WAX").contract).toBe("eosio.token"); }); it("rejects arbitrary contracts", () => { expect(() => getTrustedContract("evil.contract", "WAX")).toThrow(/Blocked untrusted/); }); });
