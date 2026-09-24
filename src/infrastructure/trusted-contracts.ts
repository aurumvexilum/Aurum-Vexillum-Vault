import { Token, VERIFIED_TOKENS } from "../lib/wax";

export type TrustedContract = { contract: string; symbols: string[]; actions: string[]; label: string };
export const TRUSTED_CONTRACTS: TrustedContract[] = [
  { contract: "eosio.token", symbols: ["WAX"], actions: ["transfer"], label: "WAX token contract" },
  ...VERIFIED_TOKENS.filter((token) => token.contract !== "eosio.token").map((token) => ({ contract: token.contract, symbols: [token.symbol], actions: ["transfer"], label: `${token.symbol} token contract` })),
  // Alcor swap actions must be added only after the exact production ABI and route have been audited.
];

export function getTrustedContract(contract: string, symbol: string, action = "transfer") { const entry = TRUSTED_CONTRACTS.find((item) => item.contract === contract && item.symbols.includes(symbol) && item.actions.includes(action)); if (!entry) throw new Error(`Blocked untrusted contract/action: ${contract}::${action} (${symbol}).`); return entry; }
export function assertTrustedAction(action: { account: string; name: string; data?: { quantity?: string } }, expectedSymbol?: string) { const symbol = expectedSymbol ?? action.data?.quantity?.split(" ").pop(); if (!symbol) throw new Error("Unable to determine the token symbol for this action."); return getTrustedContract(action.account, symbol, action.name); }
export function trustedToken(token: Token) { getTrustedContract(token.contract, token.symbol); return token; }
