"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Me } from "./types";

interface AuthState {
  access: string | null;
  refresh: string | null;
  user: Me | null;
  hydrated: boolean;
  setSession: (access: string, refresh: string, user: Me) => void;
  setAccess: (access: string) => void;
  setUser: (user: Me) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      access: null,
      refresh: null,
      user: null,
      hydrated: false,
      setSession: (access, refresh, user) => set({ access, refresh, user }),
      setAccess: (access) => set({ access }),
      setUser: (user) => set({ user }),
      logout: () => set({ access: null, refresh: null, user: null }),
    }),
    {
      name: "ubuhinzi-admin-auth",
    }
  )
);

if (typeof window !== "undefined") {
  useAuthStore.persist.onFinishHydration(() => {
    useAuthStore.setState({ hydrated: true });
  });
  if (useAuthStore.persist.hasHydrated()) {
    useAuthStore.setState({ hydrated: true });
  }
}
