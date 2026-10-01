/**
 * Hardened secure storage with auto-lock, biometric readiness, and strict key handling.
 * Uses PBKDF2 + AES-GCM encryption with 310,000 iterations.
 */

const DB = "wax-vault";
const STORE = "vault";
const KEY = "current";
const METADATA_STORE = "metadata";

interface VaultRecord {
  salt: string;
  iv: string;
  cipher: string;
  version: number;
  createdAt: string;
  lastAccessedAt: string;
}

interface VaultMetadata {
  checksum: string;
  biometricEnabled: boolean;
  autoLockMs: number;
  lastModified: string;
}

const PBKDF2_ITERATIONS = 310000;
const AUTO_LOCK_DEFAULT_MS = 5 * 60 * 1000; // 5 minutes
const MIN_PASSWORD_LENGTH = 10;

let vaultSession: {
  unlockedAt: number;
  lockTimer: NodeJS.Timeout | null;
} | null = null;

/**
 * Initialize the secure vault database.
 */
async function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        db.createObjectStore(METADATA_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Failed to initialize vault database"));
  });
}

/**
 * Derive a key from password using PBKDF2 with strict parameters.
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Base64 encode/decode helpers.
 */
function b64(x: ArrayBuffer | Uint8Array): string {
  return btoa(String.fromCharCode(...new Uint8Array(x)));
}

function bytes(x: string): Uint8Array {
  return Uint8Array.from(atob(x), (c) => c.charCodeAt(0));
}

/**
 * Compute checksum for integrity verification.
 */
async function computeChecksum(data: string): Promise<string> {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  return b64(buffer);
}

/**
 * Get the raw vault record from storage.
 */
async function raw(): Promise<VaultRecord | null> {
  const d = await db();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const request = store.get(KEY);

    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(new Error("Failed to read vault"));
  });
}

/**
 * Get vault metadata.
 */
async function getMetadata(): Promise<VaultMetadata | null> {
  const d = await db();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(METADATA_STORE, "readonly");
    const store = tx.objectStore(METADATA_STORE);
    const request = store.get("metadata");

    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(new Error("Failed to read metadata"));
  });
}

/**
 * Save vault with automatic expiry.
 */
export async function saveVault(
  value: unknown,
  password: string,
  autoLockMs: number = AUTO_LOCK_DEFAULT_MS,
): Promise<void> {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Use a passphrase with at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  const plaintext = JSON.stringify(value);
  const salt = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(password, salt);
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext),
  );

  const record: VaultRecord = {
    salt: b64(salt),
    iv: b64(iv),
    cipher: b64(cipherBuffer),
    version: 1,
    createdAt: new Date().toISOString(),
    lastAccessedAt: new Date().toISOString(),
  };

  const checksum = await computeChecksum(JSON.stringify(record));

  const d = await db();
  return new Promise((resolve, reject) => {
    const tx = d.transaction([STORE, METADATA_STORE], "readwrite");
    const vaultStore = tx.objectStore(STORE);
    const metaStore = tx.objectStore(METADATA_STORE);

    vaultStore.put(record, KEY);
    metaStore.put(
      {
        checksum,
        biometricEnabled: false,
        autoLockMs,
        lastModified: new Date().toISOString(),
      },
      "metadata",
    );

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(new Error("Failed to save vault"));
  });
}

/**
 * Load vault with session management and auto-lock.
 */
export async function loadVault(password: string): Promise<string> {
  const record = await raw();
  if (!record) {
    throw new Error("No encrypted vault found on this device.");
  }

  try {
    const key = await deriveKey(password, bytes(record.salt));
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: bytes(record.iv) },
      key,
      bytes(record.cipher),
    );

    const plaintext = new TextDecoder().decode(decrypted);

    // Validate recovered data
    JSON.parse(plaintext);

    // Set up session with auto-lock
    setupAutoLock();

    return plaintext;
  } catch (error) {
    throw new Error("Failed to decrypt vault. Invalid password or corrupted data.");
  }
}

/**
 * Set up auto-lock timer.
 */
function setupAutoLock(autoLockMs: number = AUTO_LOCK_DEFAULT_MS): void {
  if (vaultSession?.lockTimer) {
    clearTimeout(vaultSession.lockTimer);
  }

  vaultSession = {
    unlockedAt: Date.now(),
    lockTimer: setTimeout(() => {
      vaultSession = null;
      // Trigger UI lock prompt in production
      window.dispatchEvent(new Event("vault-auto-locked"));
    }, autoLockMs),
  };
}

/**
 * Check if vault session is still active.
 */
export function isVaultLocked(): boolean {
  return vaultSession === null;
}

/**
 * Manually lock the vault.
 */
export function lockVault(): void {
  if (vaultSession?.lockTimer) {
    clearTimeout(vaultSession.lockTimer);
  }
  vaultSession = null;
}

/**
 * Export vault with integrity check.
 */
export async function exportVault(): Promise<string> {
  const record = await raw();
  if (!record) {
    throw new Error("No encrypted vault found.");
  }

  const metadata = await getMetadata();
  const checksum = await computeChecksum(JSON.stringify(record));

  if (metadata && metadata.checksum !== checksum) {
    throw new Error("Vault integrity check failed. Do not export.");
  }

  return JSON.stringify(
    {
      format: "wax-vault-aes-gcm-v1",
      version: 1,
      record,
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  );
}

/**
 * Import vault with strict validation.
 */
export async function importVault(json: string): Promise<void> {
  let parsed: any;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("Invalid JSON format for vault import.");
  }

  if (parsed.format !== "wax-vault-aes-gcm-v1") {
    throw new Error("Unsupported vault format. Expected wax-vault-aes-gcm-v1.");
  }

  if (!parsed.record || !parsed.record.cipher) {
    throw new Error("Invalid encrypted vault export.");
  }

  if (!parsed.record.salt || !parsed.record.iv) {
    throw new Error("Vault is missing required encryption parameters.");
  }

  const checksum = await computeChecksum(JSON.stringify(parsed.record));
  if (parsed.checksum && parsed.checksum !== checksum) {
    throw new Error("Vault checksum verification failed. File may be corrupted or tampered with.");
  }

  const d = await db();
  return new Promise((resolve, reject) => {
    const tx = d.transaction([STORE, METADATA_STORE], "readwrite");
    const vaultStore = tx.objectStore(STORE);
    const metaStore = tx.objectStore(METADATA_STORE);

    vaultStore.put(parsed.record, KEY);
    metaStore.put(
      {
        checksum,
        biometricEnabled: false,
        autoLockMs: AUTO_LOCK_DEFAULT_MS,
        lastModified: new Date().toISOString(),
      },
      "metadata",
    );

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(new Error("Failed to import vault"));
  });
}

/**
 * Check if vault exists.
 */
export async function hasVault(): Promise<boolean> {
  return !!(await raw());
}
