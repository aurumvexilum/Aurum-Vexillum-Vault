import { BrowserVaultAdapter } from "./browser-vault-adapter";
import { VaultService } from "../../packages/core/src/storage";
import { RpcBroker } from "./rpc-broker";
import { assertTrustedAction } from "./trusted-contracts";

export const browserVault = new VaultService(new BrowserVaultAdapter());
export const rpcBroker = new RpcBroker(["https://wax.greymass.com", "https://wax.eosusa.io", "https://wax.eosn.io"]);
export type WalletConnection = { origin: string; account: string; permissions: string[]; connectedAt: string };
export type DappTransactionRequest = { origin: string; account: string; permission: string; actions: Array<{ account: string; name: string; data: Record<string, unknown> }> };

function validateOrigin(origin: string) { const url = new URL(origin); if (url.protocol !== "https:") throw new Error("dApp origin must use HTTPS."); return url.origin; }
export class DappConnector {
  private static store = new Map<string, WalletConnection>();
  static connect(origin: string, account: string, permissions: string[] = ["active"]) { const normalized = validateOrigin(origin); const session = { origin: normalized, account, permissions, connectedAt: new Date().toISOString() }; this.store.set(normalized, session); return session; }
  static revoke(origin: string) { this.store.delete(new URL(origin).origin); }
  static list() { return [...this.store.values()]; }
  static requestTransaction(request: DappTransactionRequest) { const origin = validateOrigin(request.origin); const session = this.store.get(origin); if (!session || session.account !== request.account || !session.permissions.includes(request.permission)) throw new Error("dApp is not connected for this account and permission."); request.actions.forEach((action) => assertTrustedAction(action)); return request; }
}
