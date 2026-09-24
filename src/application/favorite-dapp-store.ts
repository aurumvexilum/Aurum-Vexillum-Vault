import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type FavoriteDapp = { name: string; url: string; description: string; status: "Connected" | "Pending" };

export const SUPPORTED_DAPPS: FavoriteDapp[] = [
  { name: "WAX Arena", url: "https://arena.wax.io", description: "WAX ecosystem applications", status: "Connected" },
  { name: "Alien Worlds", url: "https://alienworlds.io", description: "Explore the Alien Worlds universe", status: "Pending" },
  { name: "WAX DAO", url: "https://dao.wax.io", description: "Community governance on WAX", status: "Connected" },
];

type FavoriteDappState = { favoriteUrls: string[]; toggleFavorite: (url: string) => void; isFavorite: (url: string) => boolean };

export const useFavoriteDappStore = create<FavoriteDappState>()(persist((set, get) => ({
  favoriteUrls: [],
  toggleFavorite: (url) => set((state) => ({ favoriteUrls: state.favoriteUrls.includes(url) ? state.favoriteUrls.filter((item) => item !== url) : [...state.favoriteUrls, url] })),
  isFavorite: (url) => get().favoriteUrls.includes(url),
}), { name: "aurum-vexillum-vault-favorite-dapps", storage: createJSONStorage(() => localStorage) }));
