"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BBVA } from "@/lib/bbva-colors";
import { useCurrentUser, listCurrentUserOptions, type CurrentUserOption } from "@/lib/current-user";
import type { Nivel } from "@/lib/types";

const NIVEL_COLOR: Record<Nivel, string> = {
  Analyst:   BBVA.ice,
  Associate: BBVA.canary,
  Expert:    BBVA.mandarin,
};

const NIVEL_ORDER: Nivel[] = ["Analyst", "Associate", "Expert"];

function initials(name: string): string {
  return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

interface Props {
  /** Compact mode — only shows the avatar + nivel chip, no name. Useful for tight nav. */
  compact?: boolean;
}

export default function CurrentUserSelector({ compact = false }: Props) {
  const { user, userId, setUserId, mounted } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Anti-FOUC placeholder
  if (!mounted || !user) {
    return (
      <span
        aria-hidden="true"
        style={{
          display: "inline-block",
          width: compact ? 30 : 100,
          height: 30,
          borderRadius: 999,
          background: "var(--theme-tile-soft)",
          border: "1px solid var(--theme-border-soft)",
        }}
      />
    );
  }

  const nivelColor = NIVEL_COLOR[user.nivel];
  const options = listCurrentUserOptions();
  const grouped = NIVEL_ORDER.map(nivel => ({
    nivel,
    options: options.filter(o => o.nivel === nivel),
  }));

  return (
    <div ref={ref} className="relative" data-testid="current-user-selector">
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Cambiar usuario activo · actualmente ${user.nombre}`}
        title={`Estás viendo la app como ${user.nombre} (${user.nivel})`}
        className="flex items-center gap-2 px-2 py-1 rounded-lg transition-all duration-150 hover:opacity-90"
        style={{
          background: "var(--theme-tile-medium)",
          border: `1px solid ${nivelColor}40`,
          cursor: "pointer",
        }}
      >
        {/* Avatar */}
        <div
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px]"
          style={{
            background: "linear-gradient(135deg, #001391, #0020cc)",
            color: "#fff",
            boxShadow: `0 0 6px rgba(0,19,145,0.4)`,
          }}
        >
          {initials(user.nombre)}
        </div>

        {!compact && (
          <span className="font-mono text-[11px] font-bold leading-none" style={{ color: "var(--theme-text-primary)" }}>
            {user.nombre.split(" ")[0]}
          </span>
        )}

        <span
          className="font-mono text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
          style={{ background: `${nivelColor}1c`, color: nivelColor, border: `1px solid ${nivelColor}40` }}
        >
          {user.nivel}
        </span>

        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" style={{ color: "var(--theme-text-dim)" }}>
          <path d="M2 3.5L4.5 6L7 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-label="Selector de usuario activo"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 mt-2 w-[300px] max-h-[440px] overflow-y-auto rounded-xl z-50"
            style={{
              background: "var(--theme-bg-surface-strong)",
              border: "1px solid rgba(133,200,255,0.18)",
              boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="px-3 py-2 sticky top-0" style={{ background: "var(--theme-bg-surface-strong)", borderBottom: "1px solid rgba(133,200,255,0.10)" }}>
              <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--theme-text-dim)" }}>
                Demo · Cambiar usuario
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--theme-text-muted)" }}>
                Estás viendo la app como esta persona.
              </p>
            </div>

            {grouped.map(({ nivel, options: opts }) => {
              if (opts.length === 0) return null;
              const c = NIVEL_COLOR[nivel];
              return (
                <div key={nivel} className="px-2 py-2">
                  <p className="font-mono text-[9px] uppercase tracking-widest font-bold px-2 mb-1.5" style={{ color: c }}>
                    {nivel} · {opts.length}
                  </p>
                  <div className="space-y-0.5">
                    {opts.map(opt => (
                      <UserOption
                        key={opt.id}
                        opt={opt}
                        active={opt.id === userId}
                        onSelect={() => { setUserId(opt.id); setOpen(false); }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UserOption({
  opt,
  active,
  onSelect,
}: {
  opt: CurrentUserOption;
  active: boolean;
  onSelect: () => void;
}) {
  const c = NIVEL_COLOR[opt.nivel];
  return (
    <button
      role="option"
      aria-selected={active}
      onClick={onSelect}
      className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors"
      style={{
        background: active ? "var(--theme-tile-medium)" : "transparent",
        border: active ? `1px solid ${c}40` : "1px solid transparent",
        cursor: "pointer",
      }}
      onMouseEnter={e => {
        if (!active) (e.currentTarget as HTMLElement).style.background = "var(--theme-tile-soft)";
      }}
      onMouseLeave={e => {
        if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <div
        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px]"
        style={{ background: "linear-gradient(135deg, #001391, #0020cc)", color: "#fff" }}
      >
        {initials(opt.nombre)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[12px] leading-tight truncate" style={{ color: "var(--theme-text-primary)" }}>
          {opt.nombre}
        </p>
        <p className="font-mono text-[9px] truncate" style={{ color: "var(--theme-text-dim)" }}>
          {opt.rol} · {opt.squad}
        </p>
      </div>
      {active && (
        <span className="font-mono text-[10px] font-bold" style={{ color: c }}>
          ✓
        </span>
      )}
    </button>
  );
}
