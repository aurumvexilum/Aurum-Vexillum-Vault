import {Api,JsonRpc} from "eosjs";
import {JsSignatureProvider} from "eosjs/dist/eosjs-jssig";
import {Token} from "../lib/wax";
import {assertTransfer} from "../../packages/core/src/validation";
import {RpcBroker} from "../infrastructure/rpc-broker";
export function buildTransferAction(from:string,to:string,token:Token,amount:string,memo:string){assertTransfer({from,to,token,amount,memo});return{account:token.contract,name:"transfer",authorization:[{actor:from,permission:"active"}],data:{from,to,quantity:`${Number(amount).toFixed(token.precision)} ${token.symbol}`,memo}}}
export async function previewTransfer(broker:RpcBroker,from:string,to:string,token:Token,amount:string,memo:string){const action=buildTransferAction(from,to,token,amount,memo);return broker.call(async rpc=>{const info=await rpc.get_info();const block=await rpc.get_block(info.last_irreversible_block_num);return{action,chainId:info.chain_id,headBlock:info.head_block_num,irreversibleBlock:info.last_irreversible_block_num,expiresAt:new Date(Date.parse(block.timestamp)+30000).toISOString()}})}
export class TransactionBroker{constructor(private readonly rpc:RpcBroker){}async sendTransfer(from:string,to:string,token:Token,amount:string,memo:string,privateKey:string){return this.rpc.call(async endpoint=>{const api=new Api({rpc:endpoint,signatureProvider:new JsSignatureProvider([privateKey])});return api.transact({actions:[buildTransferAction(from,to,token,amount,memo)]},{blocksBehind:3,expireSeconds:30})})}}
