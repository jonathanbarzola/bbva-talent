"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BBVA } from "@/lib/bbva-colors";
import ThemeToggle from "@/components/ThemeToggle";

interface Layer {
  title: string;
  subtitle: string;
  color: string;
  components: { name: string; tag: string; status: "live" | "mock" | "planned" }[];
}

const LAYERS: Layer[] = [
  {
    title: "Capa de presentación",
    subtitle: "Lo que ven managers y tech leads",
    color: BBVA.sereneBlue,
    components: [
      { name: "Web app", tag: "Next.js 16 · React 19", status: "live" },
      { name: "Tema visual", tag: "Tailwind 4 · Neural Cosmos", status: "live" },
      { name: "Animaciones", tag: "Framer Motion", status: "live" },
      { name: "Knowledge Graph 2D", tag: "react-force-graph-2d", status: "live" },
    ],
  },
  {
    title: "Capa de inteligencia",
    subtitle: "Donde sucede el match",
    color: BBVA.purple,
    components: [
      { name: "Búsqueda semántica", tag: "OpenAI text-embed-3 · pgvector", status: "mock" },
      { name: "Refinamiento conversacional", tag: "Claude 4.6 / GPT-4o", status: "mock" },
      { name: "Gap Analysis", tag: "Heurísticas + ML scoring", status: "live" },
      { name: "Score explainability", tag: "GDPR Art. 22 · auditable", status: "live" },
    ],
  },
  {
    title: "Capa de datos",
    subtitle: "Fuentes de verdad del banco",
    color: BBVA.lime,
    components: [
      { name: "HR Hub", tag: "API REST · datos de empleados", status: "planned" },
      { name: "EDI System", tag: "Evaluaciones anuales · peer reviews", status: "planned" },
      { name: "B-Tokens API", tag: "Wallet de gamificación interna", status: "planned" },
      { name: "SDA Catalog", tag: "Proyectos con roles ya mapeados", status: "planned" },
      { name: "Knowledge Graph", tag: "Neo4j · skills/personas/proyectos", status: "planned" },
      { name: "Single Sign-On", tag: "Workday · Active Directory", status: "planned" },
    ],
  },
];

