"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import dynamic from "next/dynamic";
import type { GraphNode, GraphLink, GraphResponse } from "@/lib/types";
import { NODE_COLORS, LINK_COLORS, BBVA } from "@/lib/bbva-colors";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <p className="text-sm text-shimmer font-mono">inicializando nodos...</p>
    </div>
  ),
});

interface TalentGraphProps {
  data: GraphResponse;
  onNodeClick?: (node: GraphNode) => void;
  height?: number;
  fullscreen?: boolean;
}

const NODE_RADIUS: Record<string, number> = {
  empleado:    10,
  colaborador:  8,
  habilidad:    5,
  proyecto:     7,
  concepto:     4,
};

const LEGEND_LABELS: Record<string, string> = {
  empleado:    "Empleado",
  colaborador: "Colaborador",
  habilidad:   "Habilidad",
  proyecto:    "Proyecto",
};

export default function TalentGraph({ data, onNodeClick, height = 560, fullscreen = false }: TalentGraphProps) {
  const graphRef     = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth]       = useState(0);
  const [canvasH, setCanvasH]   = useState(height);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const { width: w, height: h } = entries[0].contentRect;
      setWidth(w);
      if (fullscreen) setCanvasH(h);
    });
    ro.observe(containerRef.current);
    setWidth(containerRef.current.offsetWidth);
    if (fullscreen) setCanvasH(containerRef.current.offsetHeight);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!graphRef.current) return;
      try {
        graphRef.current.d3Force("charge")?.strength(-600);
        graphRef.current.d3Force("link")?.distance(90).strength(0.4);
        graphRef.current.d3ReheatSimulation?.();
      } catch { /* ForceGraph2D may not expose these in all versions */ }
    }, 50);
    return () => clearTimeout(t);
  }, [data]);

  useEffect(() => {
    const t = setTimeout(() => graphRef.current?.zoomToFit(600, 100), 1200);
    return () => clearTimeout(t);
  }, [data]);

  const paintNode = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const r     = NODE_RADIUS[node.type] ?? 8;
      const color = NODE_COLORS[node.type] ?? BBVA.grey3;
      const isHovered = hoveredNode?.id === node.id;
      const isCentral = node.type === "empleado";
      const x = node.x ?? 0;
      const y = node.y ?? 0;

      const glowRadius = isCentral ? r * 3.5 : r * 2.8;
      const glowSteps = [
        { radius: glowRadius,        alpha: isHovered ? 0.12 : 0.06 },
        { radius: glowRadius * 0.7,  alpha: isHovered ? 0.22 : 0.12 },
        { radius: glowRadius * 0.45, alpha: isHovered ? 0.35 : 0.22 },
      ];
      for (const step of glowSteps) {
        const grad = ctx.createRadialGradient(x, y, 0, x, y, step.radius);
        grad.addColorStop(0, color + Math.round(step.alpha * 255).toString(16).padStart(2, "0"));
        grad.addColorStop(1, color + "00");
        ctx.beginPath();
        ctx.arc(x, y, step.radius, 0, 2 * Math.PI);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      if (isCentral) {
        ctx.beginPath();
        ctx.arc(x, y, r + 3, 0, 2 * Math.PI);
        ctx.strokeStyle = `${color}66`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      if (isCentral) {
        const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
        grad.addColorStop(0, "#1a3aff");
        grad.addColorStop(1, color);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = color + (isHovered ? "ff" : "cc");
      }
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x - r * 0.28, y - r * 0.28, r * 0.22, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fill();

      const label    = node.label;
      const fontSize = Math.min(11, Math.max(8, 11 / globalScale));
      const isBold   = isCentral || node.type === "colaborador";
      ctx.font         = `${isBold ? "700" : "400"} ${fontSize}px Syne, sans-serif`;
      ctx.textAlign    = "center";
      ctx.textBaseline = "top";

      const textY = y + r + 4;
      const textWidth = ctx.measureText(label).width;
      ctx.fillStyle = "rgba(5,10,20,0.75)";
      ctx.beginPath();
      const pad = 3;
      ctx.roundRect(x - textWidth / 2 - pad, textY - 1, textWidth + pad * 2, fontSize + 4, 3);
      ctx.fill();

      ctx.fillStyle = isCentral ? "#ffffff" : `${color}ff`;
      ctx.shadowColor = color;
      ctx.shadowBlur  = isCentral ? 8 : 4;
      ctx.fillText(label, x, textY);
      ctx.shadowBlur = 0;
    },
    [hoveredNode]
  );

  const paintLink = useCallback((link: GraphLink, ctx: CanvasRenderingContext2D) => {
    const color  = LINK_COLORS[link.type] ?? BBVA.grey3;
    const source = link.source as GraphNode;
    const target = link.target as GraphNode;
    const sx = source.x ?? 0, sy = source.y ?? 0;
    const tx = target.x ?? 0, ty = target.y ?? 0;

    const weight = typeof link.properties?.weight === "number" ? link.properties.weight : 0.5;
    const lineWidth = link.type === "COLLABORATES_WITH" ? weight * 2.5 : 1.2;
    const alpha     = link.type === "COLLABORATES_WITH" ? Math.round(weight * 180) : 100;
    const alphaHex  = alpha.toString(16).padStart(2, "0");

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(tx, ty);
    ctx.strokeStyle = color + alphaHex;
    ctx.lineWidth   = lineWidth;
    ctx.stroke();
  }, []);

  const effectiveHeight = fullscreen ? "100%" : canvasH;

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${fullscreen ? "h-full rounded-none" : "rounded-2xl"}`}
      style={{
        height: effectiveHeight,
        background: "radial-gradient(ellipse at 30% 40%, #0a1628 0%, #050a14 70%)",
        border: fullscreen ? "none" : "1px solid rgba(133,200,255,0.12)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, rgba(133,200,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />

      <div
        className="absolute top-3 left-3 z-10 flex flex-col gap-2 rounded-xl p-3"
        style={{ background: "rgba(5,10,20,0.8)", border: "1px solid rgba(133,200,255,0.1)", backdropFilter: "blur(8px)" }}
      >
        <p className="font-mono text-[9px] uppercase tracking-widest mb-0.5" style={{ color: BBVA.grey4 }}>Leyenda</p>
        {Object.entries(LEGEND_LABELS).map(([type, label]) => (
          <div key={type} className="flex items-center gap-2">
            <div
              className="rounded-full flex-shrink-0"
              style={{ width: NODE_RADIUS[type], height: NODE_RADIUS[type], backgroundColor: NODE_COLORS[type], boxShadow: `0 0 6px ${NODE_COLORS[type]}88` }}
            />
            <span className="text-[10px] font-mono" style={{ color: "#6b7fa3" }}>{label}</span>
          </div>
        ))}
      </div>

      {hoveredNode && (
        <div
          className="absolute top-3 right-3 z-10 max-w-[200px] rounded-xl p-3"
          style={{ background: "rgba(5,10,20,0.9)", border: `1px solid ${NODE_COLORS[hoveredNode.type]}44`, backdropFilter: "blur(8px)", boxShadow: `0 0 20px ${NODE_COLORS[hoveredNode.type]}22` }}
        >
          <p className="font-bold text-xs mb-2 leading-tight" style={{ color: NODE_COLORS[hoveredNode.type] }}>
            {hoveredNode.label}
          </p>
          {Object.entries(hoveredNode.properties).slice(0, 3).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2 text-[10px] font-mono">
              <span style={{ color: "#3d4f6e" }}>{k}</span>
              <span style={{ color: "#6b7fa3" }} className="truncate max-w-[100px]">{String(v)}</span>
            </div>
          ))}
          {hoveredNode.type === "colaborador" && (
            <p className="text-[10px] mt-2 pt-2 border-t" style={{ borderColor: "rgba(133,200,255,0.1)", color: BBVA.sereneBlue }}>
              Click para explorar →
            </p>
          )}
        </div>
      )}

      {width > 0 && (
        <ForceGraph2D
          ref={graphRef}
          graphData={data}
          nodeId="id"
          nodeLabel={() => ""}
          nodeCanvasObject={paintNode as any}
          nodeCanvasObjectMode={() => "replace"}
          linkCanvasObject={paintLink as any}
          linkCanvasObjectMode={() => "replace"}
          onNodeClick={(node) => onNodeClick?.(node as GraphNode)}
          onNodeHover={(node) => setHoveredNode(node as GraphNode | null)}
          backgroundColor="transparent"
          width={width}
          height={canvasH}
          cooldownTicks={100}
          d3AlphaDecay={0.015}
          d3VelocityDecay={0.25}
          linkDirectionalParticles={3}
          linkDirectionalParticleSpeed={0.003}
          linkDirectionalParticleColor={(link: any) => LINK_COLORS[link.type] ?? BBVA.grey3}
          linkDirectionalParticleWidth={2.5}
          warmupTicks={30}
        />
      )}
    </div>
  );
}
