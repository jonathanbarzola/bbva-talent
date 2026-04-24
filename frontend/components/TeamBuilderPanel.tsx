"use client";

import { useMemo, useState } from "react";
import { BBVA } from "@/lib/bbva-colors";
import type { EmpleadoResult } from "@/lib/types";

interface TeamBuilderPanelProps {
  selected: EmpleadoResult[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

const SKILL_COLORS = [
  BBVA.lime, BBVA.ice, BBVA.sereneBlue, BBVA.purple, BBVA.canary, BBVA.mandarin,
];

export default function TeamBuilderPanel({ selected, onRemove, onClear }: TeamBuilderPanelProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const teamSkills = useMemo(() => {
    const map = new Map<string, { count: number; color: string }>();
    let colorIdx = 0;
    for (const emp of selected) {
      for (const sk of emp.habilidades) {
        if (!map.has(sk.nombre)) {
          map.set(sk.nombre, { count: 0, color: SKILL_COLORS[colorIdx++ % SKILL_COLORS.length] });
        }
        map.get(sk.nombre)!.count++;
      }
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 14);
  }, [selected]);

  const coveragePct = Math.min(100, Math.round((teamSkills.length / 10) * 100));

  const handleAnalyze = () => {
    if (selected.length < 2 || analyzing) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
      setTimeout(() => setAnalyzed(false), 3000);
    }, 1400);
  };

  if (selected.length === 0) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: "rgba(5,10,20,0.97)",
        borderTop: "1px solid rgba(133,200,255,0.18)",
        backdropFilter: "blur(24px)",
        boxShadow: "0 -20px 60px rgba(0,19,145,0.3)",
        animation: "slideUp 0.35s cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-5 overflow-x-auto">

        {/* Label */}
        <div className="flex-shrink-0 min-w-[72px]">
          <p className="font-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: "#3d4f6e" }}>
            Equipo
          </p>
          <p className="font-black text-2xl leading-none" style={{ color: BBVA.lime }}>
            {selected.length}
            <span className="font-mono text-xs font-normal ml-1" style={{ color: "#3d4f6e" }}>
              {selected.length === 1 ? "persona" : "personas"}
            </span>
          </p>
        </div>

        {/* Divider */}
        <div className="w-px self-stretch flex-shrink-0" style={{ background: "rgba(133,200,255,0.1)" }} />

        {/* Members avatars */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {selected.map((emp, i) => {
            const initials = emp.nombre.split(" ").map(n => n[0]).slice(0, 2).join("");
            return (
              <button
                key={emp.id}
                onClick={() => onRemove(emp.id)}
                title={`Quitar a ${emp.nombre}`}
                className="group relative w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 transition-all duration-200"
                style={{
                  background: `linear-gradient(135deg, hsl(${215 + i * 28},55%,18%), hsl(${235 + i * 28},55%,28%))`,
                  border: "1px solid rgba(133,200,255,0.22)",
                  color: BBVA.sereneBlue,
                  cursor: "pointer",
                }}
              >
                {initials}
                <div
                  className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  style={{ background: "rgba(220,50,50,0.65)", fontSize: 14, color: "#fff" }}
                >
                  ×
                </div>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-px self-stretch flex-shrink-0" style={{ background: "rgba(133,200,255,0.1)" }} />

        {/* Coverage bar + skills */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "#3d4f6e" }}>
              Cobertura de skills — {teamSkills.length} únicas
            </p>
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(133,200,255,0.08)", maxWidth: 120 }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${coveragePct}%`,
                  background: `linear-gradient(90deg, ${BBVA.electricBlue}, ${BBVA.sereneBlue}, ${BBVA.lime})`,
                }}
              />
            </div>
            <span className="font-mono text-xs font-bold" style={{ color: BBVA.sereneBlue }}>{coveragePct}%</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {teamSkills.map(([name, { count, color }]) => (
              <span
                key={name}
                className="px-2 py-0.5 rounded font-mono text-[10px]"
                style={{
                  background: count > 1 ? `${color}22` : `${color}0f`,
                  color: count > 1 ? color : color + "99",
                  border: `1px solid ${count > 1 ? color + "50" : color + "22"}`,
                }}
              >
                {name}{count > 1 ? <span style={{ opacity: 0.6 }}> ×{count}</span> : null}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onClear}
            className="px-3 py-2 rounded-lg text-xs font-mono transition-all duration-150 hover:opacity-80"
            style={{
              background: "rgba(133,200,255,0.05)",
              border: "1px solid rgba(133,200,255,0.12)",
              color: "#3d4f6e",
              cursor: "pointer",
            }}
          >
            Limpiar
          </button>
          <button
            onClick={handleAnalyze}
            disabled={selected.length < 2 || analyzing}
            className="px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-300"
            style={{
              background: analyzed
                ? `linear-gradient(135deg, ${BBVA.lime}aa, #00aa44)`
                : "linear-gradient(135deg, #001391, #0020cc)",
              color: "#fff",
              letterSpacing: "0.07em",
              boxShadow: analyzed
                ? `0 0 20px ${BBVA.lime}44`
                : "0 0 20px rgba(0,19,145,0.45)",
              cursor: selected.length >= 2 && !analyzing ? "pointer" : "not-allowed",
              opacity: selected.length < 2 ? 0.5 : 1,
              minWidth: 140,
            }}
          >
            {analyzed ? "¡Equipo listo! ✓" : analyzing ? "Analizando..." : "Analizar Equipo →"}
          </button>
        </div>
      </div>
    </div>
  );
}