const STATUS_CONFIG: Record<Layer["components"][number]["status"], { label: string; color: string }> = {
  live:    { label: "Implementado", color: BBVA.lime },
  mock:    { label: "Mock en demo",  color: BBVA.canary },
  planned: { label: "Producción",    color: BBVA.sereneBlue },
};

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ background: "var(--theme-bg-page)" }}>
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-15%", left: "-5%", width: 700, height: 700, borderRadius: "50%", background: `radial-gradient(circle, ${BBVA.electricBlue}1c 0%, transparent 65%)`, filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "5%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${BBVA.purple}10 0%, transparent 65%)`, filter: "blur(80px)" }} />
        <div className="absolute inset-0 bg-dot-grid opacity-30" />
      </div>

      {/* Header */}
      <header
        className="relative z-10 sticky top-0 px-6 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(133,200,255,0.08)", background: "var(--theme-bg-overlay-strong)", backdropFilter: "blur(20px)" }}
      >
        <button
          onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-opacity hover:opacity-80"
          style={{ background: "var(--theme-tile-medium)", border: "1px solid rgba(133,200,255,0.14)", color: BBVA.sereneBlue, cursor: "pointer" }}
        >
          ← Volver
        </button>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--theme-text-dim)" }}>
            Arquitectura · Whitepaper
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10">

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <span
            className="inline-block font-mono text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded mb-4"
            style={{ background: `${BBVA.purple}1c`, color: BBVA.purple, border: `1px solid ${BBVA.purple}40` }}
          >
            Arquitectura técnica
          </span>
          <h1 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "var(--theme-text-primary)" }}>
            Cómo BBVA Talent <span className="text-gradient">se conecta al banco</span>
          </h1>
          <p className="text-base max-w-2xl leading-relaxed" style={{ color: "var(--theme-text-secondary)" }}>
            Lo que ves en el demo es la capa de presentación. En producción, BBVA Talent se enchufa
            como un orquestador entre los sistemas que el banco ya tiene: HR, EDI, SDA, B-Tokens y el
            Knowledge Graph corporativo.
          </p>
        </motion.section>

        {/* Layered diagram */}
        <section className="mb-12 space-y-3">
          {LAYERS.map((layer, idx) => (
            <motion.div
              key={layer.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + idx * 0.08 }}
              className="rounded-2xl p-5 sm:p-6"
              style={{
                background: "var(--theme-bg-surface-soft)",
                border: `1px solid ${layer.color}30`,
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span
                  className="w-1 h-6 rounded-full"
                  style={{ background: `linear-gradient(180deg, ${layer.color}00, ${layer.color}, ${layer.color}00)` }}
                />
                <h2 className="font-black text-base sm:text-lg" style={{ color: "var(--theme-text-primary)" }}>
                  {layer.title}
                </h2>
                <span className="font-mono text-[11px]" style={{ color: layer.color, opacity: 0.85 }}>
                  · {layer.subtitle}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {layer.components.map(comp => {
                  const cfg = STATUS_CONFIG[comp.status];
                  return (
                    <div
                      key={comp.name}
                      className="rounded-xl px-3 py-2.5 flex items-start justify-between gap-3"
                      style={{ background: `${layer.color}06`, border: `1px solid ${layer.color}1c` }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[13px] leading-tight" style={{ color: "var(--theme-text-primary)" }}>
                          {comp.name}
                        </p>
                        <p className="font-mono text-[10px] mt-0.5" style={{ color: "var(--theme-text-muted)" }}>
                          {comp.tag}
                        </p>
                      </div>
                      <span
                        className="font-mono text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded flex-shrink-0 self-start"
                        style={{
                          background: `${cfg.color}18`,
                          color: cfg.color,
                          border: `1px solid ${cfg.color}40`,
                        }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Connector arrow (except last layer) */}
              {idx < LAYERS.length - 1 && (
                <div className="flex justify-center mt-2 -mb-1" style={{ color: layer.color, opacity: 0.5 }}>
                  <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                    <path d="M10 0V12M10 12L4 7M10 12L16 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </section>

        {/* Data flow */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="rounded-2xl p-6 mb-12"
          style={{ background: "var(--theme-bg-surface-soft)", border: "1px solid rgba(133,200,255,0.12)" }}
        >
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span
              className="font-mono text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded"
              style={{ background: `${BBVA.canary}1a`, color: BBVA.canary, border: `1px solid ${BBVA.canary}38` }}
            >
              Flujo de datos
            </span>
            <h2 className="font-black text-base" style={{ color: "var(--theme-text-primary)" }}>
              Manager elige proyecto → recomendación en 22 minutos
            </h2>
          </div>

          <ol className="space-y-3 mt-5">
            {[
              { step: "01", title: "Manager selecciona proyecto SDA", detail: "El catálogo SDA expone roles requeridos via API REST." },
              { step: "02", title: "BBVA Talent consulta el Knowledge Graph", detail: "Neo4j devuelve candidatos con skills, EDI, Trust Score y disponibilidad." },
              { step: "03", title: "Embeddings + heurísticas calculan match", detail: "OpenAI text-embed-3 sobre bio + skills, combinado con peso de Trust/EDI/colaboraciones." },
              { step: "04", title: "Score explicable retornado al frontend", detail: "Cada match incluye breakdown por factor — auditable según GDPR Art. 22." },
              { step: "05", title: "Manager refina con chat conversacional", detail: "Comandos en lenguaje natural se traducen a filtros vía LLM (Claude / GPT)." },
              { step: "06", title: "Equipo final exportable y compartible", detail: "PDF interno + deep-link con estado del compose para validación con stakeholders." },
            ].map((s, i) => (
              <motion.li
                key={s.step}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.32, delay: 0.5 + i * 0.05 }}
                className="flex items-start gap-3"
              >
                <span
                  className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-black font-mono text-xs"
                  style={{ background: `${BBVA.canary}10`, border: `1px solid ${BBVA.canary}40`, color: BBVA.canary }}
                >
                  {s.step}
                </span>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="font-bold text-sm leading-tight" style={{ color: "var(--theme-text-primary)" }}>{s.title}</p>
                  <p className="font-mono text-[11px] mt-0.5 leading-relaxed" style={{ color: "var(--theme-text-muted)" }}>
                    {s.detail}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </motion.section>

        {/* Compliance / privacy */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="rounded-2xl p-6 mb-8"
          style={{ background: `${BBVA.electricBlue}10`, border: `1px solid ${BBVA.electricBlue}28` }}
        >
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span
              className="font-mono text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded"
              style={{ background: `${BBVA.sereneBlue}1a`, color: BBVA.sereneBlue, border: `1px solid ${BBVA.sereneBlue}40` }}
            >
              Compliance & privacidad
            </span>
          </div>
          <ul className="space-y-2.5">
            {[
              "Datos sensibles (EDI, peer comments) cifrados en reposo y en tránsito.",
              "Logging completo de quién accedió al perfil de quién — pista de auditoría 365 días.",
              "Score explainable por candidato — el manager puede justificar la decisión por escrito.",
              "Consentimiento explícito del empleado antes de exponer su perfil al motor de matching.",
              "Datos del demo son sintéticos. En producción se integra con la política interna BBVA de uso de datos de empleados.",
            ].map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.65 + i * 0.04 }}
                className="flex items-start gap-2.5"
              >
                <span style={{ color: BBVA.sereneBlue, fontSize: 12, lineHeight: "20px" }}>✓</span>
                <p className="font-mono text-[12px] leading-relaxed flex-1" style={{ color: "var(--theme-text-secondary)" }}>
                  {item}
                </p>
              </motion.li>
            ))}
          </ul>
        </motion.section>

        {/* CTA back */}
        <div className="text-center">
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, #001391, #0020cc)",
              color: "#fff",
              boxShadow: "0 0 30px rgba(0,19,145,0.5)",
              cursor: "pointer",
              letterSpacing: "0.08em",
            }}
          >
            ← Volver al producto
          </button>
        </div>
      </main>
    </div>
  );
}
