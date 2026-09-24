import { Token } from "../lib/wax";

export const TRADING_FEE_BPS = 1; // 0.01% = 1 basis point
export const FEE_RECIPIENT = import.meta.env.VITE_WAX_FEE_RECIPIENT ?? "";

export type TradeQuote = {
  from: Token;
  to: Token;
  inputAmount: string;
  feeAmount: string;
  outputAmount: string;
  feeRecipient: string;
  expiresAt: string;
  route: string;
};

function decimal(value: string, precision: number) {
  if (!/^\d+(\.\d+)?$/.test(value) || Number(value) <= 0) throw new Error("Enter a positive trade amount.");
  return Number(value).toFixed(precision);
}

export function calculateTradingFee(amount: string, precision: number) {
  return (Number(decimal(amount, precision)) * TRADING_FEE_BPS / 10_000).toFixed(precision);
}

/**
 * Builds a quote only. A production adapter must provide a vetted DEX route and
 * atomic transaction actions; never substitute an arbitrary contract here.
 */
export function buildTradeQuote(from: Token, to: Token, amount: string, outputAmount: string, route = "configured DEX") : TradeQuote {
  if (!FEE_RECIPIENT || !/^[a-z1-5.]{1,12}$/.test(FEE_RECIPIENT)) {
    throw new Error("Trading is disabled until VITE_WAX_FEE_RECIPIENT is configured with the verified WAX account name.");
  }
  return { from, to, inputAmount: decimal(amount, from.precision), feeAmount: calculateTradingFee(amount, from.precision), outputAmount, feeRecipient: FEE_RECIPIENT, expiresAt: new Date(Date.now() + 30_000).toISOString(), route };
}
