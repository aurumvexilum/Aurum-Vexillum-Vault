import { TOKEN_LIST_URL, Token, VERIFIED_TOKENS } from "../lib/wax";

export type WaxToken = Token & { verified: boolean; source: "wax-token-list" | "verified-default" };

function normalizeToken(input: unknown): WaxToken | null {
  if (!input || typeof input !== "object") return null;
  const item = input as Record<string, unknown>;
  const symbolValue = item.symbol ?? item.code ?? item.token_symbol;
  const contractValue = item.contract ?? item.account ?? item.contract_account;
  const precisionValue = item.precision ?? item.decimals ?? item.token_precision;
  const symbol = typeof symbolValue === "object" && symbolValue !== null
    ? String((symbolValue as Record<string, unknown>).name ?? "")
    : String(symbolValue ?? "");
  const contract = String(contractValue ?? "");
  const precision = Number(precisionValue);
  if (!/^[A-Z0-9]{1,7}$/.test(symbol) || !/^[a-z1-5.]{1,12}$/.test(contract) || !Number.isInteger(precision) || precision < 0 || precision > 18) return null;
  const known = VERIFIED_TOKENS.find((token) => token.contract === contract && token.symbol === symbol);
  return {
    symbol,
    contract,
    precision,
    name: String(item.name ?? item.token_name ?? known?.name ?? symbol),
    icon: known?.icon,
    logo: typeof item.logo === "string" ? item.logo : typeof item.logo_url === "string" ? item.logo_url : undefined,
    verified: Boolean(known),
    source: known ? "verified-default" : "wax-token-list",
  };
}

export async function loadAllWaxTokens(signal?: AbortSignal): Promise<WaxToken[]> {
  const response = await fetch(TOKEN_LIST_URL, { signal });
  if (!response.ok) throw new Error(`WAX token list request failed (${response.status}).`);
  const payload = await response.json();
  const entries = Array.isArray(payload) ? payload : Array.isArray(payload.tokens) ? payload.tokens : Array.isArray(payload.data) ? payload.data : [];
  const tokens = new Map<string, WaxToken>();
  VERIFIED_TOKENS.forEach((token) => tokens.set(`${token.contract}:${token.symbol}`, { ...token, verified: true, source: "verified-default" }));
  entries.map(normalizeToken).filter((token): token is WaxToken => Boolean(token)).forEach((token) => tokens.set(`${token.contract}:${token.symbol}`, token));
  return [...tokens.values()].sort((a, b) => a.symbol.localeCompare(b.symbol) || a.contract.localeCompare(b.contract));
}

export async function loadAllWaxTokensSafely(signal?: AbortSignal): Promise<WaxToken[]> {
  try { return await loadAllWaxTokens(signal); } catch { return VERIFIED_TOKENS.map((token) => ({ ...token, verified: true, source: "verified-default" as const })); }
}
