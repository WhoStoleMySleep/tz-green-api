import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Credentials } from "../types/greenApi";

interface AuthState {
  credentials: Credentials | null;
  login: (credentials: Credentials) => void;
  logout: () => void;
}

/** Учётные данные живут в localStorage, чтобы перезагрузка страницы не разлогинивала. */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      credentials: null,
      login: (credentials) => set({ credentials }),
      logout: () => set({ credentials: null }),
    }),
    { name: "green-max-auth" },
  ),
);
