import {Api,JsonRpc} from "eosjs";
import {JsSignatureProvider} from "eosjs/dist/eosjs-jssig";
import {PrivateKey} from "eosjs/dist/eosjs-key-conversion";
import {mnemonicToSeedSync,generateMnemonic} from "@scure/bip39";
import {wordlist} from "@scure/bip39/wordlists/english";
import {sha256} from "js-sha256";

export const RPC_ENDPOINTS=["https://wax.greymass.com","https://wax.eosusa.io","https://wax.eosn.io"];
export const HISTORY_ENDPOINT="https://wax.eosusa.io";
export const ATOMIC_ENDPOINT="https://wax.api.atomicassets.io";
export const TOKEN_LIST_URL="https://raw.githubusercontent.com/wax-foundation/wax-token-list/main/tokens.json";
export type Token={symbol:string;contract:string;precision:number;icon?:string;logo?:string;name?:string};
export const VERIFIED_TOKENS:Token[]=[{symbol:"WAX",name:"WAX",contract:"eosio.token",precision:8,icon:"◈"},{symbol:"AUBAR",contract:"aubartoken111",precision:8,icon:"💎"},{symbol:"TLM",contract:"alien.worlds",precision:4,icon:"🪐"},{symbol:"GPU",contract:"gpunetwork11",precision:4,icon:"⚡"}];
export type Vault={privateKey:string;publicKey:string;mnemonic?:string};
let activeRpc=RPC_ENDPOINTS[0];
export async function withRpc<T>(fn:(rpc:JsonRpc)=>Promise<T>){let last:unknown;for(const endpoint of [activeRpc,...RPC_ENDPOINTS.filter(x=>x!==activeRpc)]){try{const value=await fn(new JsonRpc(endpoint));activeRpc=endpoint;return value}catch(e){last=e}}throw last}
export function newMnemonic(){return generateMnemonic(wordlist,128)}
export function vaultFromMnemonic(mnemonic:string):Vault{const normalized=mnemonic.trim().toLowerCase();if(!normalized||normalized.split(/\s+/).length<12)throw new Error("A recovery phrase must contain at least 12 words.");const seed=mnemonicToSeedSync(normalized);const key=PrivateKey.fromBuffer(seed.slice(0,32));return{privateKey:key.toString(),publicKey:key.toPublic().toString(),mnemonic:normalized}}
export function newVault(){return vaultFromMnemonic(newMnemonic())}
export async function getAccount(account:string){return withRpc(r=>r.get_account(account))}
export async function fetchTokenList():Promise<Token[]>{try{const response=await fetch(TOKEN_LIST_URL);if(!response.ok)throw new Error();const data=await response.json();const list=Array.isArray(data)?data:data.tokens;return list.filter((x:any)=>x.contract&&x.symbol).map((x:any)=>({symbol:x.symbol||x.ticker,name:x.name||x.symbol,contract:x.contract||x.account,precision:Number(x.precision??8),logo:x.logo||x.logoURI}))}catch{return VERIFIED_TOKENS}}
export async function getBalances(account:string,tokens=VERIFIED_TOKENS){return withRpc(async r=>Promise.all(tokens.map(async token=>{try{const data=await r.get_table_rows({json:true,code:token.contract,scope:account,table:"accounts",limit:100});const row=(data.rows as {balance:string}[]).find(x=>x.balance.endsWith(` ${token.symbol}`));return{...token,balance:row?.balance??`0.${"0".repeat(token.precision)} ${token.symbol}`} }catch{return{...token,balance:`0.${"0".repeat(token.precision)} ${token.symbol}`}}})))}
export async function getHistory(account:string){const response=await fetch(`${HISTORY_ENDPOINT}/v2/history/get_actions?account=${encodeURIComponent(account)}&limit=50`);if(!response.ok)throw new Error("History service unavailable");return(await response.json()).actions??[]}
export async function getNFTs(account:string){const response=await fetch(`${ATOMIC_ENDPOINT}/atomicassets/v1/assets?owner=${encodeURIComponent(account)}&page=1&limit=50&order=desc&sort=asset_id`);if(!response.ok)throw new Error("NFT service unavailable");return(await response.json()).data??[]}
export async function transferWAX(from:string,to:string,amount:string,memo:string,privateKey:string){if(!/^\w{1,12}$/.test(to))throw new Error("Invalid WAX account name.");if(!/^\d+(\.\d{1,8})?$/.test(amount)||Number(amount)<=0)throw new Error("Enter a valid positive WAX amount.");return withRpc(async rpc=>{const api=new Api({rpc,signatureProvider:new JsSignatureProvider([privateKey])});return api.transact({actions:[{account:"eosio.token",name:"transfer",authorization:[{actor:from,permission:"active"}],data:{from,to,quantity:`${Number(amount).toFixed(8)} WAX`,memo:memo.slice(0,256)}}]},{blocksBehind:3,expireSeconds:30})})}
export function signMessage(message:string,privateKey:string){const hash=sha256.arrayBuffer(new TextEncoder().encode(message));return PrivateKey.fromString(privateKey).signHash(new Uint8Array(hash)).toString()}
export function friendlyError(error:unknown){const text=error instanceof Error?error.message:String(error);if(/cpu/i.test(text))return"Insufficient CPU. Stake or rent more CPU, then retry.";if(/net|bandwidth/i.test(text))return"Insufficient NET bandwidth. Stake or rent more NET, then retry.";if(/ram/i.test(text))return"Insufficient RAM for this action.";if(/overdrawn|balance/i.test(text))return"The account does not have enough WAX.";return text}
