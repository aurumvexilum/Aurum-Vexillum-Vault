import { Token } from "../lib/wax";
import { ALCOR_MARKET_API } from "../application/trading-service";

type AlcorAsset = { contract: string; symbol: { name: string; precision: number }; str?: string };
export type AlcorMarket = { id: number; base_token: AlcorAsset; quote_token: AlcorAsset; last_price: number };

function matches(asset: AlcorAsset, token: Token) { return asset.contract === token.contract && asset.symbol.name === token.symbol; }

export async function fetchAlcorMarkets(): Promise<AlcorMarket[]> {
  const response = await fetch(ALCOR_MARKET_API);
  if (!response.ok) throw new Error("Alcor market data is unavailable.");
  const data = await response.json();
  const markets = Array.isArray(data) ? data : data.markets ?? data.data;
  if (!Array.isArray(markets)) throw new Error("Alcor returned an invalid market response.");
  return markets;
}

export async function findAlcorMarket(from: Token, to: Token) {
  const markets = await fetchAlcorMarkets();
  const market = markets.find((item) => (matches(item.base_token, from) && matches(item.quote_token, to)) || (matches(item.base_token, to) && matches(item.quote_token, from)));
  if (!market || !Number.isFinite(Number(market.last_price)) || Number(market.last_price) <= 0) throw new Error("No usable Alcor market exists for this token pair.");
  return market;
}

export function calculateAlcorOutput(market: AlcorMarket, from: Token, to: Token, swapInputAmount: string) {
  const price = Number(market.last_price);
  const direct = matches(market.base_token, from) && matches(market.quote_token, to);
  const output = direct ? Number(swapInputAmount) * price : Number(swapInputAmount) / price;
  if (!Number.isFinite(output) || output <= 0) throw new Error("Alcor returned an invalid quote.");
  return output.toFixed(to.precision);
}
