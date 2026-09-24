import {mergeTokenMetadata} from "../infrastructure/token-metadata";
import {TOKEN_LIST_URL,VERIFIED_TOKENS,Token} from "../lib/wax";
export async function loadLiveTokenMetadata(signal?:AbortSignal):Promise<Token[]>{const response=await fetch(TOKEN_LIST_URL,{signal});if(!response.ok)throw new Error(`Token metadata request failed (${response.status}).`);const payload=await response.json();const entries=Array.isArray(payload)?payload:Array.isArray(payload.tokens)?payload.tokens:[];return mergeTokenMetadata(entries)}
export async function loadTokenMetadataSafely(signal?:AbortSignal){try{return await loadLiveTokenMetadata(signal)}catch{return VERIFIED_TOKENS}}
