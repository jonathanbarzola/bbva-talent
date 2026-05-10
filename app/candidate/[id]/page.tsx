"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BBVA } from "@/lib/bbva-colors";
import { getEmployeeById } from "@/lib/api";
import { TRUST_TIER_CONFIG } from "@/lib/trust-score";
import TrustScoreBadge from "@/components/TrustScoreBadge";
import BTokenBadge from "@/components/BTokenBadge";
import EDIPanel from "@/components/EDIPanel";
import { SkeletonAvatar, SkeletonBlock, SkeletonLine } from "@/components/Skeleton";
import ThemeToggle from "@/components/ThemeToggle";
import type { EmpleadoResult, AvailabilityStatus } from "@/lib/types";

const NIVEL_COLOR: Record<string, string> = {
  Junior: BBVA.ice,
  Mid:    BBVA.canary,
  Senior: BBVA.lime,
  Staff:  BBVA.mandarin,
};

const AVAIL_LABEL: Record<AvailabilityStatus, { color: string; label: string; icon: string }> = {
  disponible:      { color: BBVA.lime,     label: "Disponible al 100%",  icon: "●" },
  parcial:         { color: BBVA.canary,   label: "50% disponible",      icon: "◐" },
  asignado:        { color: "#ff5c5c",     label: "Asignado a otro proyecto", icon: "✕" },
  vacaciones:      { color: BBVA.ice,      label: "En vacaciones",       icon: "○" },
  maternidad:      { color: BBVA.purple,   label: "En maternidad",       icon: "♡" },
  licencia:        { color: BBVA.mandarin, label: "En licencia",         icon: "○" },
  descanso_medico: { color: "#ff5c5c",     label: "En descanso médico",  icon: "✚" },
};

const SKILL_COLORS = [BBVA.lime, BBVA.ice, BBVA.sereneBlue, BBVA.purple, BBVA.canary, BBVA.mandarin];

function ScoreRing({ score, size = 88 }: { score: number; size?: number }) {
  const pct = Math.round(score * 100);
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 90 ? BBVA.lime : pct >= 75 ? BBVA.sereneBlue : BBVA.canary;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--theme-tile-medium)" strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ color }}>
        <span className="font-mono font-black leading-none" style={{ fontSize: size * 0.32 }}>{pct}</span>
        <span className="font-mono leading-none mt-1" style={{ fontSize: 10, color: "var(--theme-text-dim)" }}>match</span>
      </div>
    </div>
  );
}

function SkillBar({ name, score, color }: { name: string; score: number; color: string }) {
  const pct = Math.round(score * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-xs" style={{ color: "var(--theme-text-secondary)" }}>{name}</span>
        <span className="font-mono text-[10px] font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--theme-tile-medium)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}66, ${color})` }}
        />
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: "var(--theme-bg-page)" }}>
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        <SkeletonBlock height={140} radius={20} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <SkeletonLine width="80%" height={14} />
            <SkeletonLine width="100%" height={10} />
            <SkeletonLine width="100%" height={10} />
            <SkeletonLine width="60%" height={10} />
            <SkeletonBlock height={200} radius={16} />
          </div>
          <div className="space-y-3">
            <SkeletonBlock height={120} radius={16} />
            <SkeletonBlock height={120} radius={16} />
            <SkeletonBlock height={150} radius={16} />
          </div>
        </div>
      </div>
    </div>
  );
}

function NotFound({ id }: { id: string }) {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--theme-bg-page)" }}>
      <div className="max-w-md text-center">
        <div
          className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
          style={{ background: `${BBVA.canary}15`, border: `1px dashed ${BBVA.canary}50` }}
        >
          <span style={{ color: BBVA.canary, fontSize: 24 }}>?</span>
        </div>
        <h2 className="font-black text-lg mb-2" style={{ color: "var(--theme-text-primary)" }}>Empleado no encontrado</h2>
        <p className="font-mono text-xs mb-5" style={{ color: "var(--theme-text-muted)" }}>
          No existe un perfil con id <code className="px-1.5 py-0.5 rounded" style={{ background: "var(--theme-tile-medium)", color: BBVA.sereneBlue }}>{id}</code> en el directorio de mocks.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 rounded-lg font-mono text-xs font-bold"
          style={{ background: "linear-gradient(135deg, #001391, #0020cc)", color: "#fff", cursor: "pointer" }}
        >
          ← Volver al inicio
        </button>
      </div>
    </div>
  );
}

