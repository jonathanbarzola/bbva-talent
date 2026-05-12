"use client";

import { useEffect, useState, useCallback } from "react";
import { CANDIDATE_POOL } from "./mock-data";
import type { EmpleadoResult, Nivel } from "./types";

// v2 invalidates the previous key — anyone with emp_001 cached from a prior
// session now falls back to the new DEFAULT_USER_ID (Jonathan).
const STORAGE_KEY = "bbva-talent:current-user-id-v2";
const DEFAULT_USER_ID = "emp_jonathan"; // Jonathan Barzola · Analyst · Experiencia Digital

/** Custom event so other CurrentUserSelector instances re-render in sync. */
const CHANGE_EVENT = "bbva-talent:current-user-changed";

export function readCurrentUserId(): string {
  if (typeof window === "undefined") return DEFAULT_USER_ID;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && CANDIDATE_POOL[stored]) return stored;
  } catch { /* ignore */ }
  return DEFAULT_USER_ID;
}

export function writeCurrentUserId(id: string): void {
  if (typeof window === "undefined") return;
  if (!CANDIDATE_POOL[id]) return; // ignore invalid
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: id }));
  } catch { /* ignore */ }
}

/**
 * Reactive hook for the currently-selected "logged in" user.
 * Returns the full EmpleadoResult and a setter.
 * Re-renders when the user is changed from any component.
 */
export function useCurrentUser(): {
  user: EmpleadoResult | null;
  userId: string;
  setUserId: (id: string) => void;
  mounted: boolean;
} {
  const [userId, setUserId] = useState<string>(DEFAULT_USER_ID);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setUserId(readCurrentUserId());
    setMounted(true);

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail) setUserId(detail);
    };
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, []);

  const set = useCallback((id: string) => {
    if (!CANDIDATE_POOL[id]) return;
    writeCurrentUserId(id);
    setUserId(id);
  }, []);

  const user = mounted ? (CANDIDATE_POOL[userId] ?? null) : null;
  return { user, userId, setUserId: set, mounted };
}

/** All available "switch to" candidates, grouped by Nivel. */
export interface CurrentUserOption {
  id: string;
  nombre: string;
  rol: string;
  squad: string;
  nivel: Nivel;
}

export function listCurrentUserOptions(): CurrentUserOption[] {
  return Object.values(CANDIDATE_POOL).map(emp => ({
    id: emp.id,
    nombre: emp.nombre,
    rol: emp.rol,
    squad: emp.squad,
    nivel: emp.nivel,
  }));
}
