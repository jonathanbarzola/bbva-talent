"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type Theme = "dark" | "light";

const STORAGE_KEY = "bbva-talent:theme";

function readInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  // Read from data-theme already set by the inline anti-FOUC script
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr as Theme;
  // Fallback to localStorage
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch { /* ignore */ }
  return "dark";
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  try { window.localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
}

interface ThemeToggleProps {
  /** Optional size override — default 30px button */
  size?: number;
}

export default function ThemeToggle({ size = 30 }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readInitialTheme());
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  // Avoid hydration mismatch — render a placeholder until mounted
  if (!mounted) {
    return (
      <span
        aria-hidden="true"
        style={{
          display: "inline-block",
          width: size,
          height: size,
          borderRadius: 999,
          background: "var(--theme-tile-soft)",
          border: "1px solid var(--theme-border-soft)",
        }}
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      className="relative flex items-center justify-center transition-all duration-200"
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: isDark
          ? "rgba(150, 148, 255, 0.10)"
          : "rgba(255, 181, 107, 0.18)",
        border: `1px solid ${isDark ? "rgba(150, 148, 255, 0.30)" : "rgba(255, 181, 107, 0.45)"}`,
        color: isDark ? "#9694FF" : "#FFB56B",
        cursor: "pointer",
        overflow: "hidden",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
        (e.currentTarget as HTMLElement).style.boxShadow = isDark
          ? "0 0 12px rgba(150, 148, 255, 0.35)"
          : "0 0 12px rgba(255, 181, 107, 0.4)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.svg
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            width={size * 0.55}
            height={size * 0.55}
            viewBox="0 0 16 16"
            fill="none"
            style={{ position: "absolute" }}
            aria-hidden="true"
          >
            {/* Moon crescent */}
            <path
              d="M11.5 11C8.5 11 6 8.5 6 5.5c0-1.1.3-2.1.9-3C4.6 3 3 5.3 3 8c0 3.3 2.7 6 6 6 1.6 0 3-.6 4.1-1.6-.5.1-1 .1-1.6.1z"
              fill="currentColor"
            />
            {/* Tiny stars */}
            <circle cx="12.5" cy="4" r="0.6" fill="currentColor" />
            <circle cx="13.5" cy="6.5" r="0.4" fill="currentColor" />
          </motion.svg>
        ) : (
          <motion.svg
            key="sun"
            initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            width={size * 0.6}
            height={size * 0.6}
            viewBox="0 0 16 16"
            fill="none"
            style={{ position: "absolute" }}
            aria-hidden="true"
          >
            {/* Sun core */}
            <circle cx="8" cy="8" r="3" fill="currentColor" />
            {/* Rays */}
            <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <line x1="8" y1="1.5" x2="8" y2="3" />
              <line x1="8" y1="13" x2="8" y2="14.5" />
              <line x1="1.5" y1="8" x2="3" y2="8" />
              <line x1="13" y1="8" x2="14.5" y2="8" />
              <line x1="3.2" y1="3.2" x2="4.3" y2="4.3" />
              <line x1="11.7" y1="11.7" x2="12.8" y2="12.8" />
              <line x1="3.2" y1="12.8" x2="4.3" y2="11.7" />
              <line x1="11.7" y1="4.3" x2="12.8" y2="3.2" />
            </g>
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
  );
}