export default function CandidateProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [candidate, setCandidate] = useState<EmpleadoResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getEmployeeById(id)
      .then(emp => {
        if (cancelled) return;
        if (!emp) setNotFound(true);
        else setCandidate(emp);
      })
      .catch(() => { if (!cancelled) setNotFound(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <ProfileSkeleton />;
  if (notFound || !candidate) return <NotFound id={id} />;

  const initials = candidate.nombre.split(" ").map(n => n[0]).slice(0, 2).join("");
  const nivelColor = NIVEL_COLOR[candidate.nivel] ?? BBVA.grey3;
  const avail = candidate.disponibilidad ? AVAIL_LABEL[candidate.disponibilidad] : null;
  const trustCfg = candidate.trust_score ? TRUST_TIER_CONFIG[candidate.trust_score.tier] : null;

  return (
    <div className="min-h-screen" style={{ background: "var(--theme-bg-page)" }}>
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", left: "-5%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${BBVA.electricBlue}22 0%, transparent 70%)`, filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "5%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${BBVA.purple}10 0%, transparent 70%)`, filter: "blur(80px)" }} />
        <div className="absolute inset-0 bg-dot-grid opacity-40" />
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
            Perfil · {candidate.id}
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">

        {/* Hero card */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-2xl p-6 sm:p-8 overflow-hidden mb-6"
          style={{
            background: "var(--theme-bg-surface-strong)",
            border: `1px solid ${nivelColor}38`,
            boxShadow: `0 18px 60px rgba(0,0,0,0.4), 0 0 50px ${nivelColor}1a`,
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="absolute top-0 right-0 w-72 h-72 pointer-events-none" style={{ background: `radial-gradient(circle at 80% 20%, ${nivelColor}1a 0%, transparent 70%)` }} />

          <div className="relative z-10 flex flex-col lg:flex-row items-start gap-6">
            <div
              className="flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center font-black text-2xl relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #001391, #0020cc)", boxShadow: "0 0 30px rgba(0,19,145,0.5)", color: "#fff" }}
            >
              {initials}
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 60%)" }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span
                  className="font-mono text-[10px] font-bold px-2 py-0.5 rounded"
                  style={{ background: `${nivelColor}20`, color: nivelColor, border: `1px solid ${nivelColor}50` }}
                >
                  {candidate.nivel}
                </span>
                {candidate.rol_bbva && (
                  <span
                    className="font-mono text-[10px] font-bold px-2 py-0.5 rounded"
                    style={{ background: `${BBVA.sereneBlue}15`, color: BBVA.sereneBlue, border: `1px solid ${BBVA.sereneBlue}40` }}
                    title="Rol oficial BBVA"
                  >
                    {candidate.rol_bbva}
                  </span>
                )}
                {candidate.registro && (
                  <span
                    className="font-mono text-[10px] font-bold px-2 py-0.5 rounded"
                    style={{
                      background: candidate.tipo_contrato === "externo" ? `${BBVA.mandarin}15` : `${BBVA.sereneBlue}10`,
                      color: candidate.tipo_contrato === "externo" ? BBVA.mandarin : BBVA.sereneBlue,
                      border: `1px solid ${candidate.tipo_contrato === "externo" ? BBVA.mandarin : BBVA.sereneBlue}40`,
                    }}
                    title={candidate.tipo_contrato === "externo" ? `Externo · ${candidate.consultora ?? ""}` : "Interno BBVA"}
                  >
                    {candidate.registro}
                    {candidate.tipo_contrato === "externo" && candidate.consultora && (
                      <span className="ml-1" style={{ opacity: 0.7 }}>· {candidate.consultora}</span>
                    )}
                  </span>
                )}
                <span className="font-mono text-[10px]" style={{ color: "var(--theme-text-dim)" }}>{candidate.squad}</span>
                {avail && (
                  <span
                    className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded"
                    style={{ background: `${avail.color}15`, color: avail.color, border: `1px solid ${avail.color}40` }}
                  >
                    <span>{avail.icon}</span> {avail.label}
                  </span>
                )}
              </div>
              <h1 className="font-black text-2xl sm:text-3xl leading-tight mb-1" style={{ color: "var(--theme-text-primary)" }}>
                {candidate.nombre}
              </h1>
              <p className="text-sm sm:text-base mb-2" style={{ color: BBVA.sereneBlue }}>
                {candidate.rol}
              </p>
              <p className="font-mono text-xs" style={{ color: "var(--theme-text-muted)" }}>
                {candidate.ubicacion} · {candidate.años_empresa} año{candidate.años_empresa !== 1 ? "s" : ""} en BBVA · {candidate.email}
              </p>
            </div>

            <ScoreRing score={candidate.score} size={96} />
          </div>
        </motion.section>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left column — bio, skills, projects */}
          <div className="lg:col-span-2 space-y-5">

            {/* Bio */}
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: 0.05 }}
              className="rounded-2xl p-5"
              style={{ background: "var(--theme-bg-surface-soft)", border: "1px solid rgba(133,200,255,0.08)" }}
            >
              <p className="font-mono text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: "var(--theme-text-dim)" }}>
                Bio
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--theme-text-secondary)" }}>
                {candidate.bio}
              </p>
            </motion.section>

            {/* Skills */}
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: 0.1 }}
              className="rounded-2xl p-5"
              style={{ background: "var(--theme-bg-surface-soft)", border: "1px solid rgba(133,200,255,0.08)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-[10px] uppercase tracking-widest font-bold" style={{ color: "var(--theme-text-dim)" }}>
                  Skills · {candidate.habilidades.length}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5">
                {candidate.habilidades.map((skill, i) => (
                  <SkillBar
                    key={skill.nombre}
                    name={skill.nombre}
                    score={skill.score}
                    color={SKILL_COLORS[i % SKILL_COLORS.length]}
                  />
                ))}
              </div>
            </motion.section>

            {/* Projects */}
            {candidate.proyectos.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: 0.15 }}
                className="rounded-2xl p-5"
                style={{ background: "var(--theme-bg-surface-soft)", border: "1px solid rgba(133,200,255,0.08)" }}
              >
                <p className="font-mono text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: "var(--theme-text-dim)" }}>
                  Trayectoria · {candidate.proyectos.length} proyecto{candidate.proyectos.length > 1 ? "s" : ""}
                </p>
                <div className="space-y-2">
                  {candidate.proyectos.map(p => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5"
                      style={{ background: `${BBVA.mandarin}08`, border: `1px solid ${BBVA.mandarin}22` }}
                    >
                      <div>
                        <p className="font-bold text-xs" style={{ color: "var(--theme-text-primary)" }}>{p.nombre}</p>
                        <p className="font-mono text-[10px]" style={{ color: "var(--theme-text-muted)" }}>
                          {p.dominio}
                        </p>
                      </div>
                      <span
                        className="font-mono text-[10px] font-bold px-2 py-0.5 rounded"
                        style={{ background: `${BBVA.mandarin}18`, color: BBVA.mandarin }}
                      >
                        {p.estado}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Collaborators */}
            {candidate.colaboradores.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: 0.2 }}
                className="rounded-2xl p-5"
                style={{ background: "var(--theme-bg-surface-soft)", border: "1px solid rgba(133,200,255,0.08)" }}
              >
                <p className="font-mono text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: "var(--theme-text-dim)" }}>
                  Red de colaboraciones · {candidate.colaboradores.length}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {candidate.colaboradores.map((colab) => {
                    const cInitials = colab.nombre.split(" ").map(n => n[0]).slice(0, 2).join("");
                    return (
                      <button
                        key={colab.id}
                        onClick={() => router.push(`/candidate/${colab.id}`)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all"
                        style={{ background: "var(--theme-tile-soft)", border: "1px solid rgba(133,200,255,0.08)", cursor: "pointer" }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.background = "var(--theme-border-default)";
                          (e.currentTarget as HTMLElement).style.borderColor = `${BBVA.sereneBlue}40`;
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = "var(--theme-tile-soft)";
                          (e.currentTarget as HTMLElement).style.borderColor = "var(--theme-tile-medium)";
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, ${BBVA.electricBlue}, #0020cc)`, color: "#fff" }}
                        >
                          {cInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs leading-tight truncate" style={{ color: "var(--theme-text-primary)" }}>{colab.nombre}</p>
                          <p className="font-mono text-[10px] truncate" style={{ color: "var(--theme-text-muted)" }}>{colab.rol}</p>
                        </div>
                        <span
                          className="font-mono text-[10px] font-bold flex-shrink-0"
                          style={{ color: colab.weight >= 0.8 ? BBVA.lime : colab.weight >= 0.6 ? BBVA.sereneBlue : BBVA.canary }}
                        >
                          {Math.round(colab.weight * 100)}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.section>
            )}
          </div>

          {/* Right column — Trust, B-Tokens, EDI */}
          <aside className="space-y-4">
            {candidate.trust_score && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: 0.05 }}
              >
                <TrustScoreBadge trust={candidate.trust_score} />
              </motion.div>
            )}

            {candidate.b_tokens && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: 0.1 }}
              >
                <BTokenBadge wallet={candidate.b_tokens} />
              </motion.div>
            )}

            {candidate.edi && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: 0.15 }}
              >
                <EDIPanel edi={candidate.edi} />
              </motion.div>
            )}

            {/* Networking tags */}
            {candidate.networking_tags && candidate.networking_tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: 0.2 }}
                className="rounded-xl p-4"
                style={{ background: `${BBVA.purple}08`, border: `1px solid ${BBVA.purple}22` }}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <p className="font-mono text-[10px] uppercase tracking-widest font-bold" style={{ color: BBVA.purple }}>
                    Networking
                  </p>
                  {candidate.es_mentor && (
                    <span
                      className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: `${BBVA.canary}18`, color: BBVA.canary, border: `1px solid ${BBVA.canary}40` }}
                    >
                      MENTOR
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.networking_tags.map(tag => (
                    <span
                      key={tag}
                      className="font-mono text-[10px] px-2 py-0.5 rounded"
                      style={{ background: `${BBVA.purple}15`, color: BBVA.purple, border: `1px solid ${BBVA.purple}30` }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
