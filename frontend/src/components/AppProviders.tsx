"use client";

import { SplashScreen } from "@/components/SplashScreen";
import { AppTabBar } from "@/components/AppTabBar";
import { PwaRegister } from "@/components/PwaRegister";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SplashScreen />
      {children}
      <AppTabBar />
      <PwaRegister />
    </>
  );
}
