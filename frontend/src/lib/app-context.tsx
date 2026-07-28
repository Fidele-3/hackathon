"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { clearSession, getStoredUser, getToken } from "@/lib/api";
import type { AuthUser, Language } from "@/lib/types";

type AppContextValue = {
  language: Language;
  setLanguage: (l: Language) => void;
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
  logout: () => void;
  ready: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("rw");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("ehinga_lang") as Language | null;
    if (savedLang === "en" || savedLang === "rw") setLanguageState(savedLang);
    if (getToken()) setUser(getStoredUser());
    setReady(true);
  }, []);

  const setLanguage = useCallback((l: Language) => {
    setLanguageState(l);
    localStorage.setItem("ehinga_lang", l);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ language, setLanguage, user, setUser, logout, ready }),
    [language, setLanguage, user, logout, ready],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
