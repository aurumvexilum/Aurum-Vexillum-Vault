import { JsonRpc } from "eosjs";
import { WAX_EXPLORER_RPC } from "./wax-explorer-service";

export type WaxResourceAccount = {
  account_name: string;
  ram_quota: number;
  ram_usage: number;
  cpu_limit?: { used: number; available: number; max: number };
  net_limit?: { used: number; available: number; max: number };
  total_resources?: {
    owner: string;
    net_weight: string;
    cpu_weight: string;
    ram_bytes: number;
  };
  self_delegated_bandwidth?: { from: string; to: string; net_weight: string; cpu_weight: string };
};

export async function getWaxResourceAccount(account: string): Promise<WaxResourceAccount> {
  if (!/^[a-z1-5.]{1,12}$/.test(account)) throw new Error("Enter a valid WAX account name.");
  return new JsonRpc(localStorage.getItem("wax-rpc") || WAX_EXPLORER_RPC).get_account(account);
}

export function buildDelegateBandwidthAction(from: string, receiver: string, cpuWax: string, netWax: string, transfer = false) {
  return {
    account: "eosio",
    name: "delegatebw",
    authorization: [{ actor: from, permission: "active" }],
    data: { from, receiver, stake_net_quantity: `${Number(netWax).toFixed(8)} WAX`, stake_cpu_quantity: `${Number(cpuWax).toFixed(8)} WAX`, transfer },
  };
}

export function buildBuyRamAction(payer: string, receiver: string, wax: string) {
  return {
    account: "eosio",
    name: "buyram",
    authorization: [{ actor: payer, permission: "active" }],
    data: { payer, receiver, quant: `${Number(wax).toFixed(8)} WAX` },
  };
}
