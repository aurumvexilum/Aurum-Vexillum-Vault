import {KeychainVaultAdapter} from "./core";
export function createNativeVault(keychain:any){return new KeychainVaultAdapter(keychain)}
