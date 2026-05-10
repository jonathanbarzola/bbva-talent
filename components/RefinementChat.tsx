"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BBVA } from "@/lib/bbva-colors";
import {
  parseCommand,
  type RefinementFilters,
  EMPTY_FILTERS,
  isEmpty,
  applyToTeam,
  summarizeImpact,
  type ParseAction,
} from "@/lib/mockChatRefinement";
import type { TeamCompositionResponse, AvailabilityStatus } from "@/lib/types";

interface RefinementChatProps {
  open: boolean;
  onClose: () => void;
  baseTeam: TeamCompositionResponse;
  filters: RefinementFilters;
  onFiltersChange: (filters: RefinementFilters) => void;
}

interface ChatMessage {
  id: string;
  author: "user" | "bot";
  text: string;
  impact?: string;
  kind?: "info" | "filter" | "reset" | "unknown" | "warning";
}

const SUGGESTIONS = [
  "Que tengan Python",
  "Sin nadie de vacaciones",
  "Solo Senior y Staff",
  "Quita los de Pagos",
  "Que sepan Kafka",
  "Sin asignados",
];

const SYSTEM_INTRO: ChatMessage = {
  id: "intro",
  author: "bot",
  kind: "info",
  text: "Hola, soy el asistente de refinamiento. Dime cómo quieres ajustar el equipo y filtro al instante. Prueba: \"que tengan Kafka\" o \"sin nadie de vacaciones\".",
};

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[10px] px-2 py-1 rounded-full"
      style={{ background: `${BBVA.purple}18`, color: BBVA.purple, border: `1px solid ${BBVA.purple}40` }}
    >
      {label}
      <button
        onClick={onRemove}
        className="opacity-70 hover:opacity-100 transition-opacity"
        style={{ cursor: "pointer", color: BBVA.purple }}
        aria-label={`Quitar filtro ${label}`}
      >
        ✕
      </button>
    </span>
  );
}

function TypingDots() {
  return (
    <div className="inline-flex items-center gap-1">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: BBVA.purple }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </div>
  );
}

