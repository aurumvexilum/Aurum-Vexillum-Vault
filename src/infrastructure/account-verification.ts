import {JsonRpc} from "eosjs";
import {verifyImportedAccount} from "../../packages/core/src/recovery";
import {RpcBroker} from "./rpc-broker";
export const waxRpc=new RpcBroker(["https://wax.greymass.com","https://wax.eosusa.io","https://wax.eosn.io"]);
export async function verifyAccountPermission(accountName:string,publicKey:string,permission="active"){if(!/^[a-z1-5.]{1,12}$/.test(accountName))throw new Error("Invalid WAX account name.");return waxRpc.call(async rpc=>verifyImportedAccount(await rpc.get_account(accountName) as any,publicKey,permission))}
export async function getPermissionKeys(accountName:string,permission="active"){return waxRpc.call(async rpc=>{const account=await rpc.get_account(accountName) as any;const selected=account.permissions?.find((item:any)=>item.perm_name===permission);if(!selected)throw new Error(`Permission ${permission} was not found.`);return selected.required_auth?.keys??[]})}
export type {JsonRpc};
