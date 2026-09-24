import type {SecureVaultAdapter} from "../../packages/core/src/vault";

type EncryptedRecord={version:1;algorithm:"AES-GCM";kdf:"PBKDF2-SHA-256";iterations:number;salt:string;iv:string;ciphertext:string;updatedAt:string};
const DB="wax-vault",STORE="vault",KEY="current",ITERATIONS=310000;
const toBase64=(value:ArrayBuffer|Uint8Array)=>btoa(String.fromCharCode(...new Uint8Array(value)));
const fromBase64=(value:string)=>Uint8Array.from(atob(value),char=>char.charCodeAt(0));

export class BrowserVaultAdapter implements SecureVaultAdapter{
 private async database(){return new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open(DB,2);request.onupgradeneeded=()=>{const database=request.result;if(!database.objectStoreNames.contains(STORE))database.createObjectStore(STORE)};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}
 private async record():Promise<EncryptedRecord|null>{const database=await this.database();return new Promise((resolve,reject)=>{const request=database.transaction(STORE,"readonly").objectStore(STORE).get(KEY);request.onsuccess=()=>resolve(request.result??null);request.onerror=()=>reject(request.error)})}
 private async key(password:string,salt:Uint8Array){if(password.length<10)throw new Error("Use a passphrase with at least 10 characters.");const material=await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveKey"]);return crypto.subtle.deriveKey({name:"PBKDF2",salt,iterations:ITERATIONS,hash:"SHA-256"},material,{name:"AES-GCM",length:256},false,["encrypt","decrypt"])}
 async save(payload:string,password?:string):Promise<void>{if(!password)throw new Error("A passphrase is required for browser vault writes.");const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),ciphertext=await crypto.subtle.encrypt({name:"AES-GCM",iv},await this.key(password,salt),new TextEncoder().encode(payload));await this.put({version:1,algorithm:"AES-GCM",kdf:"PBKDF2-SHA-256",iterations:ITERATIONS,salt:toBase64(salt),iv:toBase64(iv),ciphertext:toBase64(ciphertext),updatedAt:new Date().toISOString()})}
 async load(password?:string){if(!password)throw new Error("A passphrase is required to unlock the browser vault.");const record=await this.record();if(!record)throw new Error("No encrypted vault found on this device.");try{const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:fromBase64(record.iv)},await this.key(password,fromBase64(record.salt)),fromBase64(record.ciphertext));return new TextDecoder().decode(plain)}catch{throw new Error("Incorrect passphrase or corrupted vault.")}}
 async exists(){return Boolean(await this.record())}
 async clear(){const database=await this.database();await new Promise<void>((resolve,reject)=>{const transaction=database.transaction(STORE,"readwrite");transaction.objectStore(STORE).delete(KEY);transaction.oncomplete=()=>resolve();transaction.onerror=()=>reject(transaction.error)})}
 async put(record:EncryptedRecord){const database=await this.database();await new Promise<void>((resolve,reject)=>{const transaction=database.transaction(STORE,"readwrite");transaction.objectStore(STORE).put(record,KEY);transaction.oncomplete=()=>resolve();transaction.onerror=()=>reject(transaction.error)})}
 async export(){const record=await this.record();if(!record)throw new Error("No encrypted vault found.");return JSON.stringify({format:"wax-vault-aes-gcm-v2",record},null,2)}
 async import(serialized:string){const parsed=JSON.parse(serialized);if(parsed?.format!=="wax-vault-aes-gcm-v2"||parsed.record?.version!==1||parsed.record?.algorithm!=="AES-GCM")throw new Error("Invalid encrypted vault export.");await this.put(parsed.record)}
}
