import { Token } from "../lib/wax";

export const TRADING_FEE_BPS = 1;
export const FEE_RECIPIENT = import.meta.env.VITE_WAX_FEE_RECIPIENT ?? "";
export const DEFAULT_SLIPPAGE_BPS = 50;
export const MAX_SLIPPAGE_BPS = 1_000;
export type TradeQuote={from:Token;to:Token;inputAmount:string;feeAmount:string;outputAmount:string;minimumOutputAmount:string;slippageBps:number;feeRecipient:string;expiresAt:string;route:string};
function decimal(value:string,precision:number){if(!/^\d+(\.\d+)?$/.test(value)||Number(value)<=0)throw new Error("Enter a positive trade amount.");return Number(value).toFixed(precision)}
export function calculateTradingFee(amount:string,precision:number){return(Number(decimal(amount,precision))*TRADING_FEE_BPS/10_000).toFixed(precision)}
export function calculateMinimumOutput(outputAmount:string,slippageBps:number,precision:number){if(!/^\d+(\.\d+)?$/.test(outputAmount)||Number(outputAmount)<=0)throw new Error("Enter a positive quoted output.");if(!Number.isInteger(slippageBps)||slippageBps<0||slippageBps>MAX_SLIPPAGE_BPS)throw new Error(`Slippage must be between 0 and ${MAX_SLIPPAGE_BPS/100}%.`);return(Number(outputAmount)*(10_000-slippageBps)/10_000).toFixed(precision)}
export function buildTradeQuote(from:Token,to:Token,amount:string,outputAmount:string,slippageBps=DEFAULT_SLIPPAGE_BPS,route="configured DEX"):TradeQuote{if(!FEE_RECIPIENT||!/^[a-z1-5.]{1,12}$/.test(FEE_RECIPIENT))throw new Error("Trading is disabled until VITE_WAX_FEE_RECIPIENT is configured with a verified WAX account.");return{from,to,inputAmount:decimal(amount,from.precision),feeAmount:calculateTradingFee(amount,from.precision),outputAmount:decimal(outputAmount,to.precision),minimumOutputAmount:calculateMinimumOutput(outputAmount,slippageBps,to.precision),slippageBps,feeRecipient:FEE_RECIPIENT,expiresAt:new Date(Date.now()+30_000).toISOString(),route}}
