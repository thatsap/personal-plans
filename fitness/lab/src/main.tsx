import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import App from "./App";
import { installBackButton } from "./lib/backButton";
import { bootTheme } from "./lib/theme";
import "./index.css";

bootTheme();
installBackButton();

function Router({ children }: { children: ReactNode }) {
  if (Capacitor.isNativePlatform()) {
    return <HashRouter>{children}</HashRouter>;
  }
  return <BrowserRouter>{children}</BrowserRouter>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
);
