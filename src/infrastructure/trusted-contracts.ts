import { Token, VERIFIED_TOKENS } from "../lib/wax";

export type TrustedContract = { contract: string; symbols: string[]; actions: string[]; label: string; auditStatus?: "audited" | "pending-audit" | "rejected" };

export const TRUSTED_CONTRACTS: TrustedContract[] = [
  { contract: "eosio.token", symbols: ["WAX"], actions: ["transfer"], label: "WAX token contract", auditStatus: "audited" },
  ...VERIFIED_TOKENS
    .filter((token) => token.contract !== "eosio.token")
    .map((token) => ({
      contract: token.contract,
      symbols: [token.symbol],
      actions: ["transfer"],
      label: `${token.symbol} token contract`,
      auditStatus: "pending-audit" as const,
    })),
];

export function getTrustedContract(contract: string, symbol: string, action = "transfer") {
  const normalizedContract = contract.trim().toLowerCase();
  const normalizedSymbol = symbol.trim().toUpperCase();
  const normalizedAction = action.trim().toLowerCase();

  const entry = TRUSTED_CONTRACTS.find(
    (item) =>
      item.contract === normalizedContract &&
      item.symbols.includes(normalizedSymbol) &&
      item.actions.includes(normalizedAction),
  );

  if (!entry) {
    const detail = TRUSTED_CONTRACTS.find((item) => item.contract === normalizedContract);
    if (!detail) {
      throw new Error(`BLOCKED: Contract "${normalizedContract}" is not in the trusted registry.`);
    }
    if (!detail.symbols.includes(normalizedSymbol)) {
      throw new Error(`BLOCKED: Symbol "${normalizedSymbol}" is not approved for contract "${normalizedContract}".`);
    }
    throw new Error(`BLOCKED: Action "${normalizedAction}" is not approved for contract "${normalizedContract}".`);
  }

  if (entry.auditStatus === "rejected") {
    throw new Error(`BLOCKED: Contract "${normalizedContract}" has been rejected for security review.`);
  }

  return entry;
}

export function assertTrustedAction(
  action: { account: string; name: string; data?: { quantity?: string } },
  expectedSymbol?: string,
) {
  const contract = String(action.account ?? "").trim().toLowerCase();
  const name = String(action.name ?? "").trim().toLowerCase();
  const symbol = (expectedSymbol ?? action.data?.quantity?.split(" ").pop() ?? "").trim().toUpperCase();

  if (!contract) throw new Error("BLOCKED: Missing contract account.");
  if (!name) throw new Error("BLOCKED: Missing action name.");
  if (!symbol) throw new Error("BLOCKED: Unknown token symbol for this action.");

  const entry = getTrustedContract(contract, symbol, name);
  if (entry.auditStatus === "pending-audit") {
    console.warn(`Security warning: ${entry.label} is pending audit and should not be treated as fully trusted.`);
  }

  return entry;
}

export function trustedToken(token: Token) {
  getTrustedContract(token.contract, token.symbol);
  return token;
}
