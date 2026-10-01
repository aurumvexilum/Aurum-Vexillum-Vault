/**
 * Transaction mutation detection to prevent payload tampering.
 * Creates a snapshot of the transaction at preview time and verifies it hasn't changed at signing time.
 */

interface TransactionSnapshot {
  hash: string;
  payload: string;
  timestamp: number;
  origin: string;
  account: string;
  network: string;
}

const SNAPSHOT_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes
const snapshots = new Map<string, TransactionSnapshot>();

/**
 * Create a SHA256 hash of the transaction payload.
 */
async function sha256Hash(data: string): Promise<string> {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Create a cryptographic snapshot of a transaction for mutation detection.
 */
export async function createTransactionSnapshot(
  payload: unknown,
  origin: string,
  account: string,
  network: string,
): Promise<{ hash: string; snapshot: TransactionSnapshot }> {
  const payloadJson = JSON.stringify(payload);
  const hash = await sha256Hash(payloadJson);

  const snapshot: TransactionSnapshot = {
    hash,
    payload: payloadJson,
    timestamp: Date.now(),
    origin,
    account,
    network,
  };

  snapshots.set(hash, snapshot);
  return { hash, snapshot };
}

/**
 * Verify that a transaction has not mutated since the snapshot.
 * Throws if mutation detected, expired, or mismatched context.
 */
export async function verifyTransactionIntegrity(
  payload: unknown,
  snapshotHash: string,
  currentOrigin: string,
  currentAccount: string,
  currentNetwork: string,
): Promise<{ isValid: boolean; error?: string }> {
  const snapshot = snapshots.get(snapshotHash);

  if (!snapshot) {
    return { isValid: false, error: "Transaction snapshot not found. Re-approve to continue." };
  }

  // Check expiry
  const age = Date.now() - snapshot.timestamp;
  if (age > SNAPSHOT_VALIDITY_MS) {
    snapshots.delete(snapshotHash);
    return { isValid: false, error: "Transaction approval expired. Re-approve to continue." };
  }

  // Check origin hasn't changed
  if (currentOrigin !== snapshot.origin) {
    snapshots.delete(snapshotHash);
    return { isValid: false, error: `Origin changed from ${snapshot.origin}. Re-approve required.` };
  }

  // Check account hasn't changed
  if (currentAccount !== snapshot.account) {
    snapshots.delete(snapshotHash);
    return { isValid: false, error: `Account changed from ${snapshot.account}. Re-approve required.` };
  }

  // Check network hasn't changed
  if (currentNetwork !== snapshot.network) {
    snapshots.delete(snapshotHash);
    return { isValid: false, error: `Network changed from ${snapshot.network}. Re-approve required.` };
  }

  // Check payload hasn't mutated
  const currentPayloadJson = JSON.stringify(payload);
  const currentHash = await sha256Hash(currentPayloadJson);

  if (currentHash !== snapshotHash) {
    snapshots.delete(snapshotHash);
    return {
      isValid: false,
      error: "Transaction payload has changed since approval. This may be a malicious modification. Re-approve required.",
    };
  }

  return { isValid: true };
}

/**
 * Clear expired snapshots to prevent memory leaks.
 */
export function clearExpiredSnapshots(): void {
  const now = Date.now();
  for (const [hash, snapshot] of snapshots.entries()) {
    if (now - snapshot.timestamp > SNAPSHOT_VALIDITY_MS) {
      snapshots.delete(hash);
    }
  }
}

/**
 * Clear all snapshots (for logout/account change).
 */
export function clearAllSnapshots(): void {
  snapshots.clear();
}
