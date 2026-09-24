import { JsonRpc } from "eosjs";
import { WAX_EXPLORER_RPC } from "./wax-explorer-service";

export type ResourceLimit = { used: number; available: number; max: number };
export type WaxResourceAccount = {
  account_name: string;
  ram_quota: number;
  ram_usage: number;
  cpu_limit?: ResourceLimit;
  net_limit?: ResourceLimit;
  total_resources?: { owner: string; net_weight: string; cpu_weight: string; ram_bytes: number };
  self_delegated_bandwidth?: { from: string; to: string; net_weight: string; cpu_weight: string };
};
export type RamMarket = { base: { balance: string }; quote: { balance: string } };

function rpc() { return new JsonRpc(localStorage.getItem("wax-rpc") || WAX_EXPLORER_RPC); }
function assertAccount(value: string) { if (!/^[a-z1-5.]{1,12}$/.test(value)) throw new Error("Enter a valid WAX account name."); }
export function parseWax(value: string, label = "WAX amount") { if (!/^\d+(\.\d{1,8})?$/.test(value.trim()) || Number(value) <= 0) throw new Error(`${label} must be greater than zero with at most 8 decimals.`); return Number(value); }
export function normalizeWax(value: string, label = "WAX amount") { return `${parseWax(value, label).toFixed(8)} WAX`; }

export async function getWaxResourceAccount(account: string): Promise<WaxResourceAccount> { assertAccount(account); return rpc().get_account(account); }
export async function getWaxRamMarket(): Promise<RamMarket> {
  const result = await rpc().get_table_rows({ json: true, code: "eosio", scope: "eosio", table: "rammarket", limit: 1 });
  if (!result.rows?.[0]) throw new Error("The WAX RAM market is unavailable.");
  return result.rows[0];
}
export function estimateRamBytes(market: RamMarket, wax: string) {
  const waxAmount = parseWax(wax);
  const baseBytes = Number(String(market.base.balance).split(" ")[0]);
  const quoteWax = Number(String(market.quote.balance).split(" ")[0]);
  if (!baseBytes || !quoteWax) throw new Error("Invalid RAM market data.");
  return Math.max(0, Math.floor((waxAmount * baseBytes) / quoteWax));
}
export function buildDelegateBandwidthAction(from: string, receiver: string, cpuWax: string, netWax: string, transfer = false) {
  assertAccount(from); assertAccount(receiver); parseWax(cpuWax, "CPU WAX"); parseWax(netWax, "NET WAX");
  if (Number(cpuWax) <= 0 && Number(netWax) <= 0) throw new Error("CPU or NET must be greater than zero.");
  return { account: "eosio", name: "delegatebw", authorization: [{ actor: from, permission: "active" }], data: { from, receiver, stake_net_quantity: normalizeWax(netWax, "NET WAX"), stake_cpu_quantity: normalizeWax(cpuWax, "CPU WAX"), transfer } };
}
export function buildBuyRamAction(payer: string, receiver: string, wax: string) {
  assertAccount(payer); assertAccount(receiver); return { account: "eosio", name: "buyram", authorization: [{ actor: payer, permission: "active" }], data: { payer, receiver, quant: normalizeWax(wax) } };
}
