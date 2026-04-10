"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { BBVA, NODE_COLORS } from "@/lib/bbva-colors";
import type { GraphResponse, GraphNode, EmpleadoResult } from "@/lib/types";

const TalentGraph = dynamic(() => import("./TalentGraph"), { ssr: false });

interface ConstellationViewProps {
  graphData: GraphResponse;
  employee: EmpleadoResult;
  onBack: () => void;
  onExploreEmployee: (employeeId: string) => void;
}

export default function ConstellationView({
  graphData,
  employee,
  onBack,
  onExploreEmployee,
}: ConstellationViewProps) {
  const [visible, setVisible]         = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      setSelectedNode(node);
      if (node.type === "colaborador") {
        const empId = node.id.replace(/^emp_/, "");
        onExploreEmployee(empId);
      }
    },
    [onExploreEmployee]
  );

  const score = Math.round(employee.score * 100);
  const initials = employee.nombre.split(" ").map(n => n[0]).slice(0, 2).join("");

  const nodeStats = {
    habilidades: graphData.nodes.filter(n => n.type === "habilidad").length,
    proyectos:   graphData.nodes.filter(n => n.type === "proyecto").length,
    colaboradores: graphData.nodes.filter(n => n.type === "colaborador").length,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        background: "#050a14",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.35s ease",
      }}
    >
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{
          borderBottom: "1px solid rgba(133,200,255,0.08)",
          background: "rgba(5,10,20,0.95)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 hover:opacity-80"
            style={{
              background: "rgba(133,200,255,0.06)",
              border: "1px solid rgba(133,200,255,0.12)",
              color: BBVA.sereneBlue,
            }}
          >
            ← Volver
          </button>

          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #001391, #0020cc)",
                color: "#fff",
                boxShadow: "0 0 12px rgba(0,19,145,0.4)",
              }}
            >
              {initials}
            </div>
            <div>
              <span className="font-bold text-sm" style={{ color: "#e8eeff" }}>
                {employee.nombre}
              </span>
              <span className="font-mono text-[10px] ml-2" style={{ color: "#3d4f6e" }}>
                {employee.rol}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mini stats */}
          {[
            { label: "Skills", value: nodeStats.habilidades, color: BBVA.lime },
            { label: "Proyectos", value: nodeStats.proyectos, color: BBVA.mandarin },
            { label: "Colabs", value: nodeStats.colaboradores, color: BBVA.sereneBlue },
          ].map(stat => (
            <div key={stat.label} className="hidden sm:flex items-center gap-1.5">
              <span className="font-black font-mono text-sm" style={{ color: stat.color }}>
                {stat.value}
              </span>
              <span className="font-mono text-[9px]" style={{ color: "#3d4f6e" }}>
                {stat.label}
              </span>
            </div>
          ))}

          <div
            className="font-mono text-[10px] px-2 py-1 rounded-lg"
            style={{ background: "rgba(133,200,255,0.06)", color: "#3d4f6e" }}
          >
            Constelación 360°
          </div>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar */}
        <aside
          className="w-80 flex-shrink-0 overflow-y-auto flex flex-col"
          style={{
            borderRight: "1px solid rgba(133,200,255,0.08)",
            background: "rgba(5,10,20,0.6)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Employee card */}
          <div className="p-5 border-b" style={{ borderColor: "rgba(133,200,255,0.08)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-lg relative overflow-hidden flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #001391, #0020cc)", color: "#fff", boxShadow: "0 0 20px rgba(0,19,145,0.4)" }}
              >
                {initials}
                <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)" }} />
              </div>
              <div>
                <p className="font-bold text-base leading-tight" style={{ color: "#e8eeff" }}>{employee.nombre}</p>
                <p className="text-sm mt-0.5" style={{ color: BBVA.sereneBlue }}>{employee.rol}</p>
                <p className="font-mono text-xs mt-0.5" style={{ color: "#3d4f6e" }}>{employee.squad}</p>
              </div>
            </div>

            {/* Score */}
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: "rgba(136,231,131,0.08)", border: "1px solid rgba(136,231,131,0.18)" }}
            >
              <span className="font-mono text-sm" style={{ color: "#3d4f6e" }}>Match score</span>
              <span className="font-black font-mono text-3xl leading-none" style={{ color: BBVA.lime }}>
                {score}<span className="text-sm font-normal ml-0.5" style={{ color: "#3d4f6e" }}>%</span>
              </span>
            </div>

            {/* Meta */}
            <div className="mt-3 space-y-2">
              {[
                { label: "Nivel", value: employee.nivel },
                { label: "Ubicación", value: employee.ubicacion },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="font-mono text-xs" style={{ color: "#3d4f6e" }}>{label}</span>
                  <span className="font-mono text-sm font-medium" style={{ color: "#6b7fa3" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div className="p-5 border-b" style={{ borderColor: "rgba(133,200,255,0.08)" }}>
            <p className="font-mono text-xs uppercase tracking-widest mb-2.5" style={{ color: "#3d4f6e" }}>
              Bio
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#4d6080" }}>
              {employee.bio}
            </p>
          </div>

          {/* Skills */}
          <div className="p-5 border-b" style={{ borderColor: "rgba(133,200,255,0.08)" }}>
            <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: "#3d4f6e" }}>
              Habilidades ({employee.habilidades.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {employee.habilidades.map((skill, i) => {
                const colors = [BBVA.lime, BBVA.ice, BBVA.sereneBlue, BBVA.purple, BBVA.canary];
                const c = colors[i % colors.length];
                return (
                  <span
                    key={skill.nombre}
                    className="px-2.5 py-1 rounded-md font-mono text-xs"
                    style={{ background: `${c}12`, color: c, border: `1px solid ${c}30` }}
                  >
                    {skill.nombre}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Projects */}
          <div className="p-5 border-b" style={{ borderColor: "rgba(133,200,255,0.08)" }}>
            <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: "#3d4f6e" }}>
              Proyectos ({employee.proyectos.length})
            </p>
            <div className="space-y-2.5">
              {employee.proyectos.map(proj => (
                <div
                  key={proj.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                  style={{ background: `${BBVA.mandarin}0a`, border: `1px solid ${BBVA.mandarin}28` }}
                >
                  <span className="font-mono text-sm" style={{ color: BBVA.mandarin }}>
                    {proj.nombre}
                  </span>
                  <span
                    className="font-mono text-xs px-2 py-0.5 rounded font-bold"
                    style={{
                      background: proj.estado === "En Producción" ? `${BBVA.lime}18` : `${BBVA.canary}18`,
                      color: proj.estado === "En Producción" ? BBVA.lime : BBVA.canary,
                    }}
                  >
                    {proj.estado === "En Producción" ? "PROD" : "DEV"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Collaborators */}
          <div className="p-5">
            <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: "#3d4f6e" }}>
              Red de colaboración ({employee.colaboradores.length})
            </p>
            <div className="space-y-2.5">
              {employee.colaboradores.map((colab, i) => (
                <button
                  key={colab.id}
                  onClick={() => onExploreEmployee(colab.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left"
                  style={{ background: "rgba(133,200,255,0.04)", border: "1px solid rgba(133,200,255,0.08)", cursor: "pointer" }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(133,200,255,0.09)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(133,200,255,0.22)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(133,200,255,0.04)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(133,200,255,0.08)";
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ background: `hsl(${210 + i * 40}, 50%, 20%)`, color: BBVA.sereneBlue }}
                  >
                    {colab.nombre.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm truncate font-medium" style={{ color: "#8099b8" }}>
                      {colab.nombre}
                    </p>
                    <p className="font-mono text-xs truncate" style={{ color: "#3d4f6e" }}>
                      {colab.rol}
                    </p>
                  </div>
                  <div className="font-mono text-sm font-bold flex-shrink-0" style={{ color: BBVA.lime }}>
                    {Math.round(colab.weight * 100)}%
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Graph — takes all remaining space */}
        <div className="flex-1 relative">
          {/* Subtle label */}
          <div
            className="absolute top-4 right-4 z-10 font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(5,10,20,0.8)",
              border: "1px solid rgba(133,200,255,0.08)",
              color: "#3d4f6e",
            }}
          >
            Click en colaborador para explorar su grafo
          </div>

          <TalentGraph
            data={graphData}
            onNodeClick={handleNodeClick}
            height={undefined}
            fullscreen
          />
        </div>
      </div>
    </div>
  );
}
