import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getBalances, getHistory, getNFTs } from "../lib/wax";
import { loadAllWaxTokensSafely } from "../infrastructure/wax-token-registry";

export type DashboardState = {
  account: string;
  tokens: any[];
  balances: any[];
  history: any[];
  nfts: any[];
  hiddenTokens: string[];
  loading: boolean;
  error: string | null;
  setAccount: (account: string) => void;
  toggleTokenVisibility: (token: { symbol?: string; contract?: string }) => void;
  isTokenHidden: (token: { symbol?: string; contract?: string }) => boolean;
  showAllTokens: () => void;
  refresh: () => Promise<void>;
  clearError: () => void;
};

const tokenKey = (token: { symbol?: string; contract?: string }) => `${token.contract ?? ""}:${token.symbol ?? ""}`;

export const useDashboardStore = create<DashboardState>()(persist((set, get) => ({
  account: "", tokens: [], balances: [], history: [], nfts: [], hiddenTokens: [], loading: false, error: null,
  setAccount: (account) => set({ account }),
  clearError: () => set({ error: null }),
  toggleTokenVisibility: (token) => {
    const key = tokenKey(token);
    if (key === ":") return;
    const hidden = get().hiddenTokens;
    set({ hiddenTokens: hidden.includes(key) ? hidden.filter((item) => item !== key) : [...hidden, key] });
  },
  isTokenHidden: (token) => get().hiddenTokens.includes(tokenKey(token)),
  showAllTokens: () => set({ hiddenTokens: [] }),
  refresh: async () => {
    const account = get().account.trim();
    if (!account) { set({ error: "Enter a WAX account name." }); return; }
    set({ loading: true, error: null });
    try {
      const tokens = await loadAllWaxTokensSafely();
      const [balances, history, nfts] = await Promise.all([getBalances(account, tokens), getHistory(account), getNFTs(account)]);
      set({ tokens, balances, history, nfts, loading: false });
    } catch (error) { set({ loading: false, error: error instanceof Error ? error.message : String(error) }); }
  },
}), { name: "aurum-vexillum-vault-dashboard", storage: createJSONStorage(() => localStorage), partialize: (state) => ({ account: state.account, hiddenTokens: state.hiddenTokens }) }));
