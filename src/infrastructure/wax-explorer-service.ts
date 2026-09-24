import { JsonRpc } from "eosjs";

export const WAX_EXPLORER_RPC = "https://wax.greymass.com";
export const WAX_EXPLORER_HISTORY = "https://wax.eosusa.io";

export type WaxNetworkSnapshot = { headBlock: number; lastIrreversibleBlock: number; chainId: string; serverVersion: string; headBlockTime: string };
export type WaxAccountSummary = { account_name: string; head_block_num: number; cpu_limit: unknown; net_limit: unknown; ram_quota: number; ram_usage: number; permissions: Array<{ perm_name: string; required_auth?: { threshold: number; keys?: Array<{ key: string; weight: number }> } }> };

export async function getWaxNetworkSnapshot(): Promise<WaxNetworkSnapshot> {
  const info = await new JsonRpc(WAX_EXPLORER_RPC).get_info();
  return { headBlock: info.head_block_num, lastIrreversibleBlock: info.last_irreversible_block_num, chainId: info.chain_id, serverVersion: info.server_version, headBlockTime: info.head_block_time };
}

export async function getWaxAccountSummary(account: string): Promise<WaxAccountSummary> {
  if (!/^[a-z1-5.]{1,12}$/.test(account)) throw new Error("Enter a valid WAX account name.");
  return new JsonRpc(WAX_EXPLORER_RPC).get_account(account);
}

export function waxBlockUrl(block: number) { return `https://waxblock.io/block/${encodeURIComponent(block)}`; }
export function waxTransactionUrl(id: string) { return `https://waxblock.io/transaction/${encodeURIComponent(id)}`; }
export function waxAccountUrl(account: string) { return `https://waxblock.io/account/${encodeURIComponent(account)}`; }
