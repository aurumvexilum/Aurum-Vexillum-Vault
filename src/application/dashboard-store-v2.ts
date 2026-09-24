import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getBalances, getHistory, getNFTs } from "../lib/wax";
import { loadAllWaxTokensSafely } from "../infrastructure/wax-token-registry";

export type DashboardState = { account: string; tokens: any[]; balances: any[]; history: any[]; nfts: any[]; loading: boolean; error: string | null; setAccount: (account: string) => void; refresh: () => Promise<void>; clearError: () => void };

export const useDashboardStore = create<DashboardState>()(persist((set, get) => ({
  account: "", tokens: [], balances: [], history: [], nfts: [], loading: false, error: null,
  setAccount: (account) => set({ account }), clearError: () => set({ error: null }),
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
}), { name: "wax-dashboard-v2", storage: createJSONStorage(() => localStorage), partialize: (state) => ({ account: state.account }) }));
