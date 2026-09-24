import { BrowserVaultAdapter } from "../src/infrastructure/browser-vault-adapter";
import { VaultService } from "../packages/core/src/storage";
import { RpcBroker } from "../src/infrastructure/rpc-broker";

export const browserVault = new VaultService(new BrowserVaultAdapter());
export const rpcBroker = new RpcBroker(["https://wax.greymass.com", "https://wax.eosusa.io", "https://wax.eosn.io"]);

export type WalletConnection = { origin: string; account: string; permissions: string[]; connectedAt: string };
export class DappConnector {
  private static store = new Map<string, WalletConnection>();
  static connect(origin: string, account: string, permissions: string[] = ["active"]) {
    const session = { origin, account, permissions, connectedAt: new Date().toISOString() };
    this.store.set(origin, session);
    return session;
  }
  static revoke(origin: string) { this.store.delete(origin); }
  static list() { return [...this.store.values()]; }
}