export default function RefinementChat({
  open,
  onClose,
  baseTeam,
  filters,
  onFiltersChange,
}: RefinementChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([SYSTEM_INTRO]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const handleSubmit = (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || thinking) return;

    const userMsg: ChatMessage = { id: makeId("u"), author: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    setTimeout(() => {
      const action = parseCommand(text);
      const botMsg = applyAction(action);
      setMessages(prev => [...prev, botMsg]);
      setThinking(false);
    }, 520 + Math.random() * 280);
  };

  const applyAction = (action: ParseAction): ChatMessage => {
    if (action.type === "reset") {
      onFiltersChange(EMPTY_FILTERS);
      return { id: makeId("b"), author: "bot", kind: "reset", text: action.explain };
    }

    if (action.type === "info" || action.type === "unknown") {
      return { id: makeId("b"), author: "bot", kind: action.type, text: action.explain };
    }

    // type === "filter"
    const merged: RefinementFilters = {
      excludeSquads: dedupe([...filters.excludeSquads, ...(action.patch.excludeSquads ?? [])]),
      excludeAvailability: dedupe([...filters.excludeAvailability, ...(action.patch.excludeAvailability ?? [])]) as AvailabilityStatus[],
      requireSkills: dedupe([...filters.requireSkills, ...(action.patch.requireSkills ?? [])]),
      excludeLevels: dedupe([...filters.excludeLevels, ...(action.patch.excludeLevels ?? [])]),
      requireLevels: dedupe([...filters.requireLevels, ...(action.patch.requireLevels ?? [])]),
    };

    const before = baseTeam.roles;
    const refined = applyToTeam(baseTeam, merged);
    const impact = summarizeImpact(before, refined.roles);

    onFiltersChange(merged);

    return {
      id: makeId("b"),
      author: "bot",
      kind: refined.roles.every(r => r.candidates.length === 0) ? "warning" : "filter",
      text: action.explain,
      impact,
    };
  };

  const removeFilter = (kind: keyof RefinementFilters, value: string) => {
    const next: RefinementFilters = {
      ...filters,
      [kind]: filters[kind].filter(v => v !== value),
    };
    onFiltersChange(next);
    setMessages(prev => [
      ...prev,
      {
        id: makeId("b"),
        author: "bot",
        kind: "info",
        text: `Listo, quité el filtro "${value}" (${labelForKind(kind)}).`,
      },
    ]);
  };

  const handleClearAll = () => {
    onFiltersChange(EMPTY_FILTERS);
    setMessages(prev => [
      ...prev,
      {
        id: makeId("b"),
        author: "bot",
        kind: "reset",
        text: "Limpio todos los filtros. Volvemos al equipo original.",
      },
    ]);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.aside
        key="chat-aside"
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 30 }}
        className="fixed right-0 top-0 bottom-0 z-[80] flex flex-col"
        style={{
          width: "min(420px, 92vw)",
          background: "var(--theme-bg-overlay-strong)",
          borderLeft: `1px solid ${BBVA.purple}30`,
          boxShadow: `-20px 0 60px rgba(0,0,0,0.5)`,
          backdropFilter: "blur(24px)",
        }}
      >
        {/* Header */}
        <header
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(133,200,255,0.08)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${BBVA.purple}, #4a00b4)`, boxShadow: `0 0 20px ${BBVA.purple}55`, color: "#fff" }}
            >
              ✦
            </div>
            <div>
              <p className="font-black text-sm" style={{ color: "var(--theme-text-primary)" }}>Refina tu equipo</p>
              <p className="font-mono text-[10px]" style={{ color: BBVA.purple, opacity: 0.85 }}>Asistente conversacional · mock</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-2.5 py-1.5 rounded-lg font-mono text-[10px] transition-opacity hover:opacity-80"
            style={{ background: "var(--theme-tile-medium)", border: "1px solid rgba(133,200,255,0.14)", color: "var(--theme-text-muted)", cursor: "pointer" }}
            aria-label="Cerrar chat"
          >
            ✕ Cerrar
          </button>
        </header>

        {/* Active filters */}
        {!isEmpty(filters) && (
          <div className="px-5 py-3 flex flex-wrap gap-1.5 items-center" style={{ borderBottom: "1px solid rgba(133,200,255,0.06)", background: `${BBVA.purple}06` }}>
            <span className="font-mono text-[9px] uppercase tracking-widest mr-1" style={{ color: "var(--theme-text-muted)" }}>
              Filtros activos
            </span>
            {filters.excludeSquads.map(s => (
              <FilterChip key={`sq-${s}`} label={`✕ ${s}`} onRemove={() => removeFilter("excludeSquads", s)} />
            ))}
            {filters.excludeAvailability.map(s => (
              <FilterChip key={`av-${s}`} label={`✕ ${s}`} onRemove={() => removeFilter("excludeAvailability", s)} />
            ))}
            {filters.requireSkills.map(s => (
              <FilterChip key={`sk-${s}`} label={`+ ${s}`} onRemove={() => removeFilter("requireSkills", s)} />
            ))}
            {filters.requireLevels.map(s => (
              <FilterChip key={`rl-${s}`} label={`solo ${s}`} onRemove={() => removeFilter("requireLevels", s)} />
            ))}
            {filters.excludeLevels.map(s => (
              <FilterChip key={`el-${s}`} label={`✕ ${s}`} onRemove={() => removeFilter("excludeLevels", s)} />
            ))}
            <button
              onClick={handleClearAll}
              className="ml-auto font-mono text-[10px] underline transition-opacity hover:opacity-80"
              style={{ color: "var(--theme-text-muted)", cursor: "pointer" }}
            >
              limpiar todo
            </button>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ scrollbarWidth: "thin" }}>
          {messages.map(msg => (
            <MessageRow key={msg.id} msg={msg} />
          ))}
          {thinking && (
            <div className="flex items-end gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-black"
                style={{ background: `linear-gradient(135deg, ${BBVA.purple}, #4a00b4)`, color: "#fff" }}
              >
                ✦
              </div>
              <div
                className="rounded-2xl px-3 py-2"
                style={{ background: "rgba(150,148,255,0.07)", border: `1px solid ${BBVA.purple}22` }}
              >
                <TypingDots />
              </div>
            </div>
          )}
        </div>

        {/* Suggestion chips */}
        <div className="px-5 py-2.5 flex flex-wrap gap-1.5" style={{ borderTop: "1px solid rgba(133,200,255,0.06)" }}>
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => handleSubmit(s)}
              disabled={thinking}
              className="font-mono text-[10px] px-2 py-1 rounded-lg transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ background: "var(--theme-tile-soft)", border: "1px solid rgba(133,200,255,0.12)", color: "var(--theme-text-secondary)", cursor: thinking ? "not-allowed" : "pointer" }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-5 py-3 flex items-center gap-2 flex-shrink-0" style={{ borderTop: "1px solid rgba(133,200,255,0.08)" }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
            placeholder='Ej: "que tengan Kafka"'
            disabled={thinking}
            className="flex-1 px-3 py-2 rounded-lg text-sm font-mono outline-none"
            style={{
              background: "var(--theme-bg-surface)",
              border: "1px solid rgba(133,200,255,0.14)",
              color: "var(--theme-text-primary)",
            }}
          />
          <button
            onClick={() => handleSubmit()}
            disabled={!input.trim() || thinking}
            className="px-4 py-2 rounded-lg font-black text-[11px] uppercase tracking-wider transition-all"
            style={{
              background: input.trim() && !thinking
                ? `linear-gradient(135deg, ${BBVA.purple}, #4a00b4)`
                : "var(--theme-tile-medium)",
              color: input.trim() && !thinking ? "#fff" : "var(--theme-text-dim)",
              boxShadow: input.trim() && !thinking ? `0 0 18px ${BBVA.purple}40` : "none",
              cursor: input.trim() && !thinking ? "pointer" : "not-allowed",
            }}
          >
            Enviar
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

function MessageRow({ msg }: { msg: ChatMessage }) {
  if (msg.author === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex justify-end"
      >
        <div
          className="rounded-2xl px-3.5 py-2 max-w-[80%]"
          style={{ background: `linear-gradient(135deg, ${BBVA.electricBlue}, #0020cc)`, color: "#fff" }}
        >
          <p className="text-sm leading-relaxed">{msg.text}</p>
        </div>
      </motion.div>
    );
  }

  const accent =
    msg.kind === "warning" ? "#fb923c" :
    msg.kind === "filter" ? BBVA.purple :
    msg.kind === "reset" ? BBVA.lime :
    msg.kind === "unknown" ? BBVA.canary :
    BBVA.sereneBlue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="flex items-start gap-2"
    >
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-black"
        style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: "#fff" }}
      >
        ✦
      </div>
      <div
        className="rounded-2xl px-3 py-2 flex-1"
        style={{ background: `${accent}10`, border: `1px solid ${accent}28` }}
      >
        <p className="text-[13px] leading-relaxed" style={{ color: "var(--theme-text-primary)" }}>{msg.text}</p>
        {msg.impact && (
          <p className="font-mono text-[10px] mt-1.5 px-2 py-1 rounded inline-block" style={{ background: `${accent}1a`, color: accent }}>
            {msg.impact}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function labelForKind(kind: keyof RefinementFilters): string {
  const labels: Record<keyof RefinementFilters, string> = {
    excludeSquads: "squad excluido",
    excludeAvailability: "disponibilidad excluida",
    requireSkills: "skill requerida",
    excludeLevels: "nivel excluido",
    requireLevels: "nivel requerido",
  };
  return labels[kind];
}
