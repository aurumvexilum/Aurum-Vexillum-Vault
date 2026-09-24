export type VaultRecord={version:1;createdAt:string;updatedAt:string;payload:string};
export interface SecureVaultAdapter{save(payload:string):Promise<void>;load():Promise<string>;exists():Promise<boolean>;clear():Promise<void>;export():Promise<string>;import(serialized:string):Promise<void>}
export interface NativeSecureVaultAdapter extends SecureVaultAdapter{isBiometricAvailable?():Promise<boolean>;unlock?():Promise<void>}
export class VaultLifecycle{constructor(private readonly adapter:SecureVaultAdapter){}save(payload:string){return this.adapter.save(payload)}load(){return this.adapter.load()}exists(){return this.adapter.exists()}clear(){return this.adapter.clear()}export(){return this.adapter.export()}import(serialized:string){return this.adapter.import(serialized)}}
