"use client";

import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/contexts/auth-context";
import "react-toastify/dist/ReactToastify.css";

const THEME_KEY = "promptarc_theme";

export function Providers({ children }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY);
    const initial = stored === "dark" || stored === "light"
      ? stored
      : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;

    function handleTheme(event) {
      const next = event.detail === "dark" ? "dark" : "light";
      setTheme(next);
      document.documentElement.dataset.theme = next;
    }

    window.addEventListener("promptarc-theme", handleTheme);
    return () => window.removeEventListener("promptarc-theme", handleTheme);
  }, []);

  return (
    <AuthProvider>
      {children}
      <ToastContainer position="bottom-right" theme={theme} autoClose={2800} newestOnTop />
    </AuthProvider>
  );
}
