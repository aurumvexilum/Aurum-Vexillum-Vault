import { BrowserVaultAdapter } from "../../src/infrastructure/browser-vault-adapter";
import { VaultService } from "../../packages/core/src/storage";

export const browserVault = new VaultService(new BrowserVaultAdapter());
export const nativeVault = {
  save: async (value: string, password: string) => {
    console.warn("Native vault adapter not implemented in the web build.");
    return Promise.resolve();
  },
  load: async (password: string) => {
    console.warn("Native vault adapter not implemented in the web build.");
    return "";
  },
  clear: async () => Promise.resolve(),
};
