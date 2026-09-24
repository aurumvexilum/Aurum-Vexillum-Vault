import { Token } from "../lib/wax";

export type Price = { symbol: string; usd: number; source: string; updatedAt: string };
const WAX_PRICE_URL = "https://api.coingecko.com/api/v3/simple/price?ids=wax&vs_currencies=usd";

export async function fetchTokenPrices(tokens: Token[]): Promise<Price[]> {
  let waxUsd = 0;
  try {
    const response = await fetch(WAX_PRICE_URL);
    if (response.ok) waxUsd = Number((await response.json()).wax?.usd ?? 0);
  } catch { /* retain zero for unavailable/unverified prices */ }
  return tokens.map((token) => ({ symbol: token.symbol, usd: token.symbol === "WAX" ? waxUsd : 0, source: token.symbol === "WAX" ? "CoinGecko" : "unavailable", updatedAt: new Date().toISOString() }));
}

export function portfolioUsd(balances: Array<{ balance: string; symbol: string }>, prices: Price[]) {
  return balances.reduce((total, balance) => {
    const amount = Number(balance.balance.split(" ")[0] ?? 0);
    const price = prices.find((item) => item.symbol === balance.symbol)?.usd ?? 0;
    return total + amount * price;
  }, 0);
}
