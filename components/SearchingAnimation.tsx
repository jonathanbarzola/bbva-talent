"use client";

import { useEffect, useState } from "react";
import { BBVA } from "@/lib/bbva-colors";

interface Step {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
  color: string;
  duration: number;
}

const STEPS: Step[] = [
  { id: "jira",     label: "Jira",              sublabel: "Analizando tickets y proyectos activos",     icon: "J",  color: "#2684FF", duration: 700  },
  { id: "github",   label: "GitHub",             sublabel: "Escaneando contribuciones y repositorios",   icon: "G",  color: "#6e40c9", duration: 1400 },
  { id: "bitbucket",label: "Bitbucket",          sublabel: "Revisando historial de commits y PRs",       icon: "B",  color: "#0747A6", duration: 2100 },
  { id: "gmeet",    label: "Google Meet",        sublabel: "Mapeando red de colaboración y reuniones",   icon: "M",  color: "#00AC47", duration: 2700 },
  { id: "openai",   label: "OpenAI Embeddings",  sublabel: "Generando vectores semánticos con GPT-4",    icon: "AI", color: BBVA.sereneBlue, duration: 3400 },
  { id: "neo4j",    label: "Knowledge Graph",    sublabel: "Búsqueda vectorial en Neo4j",                icon: "⬡",  color: BBVA.lime, duration: 4000 },
];

type StepState = "pending" | "running" | "done";

interface Props {
  query: string;
  onComplete: () => void;
  dataReady: boolean;
}

export default function SearchingAnimation({ query, onComplete, dataReady }: Props) {
  const [stepStates, setStepStates] = useState<Record<string, StepState>>(
    Object.fromEntries(STEPS.map(s => [s.id, "pending"]))
  );
  const [animDone, setAnimDone] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((step, i) => {
      const startAt = i === 0 ? 0 : STEPS[i - 1].duration;
      timers.push(setTimeout(() => {
        setStepStates(prev => ({ ...prev, [step.id]: "running" }));
      }, startAt));
      timers.push(setTimeout(() => {
        setStepStates(prev => ({ ...prev, [step.id]: "done" }));
      }, step.duration));
    });
    timers.push(setTimeout(() => setAnimDone(true), STEPS[STEPS.length - 1].duration + 400));
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (animDone && dataReady) onComplete();
  }, [animDone, dataReady, onComplete]);

  const doneCount = STEPS.filter(s => stepStates[s.id] === "done").length;
  const progressPct = (doneCount / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#050a14" }}>
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{ position:"absolute", top:"-15%", left:"-5%", width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle, rgba(0,19,145,0.2) 0%, transparent 65%)", filter:"blur(60px)", animation:"float 5s ease-in-out infinite" }} />
        <div style={{ position:"absolute", bottom:"-10%", right:"5%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(133,200,255,0.08) 0%, transparent 65%)", filter:"blur(60px)" }} />
        <div className="absolute inset-0 bg-dot-grid opacity-40" />
      </div>

      {/* Top: query display */}
      <div className="relative z-10 flex flex-col items-center pt-14 pb-10 px-6">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-xs mb-6"
          style={{ background:"rgba(133,200,255,0.06)", border:"1px solid rgba(133,200,255,0.14)", color: BBVA.sereneBlue }}
        >
          <span style={{ width:6, height:6, borderRadius:"50%", background: BBVA.sereneBlue, display:"inline-block", animation:"blink 1s ease-in-out infinite" }} />
          Analizando {doneCount} de {STEPS.length} fuentes...
        </div>

        <h2
          className="font-black text-center mb-2"
          style={{ fontSize:"clamp(1.6rem, 3.5vw, 2.8rem)", color:"#e8eeff", lineHeight:1.15 }}
        >
          Buscando tu<br/>
          <span className="text-gradient">talento ideal</span>
        </h2>

        <div
          className="mt-5 px-5 py-3 rounded-2xl font-mono text-center max-w-2xl"
          style={{ background:"rgba(10,22,40,0.8)", border:"1px solid rgba(133,200,255,0.14)" }}
        >
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color:"#3d4f6e" }}>Consulta</p>
          <p className="text-base font-bold" style={{ color:"#e8eeff" }}>&ldquo;{query}&rdquo;</p>
        </div>
      </div>

      {/* Middle: 2×3 source cards */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-3 gap-4">
          {STEPS.map(step => {
            const state = stepStates[step.id];
            const isRunning = state === "running";
            const isDone = state === "done";
            const isPending = state === "pending";

            return (
              <div
                key={step.id}
                className="rounded-2xl p-5 flex flex-col gap-3 transition-all duration-500"
                style={{
                  background: isDone ? `${step.color}0f` : isRunning ? `${step.color}0a` : "rgba(10,22,40,0.6)",
                  border: `1px solid ${isDone || isRunning ? step.color + "40" : "rgba(133,200,255,0.06)"}`,
                  opacity: isPending ? 0.4 : 1,
                  boxShadow: isRunning ? `0 0 30px ${step.color}18` : "none",
                  transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm transition-all duration-300"
                    style={{
                      background: isDone || isRunning ? `${step.color}20` : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isDone || isRunning ? step.color + "50" : "rgba(255,255,255,0.06)"}`,
                      color: isDone || isRunning ? step.color : "#3d4f6e",
                      boxShadow: isRunning ? `0 0 20px ${step.color}44` : "none",
                    }}
                  >
                    {step.id === "openai" ? <span style={{ fontSize: 10 }}>{step.icon}</span> : step.icon}
                  </div>

                  {isDone && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${step.color}20`, border: `1px solid ${step.color}40` }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke={step.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                  {isRunning && (
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <div key={i} style={{ width:5, height:5, borderRadius:"50%", background: step.color, animation: `blink 0.8s ease-in-out ${i*0.18}s infinite` }} />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <p className="font-bold text-sm mb-1" style={{ color: isDone || isRunning ? "#e8eeff" : "#3d4f6e" }}>
                    {step.label}
                  </p>
                  <p className="font-mono leading-snug" style={{ fontSize: 11, color: isDone ? step.color + "cc" : isRunning ? "#4d6080" : "#1e2d44" }}>
                    {isDone ? "Completado" : isRunning ? step.sublabel : "En espera"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom: progress bar */}
      <div className="relative z-10 px-6 pb-14 max-w-4xl w-full mx-auto">
        <div className="flex justify-between mb-2">
          <span className="font-mono text-xs" style={{ color:"#3d4f6e" }}>
            {doneCount}/{STEPS.length} fuentes procesadas
          </span>
          <span className="font-mono text-xs font-bold" style={{ color: BBVA.sereneBlue }}>
            {Math.round(progressPct)}%
          </span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background:"rgba(133,200,255,0.08)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progressPct}%`,
              background: `linear-gradient(90deg, ${BBVA.electricBlue}, ${BBVA.sereneBlue}, ${BBVA.lime})`,
              boxShadow: `0 0 10px ${BBVA.sereneBlue}66`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
