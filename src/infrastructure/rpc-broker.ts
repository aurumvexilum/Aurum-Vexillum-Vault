import {JsonRpc} from "eosjs";
export type RpcFactory=(endpoint:string)=>JsonRpc;
export class RpcBroker{private active=0;private failures=new Map<string,number>();constructor(private readonly endpoints:string[],private readonly factory:RpcFactory=(endpoint)=>new JsonRpc(endpoint)){if(!endpoints.length)throw new Error("At least one RPC endpoint is required.")}
 async call<T>(operation:(rpc:JsonRpc)=>Promise<T>):Promise<T>{let last:unknown;for(let offset=0;offset<this.endpoints.length;offset++){const index=(this.active+offset)%this.endpoints.length,endpoint=this.endpoints[index];try{const result=await operation(this.factory(endpoint));this.active=index;this.failures.set(endpoint,0);return result}catch(error){last=error;this.failures.set(endpoint,(this.failures.get(endpoint)??0)+1)}}throw last}
 status(){return this.endpoints.map(endpoint=>({endpoint,failures:this.failures.get(endpoint)??0,active:this.endpoints[this.active]===endpoint}))}}
