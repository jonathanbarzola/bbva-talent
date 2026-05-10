"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BBVA } from "@/lib/bbva-colors";
import type { TeamCompositionResponse, SDAProject } from "@/lib/types";

interface ExportTeamMenuProps {
  project: SDAProject;
  team: TeamCompositionResponse;
}

type CopyState = "idle" | "summary" | "link";

function buildSummary(project: SDAProject, team: TeamCompositionResponse): string {
  const lines: string[] = [];
  lines.push(`BBVA Talent — Equipo recomendado para ${project.codigo} ${project.nombre}`);
  lines.push(`Dominio: ${project.dominio} · Estado: ${project.estado}`);
  lines.push(`Cobertura: ${team.coverage_score}% · Skills totales: ${team.total_skills}`);
  lines.push("");

  for (const role of team.roles) {
    lines.push(`▸ ${role.role} — ${Math.min(role.candidates.length, role.quantity)}/${role.quantity} cubiertos`);
    const assigned = role.candidates.slice(0, role.quantity);
    for (const c of assigned) {
      const score = Math.round(c.score * 100);
      const trust = c.trust_score ? ` · Trust ${c.trust_score.overall}/${c.trust_score.tier}` : "";
      const avail = c.disponibilidad ? ` · ${c.disponibilidad}` : "";
      lines.push(`   • ${c.nombre} (${c.nivel}, ${c.squad}) — match ${score}%${trust}${avail}`);
    }
    if (role.candidates.length > role.quantity) {
      const reserves = role.candidates.slice(role.quantity);
      lines.push(`   Reservas: ${reserves.map(r => `${r.nombre} (${Math.round(r.score * 100)}%)`).join(", ")}`);
    }
    lines.push("");
  }

  if (team.gaps.length > 0) {
    lines.push(`⚠ Gaps detectados: ${team.gaps.join(", ")}`);
  }

  lines.push("");
  lines.push(`Generado por BBVA Talent · ${new Date().toLocaleString("es-AR")}`);
  return lines.join("\n");
}

function buildShareUrl(project: SDAProject): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.origin);
  url.searchParams.set("demo", project.codigo);
  return url.toString();
}

export default function ExportTeamMenu({ project, team }: ExportTeamMenuProps) {
  const [open, setOpen] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const ref = useRef<HTMLDivElement>(null);

  // Click outside closes menu
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  const handlePrint = () => {
    setOpen(false);
    setTimeout(() => window.print(), 80);
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildSummary(project, team));
      setCopyState("summary");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("idle");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(buildShareUrl(project));
      setCopyState("link");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("idle");
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        title="Exportar equipo"
        aria-label="Exportar equipo"
        aria-expanded={open}
        className="flex items-center gap-2 px-3 py-2 rounded-xl font-mono text-[11px] font-bold transition-all"
        style={{
          background: open ? `${BBVA.lime}24` : `${BBVA.lime}10`,
          border: `1px solid ${open ? BBVA.lime + "55" : BBVA.lime + "30"}`,
          color: BBVA.lime,
          cursor: "pointer",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = `${BBVA.lime}24`;
          (e.currentTarget as HTMLElement).style.boxShadow = `0 0 18px ${BBVA.lime}40`;
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = open ? `${BBVA.lime}24` : `${BBVA.lime}10`;
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
      >
        <span style={{ fontSize: 12 }}>↗</span>
        <span className="hidden sm:inline">Exportar</span>
        <span className="opacity-60">▾</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full mt-2 w-72 rounded-xl overflow-hidden z-30"
            style={{
              background: "var(--theme-bg-surface-strong)",
              border: `1px solid ${BBVA.lime}30`,
              boxShadow: `0 18px 48px rgba(0,0,0,0.45), 0 0 30px ${BBVA.lime}1a`,
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="px-3 py-2" style={{ borderBottom: "1px solid rgba(133,200,255,0.06)" }}>
              <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--theme-text-dim)" }}>
                Compartir equipo
              </p>
              <p className="font-bold text-xs leading-tight mt-0.5 truncate" style={{ color: "var(--theme-text-primary)" }}>
                {project.codigo} · {project.nombre}
              </p>
            </div>

            <MenuItem
              icon="🖨"
              title="Imprimir / Guardar PDF"
              detail="Hoja-resumen del equipo"
              onClick={handlePrint}
            />
            <MenuItem
              icon="📋"
              title={copyState === "summary" ? "✓ Resumen copiado" : "Copiar resumen"}
              detail="Texto plano para Google Chat o email"
              onClick={handleCopySummary}
              highlighted={copyState === "summary"}
            />
            <MenuItem
              icon="🔗"
              title={copyState === "link" ? "✓ Link copiado" : "Copiar link de demo"}
              detail="Deep-link reproducible"
              onClick={handleCopyLink}
              highlighted={copyState === "link"}
            />

            <div className="px-3 py-2" style={{ borderTop: "1px solid rgba(133,200,255,0.06)", background: "var(--theme-bg-overlay-soft)" }}>
              <p className="font-mono text-[9px] leading-relaxed" style={{ color: "var(--theme-text-dim)" }}>
                ⓘ En producción se generará PDF con branding BBVA y firma digital del manager.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({
  icon,
  title,
  detail,
  onClick,
  highlighted = false,
}: {
  icon: string;
  title: string;
  detail: string;
  onClick: () => void;
  highlighted?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors"
      style={{
        background: highlighted ? `${BBVA.lime}10` : "transparent",
        cursor: "pointer",
      }}
      onMouseEnter={e => { if (!highlighted) (e.currentTarget as HTMLElement).style.background = "var(--theme-tile-soft)"; }}
      onMouseLeave={e => { if (!highlighted) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      <span style={{ fontSize: 14, lineHeight: "20px" }}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-xs leading-tight" style={{ color: highlighted ? BBVA.lime : "var(--theme-text-primary)" }}>
          {title}
        </p>
        <p className="font-mono text-[10px] mt-0.5" style={{ color: "var(--theme-text-muted)" }}>
          {detail}
        </p>
      </div>
    </button>
  );
}
