export class BrowserVaultAdapter implements VaultStorage<any> {
  private static readonly DB = "wax-vault";
  private static readonly STORE = "vault";
  private static readonly KEY = "current";

  private async db(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(BrowserVaultAdapter.DB, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore(BrowserVaultAdapter.STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async derive(password: string, salt: Uint8Array) {
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 310000, hash: "SHA-256" },
      await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]),
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
  }

  private enc = (buffer: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buffer)));
  private dec = (value: string) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0));

  async save(value: any, password: string): Promise<void> {
    if (!password || password.length < 10) throw new Error("Use a passphrase with at least 10 characters.");
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.derive(password, salt);
    const cipher = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(JSON.stringify(value)),
    );

    const db = await this.db();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(BrowserVaultAdapter.STORE, "readwrite");
      tx.objectStore(BrowserVaultAdapter.STORE).put({ salt: this.enc(salt), iv: this.enc(iv), cipher: this.enc(cipher) }, BrowserVaultAdapter.KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async load(password: string): Promise<any> {
    const db = await this.db();
    const record = await new Promise<any>((resolve, reject) => {
      const tx = db.transaction(BrowserVaultAdapter.STORE, "readonly");
      const req = tx.objectStore(BrowserVaultAdapter.STORE).get(BrowserVaultAdapter.KEY);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
    if (!record) throw new Error("No encrypted vault found on this device.");
    try {
      const key = await this.derive(password, this.dec(record.salt));
      const plain = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: this.dec(record.iv) },
        key,
        this.dec(record.cipher),
      );
      return JSON.parse(new TextDecoder().decode(plain));
    } catch {
      throw new Error("Incorrect passphrase or corrupted vault.");
    }
  }

  async exists() {
    const db = await this.db();
    return new Promise<boolean>((resolve, reject) => {
      const req = db.transaction(BrowserVaultAdapter.STORE, "readonly").objectStore(BrowserVaultAdapter.STORE).getKey(BrowserVaultAdapter.KEY);
      req.onsuccess = () => resolve(Boolean(req.result));
      req.onerror = () => reject(req.error);
    });
  }

  async export(): Promise<string> {
    const db = await this.db();
    const record = await new Promise<any>((resolve, reject) => {
      const tx = db.transaction(BrowserVaultAdapter.STORE, "readonly");
      const req = tx.objectStore(BrowserVaultAdapter.STORE).get(BrowserVaultAdapter.KEY);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
    if (!record) throw new Error("No encrypted vault found.");
    return JSON.stringify({ format: "wax-vault-aes-gcm-v1", record }, null, 2);
  }

  async import(serialized: string): Promise<void> {
    const parsed = JSON.parse(serialized);
    if (parsed.format !== "wax-vault-aes-gcm-v1" || !parsed.record?.cipher) throw new Error("Invalid encrypted vault export.");
    const db = await this.db();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(BrowserVaultAdapter.STORE, "readwrite");
      tx.objectStore(BrowserVaultAdapter.STORE).put(parsed.record, BrowserVaultAdapter.KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}
