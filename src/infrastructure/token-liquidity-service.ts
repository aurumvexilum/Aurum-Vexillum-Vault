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
  fee?: string;
  price?: number;
  url?: string;
  raw: unknown;
};

type AlcorAsset = {
  contract: string;
  symbol: { name: string; precision: number };
  str?: string;
};

type AlcorMarket = {
  id: number;
  base_token: AlcorAsset;
  quote_token: AlcorAsset;
  last_price: number;
  liquidity?: number;
  tvl?: number;
};

export const TACSWAP_CONTRACT = "tacodexswap";

const rpc = () => new JsonRpc(localStorage.getItem("wax-rpc") || WAX_EXPLORER_RPC);
const assetLabel = (asset: AlcorAsset) => `${asset.symbol.name}@${asset.contract}`;
const matches = (asset: AlcorAsset, token: Token) => asset.contract === token.contract && asset.symbol.name === token.symbol;

function asAsset(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "quantity" in value) {
    return String((value as { quantity: unknown }).quantity);
  }
  return undefined;
}

function firstField(row: Record<string, unknown>, names: string[]) {
  return names.find((name) => row[name] != null) ? row[names.find((name) => row[name] != null)!] : undefined;
}

function containsToken(row: Record<string, unknown>, token: Token) {
  const text = JSON.stringify(row).toLowerCase();
  return text.includes(token.symbol.toLowerCase()) || text.includes(token.contract.toLowerCase());
}

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
  return markets
    .filter((market) => matches(market.base_token, token) || matches(market.quote_token, token))
    .map((market) => ({
      id: String(market.id),
      exchange: "Alcor" as const,
      pair: `${assetLabel(market.base_token)} / ${assetLabel(market.quote_token)}`,
      tokenA: assetLabel(market.base_token),
      tokenB: assetLabel(market.quote_token),
      liquidity: market.liquidity ?? market.tvl != null ? String(market.liquidity ?? market.tvl) : undefined,
      price: Number(market.last_price),
      url: `https://alcor.exchange/trade/${market.id}`,
      raw: market,
    }));
}

async function getTacSwapRows(table: string) {
  return rpc().get_table_rows({
    json: true,
    code: TACSWAP_CONTRACT,
    scope: TACSWAP_CONTRACT,
    table,
    limit: 500,
  });
}

export async function fetchTokenTacSwapPools(token: Token): Promise<PoolLiquidity[]> {
  let result: { rows?: unknown[] };
  try {
    result = await getTacSwapRows("pools");
  } catch {
    result = await getTacSwapRows("pairs");
  }

  return (result.rows ?? []).flatMap((value, index) => {
    const row = value as Record<string, unknown>;
    if (!containsToken(row, token)) return [];

    const reserveA = asAsset(firstField(row, ["reserve0", "reserve_a", "token0", "token_a", "asset0"]));
    const reserveB = asAsset(firstField(row, ["reserve1", "reserve_b", "token1", "token_b", "asset1"]));
    const id = String(firstField(row, ["id", "pool_id", "pair_id"]) ?? index);

    return [{
      id,
      exchange: "TacSwap" as const,
      pair: [reserveA, reserveB].filter(Boolean).join(" / ") || `Pool ${id}`,
      tokenA: reserveA || "—",
      tokenB: reserveB || "—",
      reserveA,
      reserveB,
      liquidity: asAsset(firstField(row, ["liquidity", "tvl", "total_liquidity"])),
      fee: asAsset(firstField(row, ["fee", "fee_rate"])),
      url: `https://tacswap.io/pool/${encodeURIComponent(id)}`,
      raw: row,
    }];
  });
}

export async function fetchTokenPools(token: Token): Promise<PoolLiquidity[]> {
  const results = await Promise.allSettled([fetchTokenAlcorPools(token), fetchTokenTacSwapPools(token)]);
  return results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
}

export function calculateAlcorOutput(market: AlcorMarket, from: Token, to: Token, amount: string) {
  const price = Number(market.last_price);
  const direct = matches(market.base_token, from) && matches(market.quote_token, to);
  const output = direct ? Number(amount) * price : Number(amount) / price;
  if (!Number.isFinite(output) || output <= 0) throw new Error("Alcor returned an invalid quote.");
  return output.toFixed(to.precision);
}
