import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

function currentPath(): string {
  const hash = window.location.hash;
  if (hash.startsWith("#")) {
    const p = hash.slice(1).split("?")[0];
    return p || "/";
  }
  return window.location.pathname || "/";
}

function atRoot(): boolean {
  const p = currentPath();
  return p === "/" || p === "/login" || p === "/connect";
}

/** Phone back/gesture: pop the lab stack. Only leave the app at Lab / login. */
export function installBackButton() {
  if (!Capacitor.isNativePlatform()) {
    return;
  }
  void App.addListener("backButton", () => {
    if (!atRoot()) {
      window.history.back();
      return;
    }
    void App.exitApp();
  });
}
