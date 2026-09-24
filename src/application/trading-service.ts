import { Token } from "../lib/wax";

export const TRADING_FEE_BPS = 1; // 0.01%
export const FEE_RECIPIENT = "aurumvexilum";
export const ALCOR_MARKET_API = "https://wax.alcor.exchange/api/markets";
export const DEFAULT_SLIPPAGE_BPS = 50;
export const MAX_SLIPPAGE_BPS = 1_000;

export type TradeQuote = {
  from: Token;
  to: Token;
  inputAmount: string;
  feeAmount: string;
  swapInputAmount: string;
  outputAmount: string;
  minimumOutputAmount: string;
  slippageBps: number;
  feeRecipient: string;
  expiresAt: string;
  route: string;
  marketId: number;
};

function decimal(value: string, precision: number) {
  if (!/^\d+(\.\d+)?$/.test(value) || Number(value) <= 0) throw new Error("Enter a positive amount.");
  return Number(value).toFixed(precision);
}

export function calculateTradingFee(amount: string, precision: number) {
  return (Number(decimal(amount, precision)) * TRADING_FEE_BPS / 10_000).toFixed(precision);
}

export function calculateMinimumOutput(outputAmount: string, slippageBps: number, precision: number) {
  if (!Number.isInteger(slippageBps) || slippageBps < 0 || slippageBps > MAX_SLIPPAGE_BPS) throw new Error("Slippage is outside the allowed range.");
  return (Number(decimal(outputAmount, precision)) * (10_000 - slippageBps) / 10_000).toFixed(precision);
}

export function buildTradeQuote(from: Token, to: Token, amount: string, outputAmount: string, marketId: number, slippageBps = DEFAULT_SLIPPAGE_BPS): TradeQuote {
  const inputAmount = decimal(amount, from.precision);
  const output = decimal(outputAmount, to.precision);
  const feeAmount = calculateTradingFee(inputAmount, from.precision);
  const swapInputAmount = (Number(inputAmount) - Number(feeAmount)).toFixed(from.precision);
  if (Number(swapInputAmount) <= 0) throw new Error("Amount is too small after the trading fee.");
  return { from, to, inputAmount, feeAmount, swapInputAmount, outputAmount: output, minimumOutputAmount: calculateMinimumOutput(output, slippageBps, to.precision), slippageBps, feeRecipient: FEE_RECIPIENT, expiresAt: new Date(Date.now() + 30_000).toISOString(), route: "Alcor market", marketId };
}
