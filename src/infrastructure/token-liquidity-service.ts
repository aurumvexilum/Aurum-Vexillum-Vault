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

type AlcorAsset = { contract: string; symbol: { name: string; precision: number }; str?: string };
type AlcorMarket = { id: number; base_token: AlcorAsset; quote_token: AlcorAsset; last_price: number; base_volume?: number; quote_volume?: number; liquidity?: number; tvl?: number };

export async function fetchAlcorMarkets(): Promise<AlcorMarket[]> {
  const response = await fetch(ALCOR_MARKET_API);
  if (!response.ok) throw new Error("Alcor market data is unavailable.");
  const data = await response.json();
  const markets = Array.isArray(data) ? data : data.markets ?? data.data;
  if (!Array.isArray(markets)) throw new Error("Alcor returned an invalid market response.");
  return markets;
}

const assetName = (asset: AlcorAsset) => `${asset.symbol.name}@${asset.contract}`;
const matches = (asset: AlcorAsset, token: Token) => asset.contract === token.contract && asset.symbol.name === token.symbol;

export async function fetchTokenAlcorPools(token: Token): Promise<PoolLiquidity[]> {
  const markets = await fetchAlcorMarkets();
  return markets
    .filter((market) => matches(market.base_token, token) || matches(market.quote_token, token))
    .map((market) => ({
      id: String(market.id), exchange: "Alcor" as const, pair: `${assetName(market.base_token)} / ${assetName(market.quote_token)}`,
      tokenA: assetName(market.base_token), tokenB: assetName(market.quote_token), liquidity: market.liquidity == null ? undefined : String(market.liquidity),
      price: Number(market.last_price), raw: market, url: `https://alcor.exchange/trade/${market.id}`,
    }));
}

export const TACSWAP_CONTRACT = "tacodexswap";

function stringifyAsset(value: unknown) { return typeof value === "string" ? value : value && typeof value === "object" && "quantity" in value ? String((value as { quantity: unknown }).quantity) : undefined; }
function field(row: Record<string, unknown>, names: string[]) { for (const name of names) if (row[name] != null) return row[name]; return undefined; }

export async function fetchTokenTacSwapPools(token: Token): Promise<PoolLiquidity[]> {
  const rpc = new JsonRpc(localStorage.getItem("wax-rpc") || WAX_EXPLORER_RPC);
  const result = await rpc.get_table_rows({ json: true, code: TACSWAP_CONTRACT, scope: TACSWAP_CONTRACT, table: "pools", limit: 500 });
  return (result.rows ?? []).flatMap((raw: unknown, index: number) => {
    const row = raw as Record<string, unknown>;
    const a = stringifyAsset(field(row, ["token0", "token_a", "asset0", "reserve0"]));
    const b = stringifyAsset(field(row, ["token1", "token_b", "asset1", "reserve1"]));
    const text = JSON.stringify(row).toLowerCase();
    if (!text.includes(token.symbol.toLowerCase()) && !text.includes(token.contract.toLowerCase())) return [];
    return [{ id: String(field(row, ["id", "pool_id"]) ?? index), exchange: "TacSwap" as const, pair: [a, b].filter(Boolean).join(" / ") || `Pool ${index}`, tokenA: a || "—", tokenB: b || "—", reserveA: a, reserveB: b, fee: stringifyAsset(field(row, ["fee", "fee_rate"])), raw, url: `https://tacswap.io/pool/${field(row, ["id", "pool_id"]) ?? index}` }];
  });
}

export async function fetchTokenPools(token: Token) {
  const results = await Promise.allSettled([fetchTokenAlcorPools(token), fetchTokenTacSwapPools(token)]);
  return results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
}

export function calculateAlcorOutput(market: AlcorMarket, from: Token, to: Token, amount: string) {
  const price = Number(market.last_price);
  const direct = matches(market.base_token, from) && matches(market.quote_token, to);
  const output = direct ? Number(amount) * price : Number(amount) / price;
  if (!Number.isFinite(output) || output <= 0) throw new Error("Alcor returned an invalid quote.");
  return output.toFixed(to.precision);
}
