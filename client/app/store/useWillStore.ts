import { create } from "zustand";

export type Heir = {
  id: string;
  walletAddress: string;
  shareBps: number;
};

type WillAccount = {
  lastCheckin: number;
  interval: number;
  status: string;
};

type VaultAccount = {
  sol: number;
  usdc: number;
  totalUsdValue: number;
};

type State = {
  connected: boolean;
  publicKey: string | null;
  walletAddress: string | null;

  willAccount: WillAccount | null;
  vaultAccount: VaultAccount | null;
  heirs: Heir[];

  txPending: boolean;

  setWallet: (key: string | null) => void;
  setTxPending: (v: boolean) => void;
  performCheckin: () => void;
  addHeir: (heir: Omit<Heir, "id">) => void;
  updateHeir: (id: string, updates: Partial<Omit<Heir, "id">>) => void;
  removeHeir: (id: string) => void;
};

export const useWillStore = create<State>((set) => ({
  connected: true,
  publicKey: null,
  walletAddress: null,

  willAccount: null,
  //  {
  //   lastCheckin: Math.floor(Date.now() / 1000),
  //   interval: 60 * 60 * 24 * 30,
  //   status: "Active",
  // }
  vaultAccount: {
    sol: 120,
    usdc: 25000,
    totalUsdValue: 187520,
  },

  heirs: [],

  txPending: false,

  setWallet: (key) =>
    set({ publicKey: key, walletAddress: key, connected: !!key }),

  setTxPending: (v) => set({ txPending: v }),

  performCheckin: () =>
    set((state) => {
      if (!state.willAccount) return state;
      return {
        willAccount: {
          ...state.willAccount,
          lastCheckin: Math.floor(Date.now() / 1000),
        },
      };
    }),

  addHeir: (heir) =>
    set((state) => {
      if (state.heirs.length >= 5) return state;
      return {
        heirs: [...state.heirs, { ...heir, id: crypto.randomUUID() }],
      };
    }),

  updateHeir: (id, updates) =>
    set((state) => ({
      heirs: state.heirs.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    })),

  removeHeir: (id) =>
    set((state) => ({
      heirs: state.heirs.filter((h) => h.id !== id),
    })),
}));
