import { JsonRpc } from "eosjs";
import { Token } from "../lib/wax";
import { ALCOR_MARKET_API } from "../application/trading-service";
import { WAX_EXPLORER_RPC } from "./wax-explorer-service";

export type PoolLiquidity = {
  id: string;
  exchange: "Alcor" | "TacSwap";
  pair: string;
  tokenA: string;
  tokenB: string;
  reserveA?: string;
  reserveB?: string;
  liquidity?: string;
  liquidityValue?: number;
  fee?: string;
  price?: number;
  url?: string;
  raw: unknown;
};

export type PoolSourceStatus = { alcor: "ok" | "unavailable"; tacswap: "ok" | "unavailable" };
export type TokenPoolResult = { pools: PoolLiquidity[]; sources: PoolSourceStatus };

type AlcorAsset = { contract: string; symbol: { name: string; precision: number }; str?: string };
type AlcorMarket = { id: number; base_token: AlcorAsset; quote_token: AlcorAsset; last_price: number; liquidity?: number; tvl?: number };

export const TACSWAP_CONTRACT = "tacodexswap";
const CACHE_TTL = 90_000;
const cache = new Map<string, { expires: number; value: TokenPoolResult }>();
const rpc = () => new JsonRpc(localStorage.getItem("wax-rpc") || WAX_EXPLORER_RPC);
const assetLabel = (asset: AlcorAsset) => `${asset.symbol.name}@${asset.contract}`;
const matches = (asset: AlcorAsset, token: Token) => asset.contract === token.contract && asset.symbol.name === token.symbol;

function asAsset(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "quantity" in value) return String((value as { quantity: unknown }).quantity);
  return undefined;
}
function numericAsset(value?: string) { const match = value?.match(/([0-9]+(?:\.[0-9]+)?)/); return match ? Number(match[1]) : undefined; }
function firstField(row: Record<string, unknown>, names: string[]) { const key = names.find((name) => row[name] != null); return key ? row[key] : undefined; }
function containsToken(row: Record<string, unknown>, token: Token) { const text = JSON.stringify(row).toLowerCase(); return text.includes(token.symbol.toLowerCase()) || text.includes(token.contract.toLowerCase()); }

export async function fetchAlcorMarkets(): Promise<AlcorMarket[]> {
  const response = await fetch(ALCOR_MARKET_API);
  if (!response.ok) throw new Error("Alcor market data is unavailable.");
  const data = await response.json();
  const markets = Array.isArray(data) ? data : data.markets ?? data.data;
  if (!Array.isArray(markets)) throw new Error("Alcor returned an invalid market response.");
  return markets;
}

export async function fetchTokenAlcorPools(token: Token): Promise<PoolLiquidity[]> {
  const markets = await fetchAlcorMarkets();
  return markets.filter((market) => matches(market.base_token, token) || matches(market.quote_token, token)).map((market) => {
    const value = market.liquidity ?? market.tvl;
    return { id: String(market.id), exchange: "Alcor", pair: `${assetLabel(market.base_token)} / ${assetLabel(market.quote_token)}`, tokenA: assetLabel(market.base_token), tokenB: assetLabel(market.quote_token), liquidity: value == null ? undefined : String(value), liquidityValue: value, price: Number(market.last_price), url: `https://alcor.exchange/trade/${market.id}`, raw: market };
  });
}

async function getTacSwapRows(table: string) { return rpc().get_table_rows({ json: true, code: TACSWAP_CONTRACT, scope: TACSWAP_CONTRACT, table, limit: 500 }); }

export async function fetchTokenTacSwapPools(token: Token): Promise<PoolLiquidity[]> {
  let result: { rows?: unknown[] };
  try { result = await getTacSwapRows("pools"); } catch { result = await getTacSwapRows("pairs"); }
  return (result.rows ?? []).flatMap((value, index) => {
    const row = value as Record<string, unknown>;
    if (!containsToken(row, token)) return [];
    const reserveA = asAsset(firstField(row, ["reserve0", "reserve_a", "token0", "token_a", "asset0"]));
    const reserveB = asAsset(firstField(row, ["reserve1", "reserve_b", "token1", "token_b", "asset1"]));
    const id = String(firstField(row, ["id", "pool_id", "pair_id"]) ?? index);
    const liquidity = asAsset(firstField(row, ["liquidity", "tvl", "total_liquidity"]));
    return [{ id, exchange: "TacSwap" as const, pair: [reserveA, reserveB].filter(Boolean).join(" / ") || `Pool ${id}`, tokenA: reserveA || "—", tokenB: reserveB || "—", reserveA, reserveB, liquidity, liquidityValue: numericAsset(liquidity), fee: asAsset(firstField(row, ["fee", "fee_rate"])), url: `https://tacswap.io/pool/${encodeURIComponent(id)}`, raw: row }];
  });
}

export function normalizePools(pools: PoolLiquidity[]) {
  const unique = new Map<string, PoolLiquidity>();
  pools.forEach((pool) => { const key = `${pool.exchange}:${pool.id}`; if (!unique.has(key) || (pool.liquidityValue ?? 0) > (unique.get(key)?.liquidityValue ?? 0)) unique.set(key, pool); });
  return [...unique.values()].sort((a, b) => (b.liquidityValue ?? 0) - (a.liquidityValue ?? 0));
}

export async function fetchTokenPools(token: Token, force = false): Promise<TokenPoolResult> {
  const key = `${token.contract}:${token.symbol}`;
  const cached = cache.get(key);
  if (!force && cached && cached.expires > Date.now()) return cached.value;
  const [alcor, tacswap] = await Promise.allSettled([fetchTokenAlcorPools(token), fetchTokenTacSwapPools(token)]);
  const value = { pools: normalizePools([...(alcor.status === "fulfilled" ? alcor.value : []), ...(tacswap.status === "fulfilled" ? tacswap.value : [])]), sources: { alcor: alcor.status === "fulfilled" ? "ok" : "unavailable", tacswap: tacswap.status === "fulfilled" ? "ok" : "unavailable" } as PoolSourceStatus };
  cache.set(key, { expires: Date.now() + CACHE_TTL, value });
  if (value.sources.alcor === "unavailable" && value.sources.tacswap === "unavailable") throw new Error("Both Alcor and TacSwap are unavailable.");
  return value;
}

export function calculateAlcorOutput(market: AlcorMarket, from: Token, to: Token, amount: string) { const price = Number(market.last_price); const direct = matches(market.base_token, from) && matches(market.quote_token, to); const output = direct ? Number(amount) * price : Number(amount) / price; if (!Number.isFinite(output) || output <= 0) throw new Error("Alcor returned an invalid quote."); return output.toFixed(to.precision); }
