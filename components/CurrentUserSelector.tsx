"use client";

import { BBVA } from "@/lib/bbva-colors";
import { useCurrentUser } from "@/lib/current-user";
import type { Nivel } from "@/lib/types";

const NIVEL_COLOR: Record<Nivel, string> = {
  Analyst:   BBVA.ice,
  Associate: BBVA.canary,
  Expert:    BBVA.mandarin,
};

function initials(name: string): string {
  return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

interface Props {
  /** Compact mode — avatar + nivel chip only, no name. Useful for tight navs. */
  compact?: boolean;
}

/**
 * Static display of the "current user" for the demo. Previously this was an
 * interactive dropdown to switch between mock employees, but the dropdown
 * had reliability issues so it was simplified to a read-only chip pointing
 * at the default user from lib/current-user.ts (DEFAULT_USER_ID).
 *
 * The underlying useCurrentUser hook still works the same way — pages like
 * /me and /dashboard read the current user from there.
 */
export default function CurrentUserSelector({ compact = false }: Props) {
  const { user, mounted } = useCurrentUser();

  // Anti-FOUC placeholder while the hook resolves from localStorage.
  if (!mounted || !user) {
    return (
      <span
        aria-hidden="true"
        style={{
          display: "inline-block",
          width: compact ? 30 : 140,
          height: 30,
          borderRadius: 999,
          background: "var(--theme-tile-soft)",
          border: "1px solid var(--theme-border-soft)",
        }}
      />
    );
  }

  const nivelColor = NIVEL_COLOR[user.nivel];

  return (
    <div
      className="flex items-center gap-2 px-2 py-1 rounded-lg"
      style={{
        background: "var(--theme-tile-medium)",
        border: `1px solid ${nivelColor}40`,
      }}
      title={`Estás viendo la app como ${user.nombre} (${user.nivel})`}
      data-testid="current-user-display"
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px]"
        style={{
          background: "linear-gradient(135deg, #001391, #0020cc)",
          color: "#fff",
          boxShadow: "0 0 6px rgba(0,19,145,0.4)",
        }}
      >
        {initials(user.nombre)}
      </div>

      {!compact && (
        <span className="flex items-baseline gap-1 leading-none">
          <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--theme-text-dim)" }}>
            Ver como
          </span>
          <span className="font-mono text-[11px] font-bold" style={{ color: "var(--theme-text-primary)" }}>
            {user.nombre.split(" ")[0]}
          </span>
        </span>
      )}

      <span
        className="font-mono text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
        style={{
          background: `color-mix(in srgb, ${nivelColor} 12%, transparent)`,
          color: nivelColor,
          border: `1px solid ${nivelColor}40`,
        }}
      >
        {user.nivel}
      </span>
    </div>
  );
}
