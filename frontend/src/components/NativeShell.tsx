"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { Keyboard, KeyboardResize } from "@capacitor/keyboard";
import { App } from "@capacitor/app";

/** Native iOS polish — status bar, splash hide, keyboard, back button. */
export function NativeShell() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    void (async () => {
      try {
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: "#FFFFFF" });
      } catch {
        /* web / unsupported */
      }
      try {
        await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
      } catch {
        /* optional */
      }
      // Let branded React splash finish, then hide native splash
      window.setTimeout(() => {
        void SplashScreen.hide({ fadeOutDuration: 280 });
      }, 400);
    })();

    const sub = App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) window.history.back();
      else void App.exitApp();
    });

    return () => {
      void sub.then((h) => h.remove());
    };
  }, []);

  return null;
}
