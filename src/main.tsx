import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize theme on boot so both `.dark` class AND `[data-theme="dark"]`
// attribute are in sync from the first paint. The prototype's raw-hex
// tokens live under `[data-theme="dark"]` — this keeps them live.
(function initTheme() {
  try {
    const stored = localStorage.getItem("theme");
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (stored !== "light" && prefersDark);
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
  } catch {
    /* ignore */
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
