import { Api, JsonRpc } from "eosjs";
import { JsSignatureProvider } from "eosjs/dist/eosjs-jssig";
import { PrivateKey } from "eosjs/dist/eosjs-key-conversion";
import { bytesToHex, mnemonicToSeedSync, generateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";

export const RPC_ENDPOINTS=["https://wax.greymass.com","https://wax.eosusa.io","https://wax.eosn.io"];
export const HISTORY_ENDPOINT="https://wax.eosusa.io";
export const ATOMIC_ENDPOINT="https://wax.api.atomicassets.io";
export const TOKENS=[
 {symbol:"WAX",contract:"eosio.token",precision:8,icon:"◈"},
 {symbol:"AUBAR",contract:"aubartoken111",precision:8,icon:"💎"},
 {symbol:"TLM",contract:"alien.worlds",precision:4,icon:"🪐"},
 {symbol:"GPU",contract:"gpunetwork11",precision:4,icon:"⚡"}
];
export type Vault={privateKey:string; publicKey:string; mnemonic?:string};
let activeRpc=RPC_ENDPOINTS[0];
export async function withRpc<T>(fn:(rpc:JsonRpc)=>Promise<T>):Promise<T>{
 let last:unknown;
 for(const endpoint of [activeRpc,...RPC_ENDPOINTS.filter(x=>x!==activeRpc)]){try{const result=await fn(new JsonRpc(endpoint));activeRpc=endpoint;return result}catch(e){last=e}}
 throw last;
}
export function newMnemonic(){return generateMnemonic(wordlist,128)}
export function vaultFromMnemonic(mnemonic:string):Vault{
 const seed=mnemonicToSeedSync(mnemonic.trim().toLowerCase());
 // WAX/EOS accounts are permissioned. This deterministic local key is for this starter vault;
 // production wallets should use an audited WAX derivation implementation and show the path.
 const key=PrivateKey.fromBuffer(seed.slice(0,32));
 return {privateKey:key.toString(),publicKey:key.toPublic().toString(),mnemonic:mnemonic.trim().toLowerCase()};
}
export function newVault(){const mnemonic=newMnemonic();return vaultFromMnemonic(mnemonic)}
export async function getAccount(account:string){return withRpc(r=>r.get_account(account))}
export async function getBalances(account:string){return withRpc(async r=>{const rows=await Promise.all(TOKENS.map(async token=>{try{const data=await r.get_table_rows({json:true,code:token.contract,scope:account,table:"accounts",limit:100});const row=(data.rows as {balance:string}[]).find(x=>x.balance.endsWith(token.symbol));return {...token,balance:row?.balance??`0.${"0".repeat(token.precision)} ${token.symbol}`}}catch{return {...token,balance:`0.${"0".repeat(token.precision)} ${token.symbol}`}}}));return rows})}
export async function getHistory(account:string){return withRpc(async r=>{const res=await fetch(`${HISTORY_ENDPOINT}/v2/history/get_actions?account=${encodeURIComponent(account)}&limit=25`);if(!res.ok)throw new Error("History service unavailable");return (await res.json()).actions??[]})}
export async function getNFTs(account:string){const res=await fetch(`${ATOMIC_ENDPOINT}/atomicassets/v1/assets?owner=${encodeURIComponent(account)}&page=1&limit=24&order=desc&sort=asset_id`);if(!res.ok)throw new Error("NFT service unavailable");return (await res.json()).data??[]}
export async function transferWAX(from:string,to:string,amount:string,memo:string,privateKey:string){return withRpc(async rpc=>{const api=new Api({rpc,signatureProvider:new JsSignatureProvider([privateKey])});return api.transact({actions:[{account:"eosio.token",name:"transfer",authorization:[{actor:from,permission:"active"}],data:{from,to,quantity:`${Number(amount).toFixed(8)} WAX`,memo}}]},{blocksBehind:3,expireSeconds:30})})}
export function friendlyError(error:unknown){const text=error instanceof Error?error.message:String(error);if(/cpu/i.test(text))return "Insufficient CPU. Stake or rent more CPU, then retry.";if(/net|bandwidth/i.test(text))return "Insufficient NET bandwidth. Stake or rent more NET, then retry.";if(/ram/i.test(text))return "Insufficient RAM for this action.";if(/overdrawn|balance/i.test(text))return "The account does not have enough WAX.";return text}
export {bytesToHex};
