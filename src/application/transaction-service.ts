import {assertValidTransfer} from "../domain/validation";
import {Api,JsonRpc} from "eosjs";
import {JsSignatureProvider} from "eosjs/dist/eosjs-jssig";
import {Token} from "../lib/wax";
export function createTransferAction(from:string,to:string,token:Token,amount:string,memo:string){assertValidTransfer({from,to,symbol:token.symbol,precision:token.precision,amount,memo});return{account:token.contract,name:"transfer",authorization:[{actor:from,permission:"active"}],data:{from,to,quantity:`${Number(amount).toFixed(token.precision)} ${token.symbol}`,memo}}}
export async function buildAndSignTransfer(rpc:JsonRpc,from:string,to:string,token:Token,amount:string,memo:string,privateKey:string){const api=new Api({rpc,signatureProvider:new JsSignatureProvider([privateKey])});return api.transact({actions:[createTransferAction(from,to,token,amount,memo)]},{blocksBehind:3,expireSeconds:30})}
