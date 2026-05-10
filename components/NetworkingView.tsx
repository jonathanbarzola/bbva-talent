"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BBVA } from "@/lib/bbva-colors";
import { BTOKEN_TIER_CONFIG } from "@/lib/trust-score";
import TrustScoreBadge from "./TrustScoreBadge";
import type { NetworkingProfile, NetworkingTipo, BTokenWallet } from "@/lib/types";
import { getNetworkingProfiles, getUserBTokens, requestNetworking, requestMentoring } from "@/lib/api";

type FilterTipo = NetworkingTipo | "all";

interface Props {
  onBack: () => void;
}

const TIPO_LABELS: Record<FilterTipo, string> = {
  all:     "Todos",
  mentor:  "Mentores",
  peer:    "Peers",
  mentee:  "Mentees",
};

// ── Mentor capacity helpers ──────────────────────────────────────────────

const MONTH_ABBREV_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function formatDateShort(iso: string): string {
  // "2026-07-14" → "14 jul 2026"
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTH_ABBREV_ES[(m ?? 1) - 1]} ${y}`;
}

function weeksUntil(iso: string): number {
  const target = new Date(iso + "T00:00:00");
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24 * 7)));
}

function isMentorFull(profile: NetworkingProfile): boolean {
  if (profile.tipo !== "mentor") return false;
  const cupoMax = profile.cupo_maximo ?? 2;
  return (profile.mentees_actuales ?? 0) >= cupoMax;
}

function ProfileCard({
  profile,
  userWallet,
  onConnect,
  loading,
}: {
  profile: NetworkingProfile;
  userWallet: BTokenWallet | null;
  onConnect: (profile: NetworkingProfile) => void;
  loading: boolean;
}) {
  const emp      = profile.empleado;
  const initials = emp.nombre.split(" ").map(n => n[0]).slice(0, 2).join("");
  const canAfford = userWallet ? userWallet.balance >= profile.costo_bt : false;
  const isFull = isMentorFull(profile);

  const tipoColor: Record<NetworkingTipo, string> = {
    mentor: BBVA.lime,
    peer:   BBVA.sereneBlue,
    mentee: BBVA.canary,
  };
  const color = tipoColor[profile.tipo];

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "rgba(10,22,40,0.75)", border: "1px solid rgba(133,200,255,0.10)", backdropFilter: "blur(12px)" }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #001391, #0020cc)", color: "#fff", boxShadow: "0 0 14px rgba(0,19,145,0.4)" }}
        >
          {initials}
          <div className="absolute inset-0 opacity-25" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 60%)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h3 className="font-bold text-sm leading-tight truncate" style={{ color: "#e8eeff" }}>{emp.nombre}</h3>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0"
              style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}
            >
              {profile.tipo}
            </span>
            {/* Mentor capacity badge */}
            {profile.tipo === "mentor" && profile.mentees_actuales !== undefined && profile.cupo_maximo !== undefined && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0"
                style={{
                  background: isFull ? "rgba(251,146,60,0.12)" : "rgba(133,200,255,0.06)",
                  color: isFull ? "#fb923c" : BBVA.sereneBlue,
                  border: `1px solid ${isFull ? "rgba(251,146,60,0.35)" : "rgba(133,200,255,0.18)"}`,
                }}
                title={isFull ? "Cupo completo · sin mentees disponibles" : `${profile.mentees_actuales} de ${profile.cupo_maximo} mentees activos`}
              >
                {isFull && <span style={{ fontSize: 9 }}>⏳</span>}
                {profile.mentees_actuales}/{profile.cupo_maximo} mentees
              </span>
            )}
          </div>
          <p className="text-xs truncate" style={{ color: "#6b7fa3" }}>{emp.rol}</p>
          <p className="font-mono text-[10px] mt-0.5" style={{ color: "#3d4f6e" }}>
            {emp.squad} · {profile.disponibilidad_horaria}
          </p>
        </div>
        {emp.trust_score && <TrustScoreBadge trust={emp.trust_score} compact />}
      </div>

      {/* Topics */}
      {profile.temas.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {profile.temas.map(tema => (
            <span
              key={tema}
              className="px-2 py-0.5 rounded-md text-[10px] font-mono"
              style={{ background: `${BBVA.purple}12`, color: BBVA.purple, border: `1px solid ${BBVA.purple}28` }}
            >
              {tema}
            </span>
          ))}
        </div>
      )}

      {/* Skills preview */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {emp.habilidades.slice(0, 4).map((skill, i) => {
          const colors = [BBVA.lime, BBVA.ice, BBVA.sereneBlue, BBVA.canary];
          const c = colors[i % colors.length];
          return (
            <span key={skill.nombre} className="px-2 py-0.5 rounded-md text-[10px] font-mono" style={{ background: `${c}10`, color: c, border: `1px solid ${c}28` }}>
              {skill.nombre}
            </span>
          );
        })}
        {emp.habilidades.length > 4 && (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono" style={{ background: "rgba(133,200,255,0.06)", color: "#3d4f6e" }}>
            +{emp.habilidades.length - 4}
          </span>
        )}
      </div>

      {/* ── Mentor with full capacity: tentative-availability panel ── */}
      {isFull && profile.proxima_disponibilidad ? (
        <FullCapacityPanel
          empleadoId={emp.id}
          empleadoNombre={emp.nombre}
          proximaDisponibilidad={profile.proxima_disponibilidad}
        />
      ) : (
        // ── Normal action row: compact "Ver perfil" icon + main CTA ──
        <div className="flex gap-2">
          <Link
            href={`/candidate/${emp.id}`}
            aria-label={`Ver perfil completo de ${emp.nombre}`}
            title="Ver perfil completo"
            className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{
              background: `${BBVA.purple}10`,
              border: `1px solid ${BBVA.purple}30`,
              color: BBVA.purple,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = `${BBVA.purple}24`;
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 16px ${BBVA.purple}38`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = `${BBVA.purple}10`;
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M2.5 12c0-2 2-3.5 4.5-3.5s4.5 1.5 4.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </Link>
          <button
            disabled={loading || !canAfford}
            onClick={() => onConnect(profile)}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              background: canAfford ? "linear-gradient(135deg, #001391, #0020cc)" : "rgba(133,200,255,0.05)",
              color:      canAfford ? "#fff" : "#3d4f6e",
              border:     canAfford ? "none" : "1px solid rgba(133,200,255,0.08)",
              cursor:     canAfford && !loading ? "pointer" : "not-allowed",
              letterSpacing: "0.06em",
            }}
          >
            <span>{loading ? "Conectando..." : profile.tipo === "mentor" ? "Solicitar mentoría" : "Conectar"}</span>
            <span className="opacity-60">·</span>
            <span className="font-mono" style={{ color: canAfford ? BBVA.canary : "#3d4f6e" }}>{profile.costo_bt} BT</span>
          </button>
        </div>
      )}

      {!canAfford && !isFull && (
        <p className="text-center text-[10px] font-mono mt-1.5" style={{ color: "#3d4f6e" }}>
          Saldo insuficiente
        </p>
      )}
    </div>
  );
}

// ── Full-capacity panel ─────────────────────────────────────────────────

function FullCapacityPanel({
  empleadoId,
  empleadoNombre,
  proximaDisponibilidad,
}: {
  empleadoId: string;
  empleadoNombre: string;
  proximaDisponibilidad: string;
}) {
  const weeks = weeksUntil(proximaDisponibilidad);
  const dateLabel = formatDateShort(proximaDisponibilidad);

  return (
    <div
      className="rounded-xl p-3.5"
      style={{
        background: "rgba(251,146,60,0.06)",
        border: "1px solid rgba(251,146,60,0.28)",
      }}
    >
      <div className="flex items-start gap-2.5 mb-2.5">
        <span style={{ color: "#fb923c", fontSize: 14, lineHeight: "20px" }}>⏳</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[12px] leading-tight" style={{ color: "#fb923c" }}>
            Cupo de mentoría completo
          </p>
          <p className="font-mono text-[11px] leading-relaxed mt-0.5" style={{ color: "#a8b8d0" }}>
            <span className="font-bold" style={{ color: "#e8eeff" }}>{empleadoNombre.split(" ")[0]}</span>{" "}
            ya tiene 2/2 mentees activos. Próxima ventana tentativa:{" "}
            <span className="font-bold" style={{ color: "#fb923c" }}>{dateLabel}</span>
            {weeks > 0 && (
              <span style={{ color: "#6b7fa3" }}> · en ~{weeks} semana{weeks !== 1 ? "s" : ""}</span>
            )}
            .
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/candidate/${empleadoId}`}
          aria-label={`Ver perfil completo de ${empleadoNombre}`}
          title="Ver perfil completo"
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{
            background: `${BBVA.purple}10`,
            border: `1px solid ${BBVA.purple}30`,
            color: BBVA.purple,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = `${BBVA.purple}24`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = `${BBVA.purple}10`;
          }}
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M2.5 12c0-2 2-3.5 4.5-3.5s4.5 1.5 4.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </Link>
        <button
          className="flex-1 py-2 rounded-xl text-[11px] font-bold tracking-wider uppercase transition-all duration-200"
          style={{
            background: "rgba(251,146,60,0.14)",
            border: "1px solid rgba(251,146,60,0.45)",
            color: "#fb923c",
            cursor: "pointer",
            letterSpacing: "0.06em",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(251,146,60,0.24)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(251,146,60,0.14)";
          }}
        >
          Notificarme cuando se libere
        </button>
      </div>
    </div>
  );
}

export default function NetworkingView({ onBack }: Props) {
  const [filter, setFilter]         = useState<FilterTipo>("all");
  const [query, setQuery]           = useState("");
  const [profiles, setProfiles]     = useState<NetworkingProfile[]>([]);
  const [wallet, setWallet]         = useState<BTokenWallet | null>(null);
  const [loading, setLoading]       = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [toast, setToast]           = useState<string | null>(null);

  useEffect(() => {
    getUserBTokens().then(setWallet).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      getNetworkingProfiles(filter, query)
        .then(r => setProfiles(r.perfiles))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [filter, query]);

  const handleConnect = async (profile: NetworkingProfile) => {
    setConnecting(profile.empleado.id);
    try {
      const fn = profile.tipo === "mentor" ? requestMentoring : requestNetworking;
      const res = await fn(profile.empleado.id);
      if (res.ok) {
        setWallet(prev => prev ? { ...prev, balance: res.nuevo_balance } : prev);
        setToast(`¡Conectado con ${profile.empleado.nombre}!`);
        setTimeout(() => setToast(null), 3000);
      }
    } catch {
      setToast("Error al conectar. Intenta de nuevo.");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setConnecting(null);
    }
  };

  const walletCfg = wallet ? BTOKEN_TIER_CONFIG[wallet.tier] : null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#050a14" }}>

      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4 flex-shrink-0 sticky top-0 z-20"
        style={{ borderBottom: "1px solid rgba(133,200,255,0.08)", background: "rgba(5,10,20,0.95)", backdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-80 transition-opacity"
            style={{ background: "rgba(133,200,255,0.06)", border: "1px solid rgba(133,200,255,0.12)", color: BBVA.sereneBlue }}
          >
            ← Volver
          </button>
          <div>
            <h1 className="font-bold text-base" style={{ color: "#e8eeff" }}>Networking & Mentoría</h1>
            <p className="font-mono text-[10px]" style={{ color: "#3d4f6e" }}>
              Conecta con talento BBVA
            </p>
          </div>
        </div>

        {/* Wallet badge */}
        {wallet && walletCfg && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: `${walletCfg.color}0d`, border: `1px solid ${walletCfg.color}28` }}
          >
            <span className="font-mono text-xs" style={{ color: walletCfg.color }}>{walletCfg.icon}</span>
            <span className="font-black font-mono text-sm" style={{ color: walletCfg.color }}>{wallet.balance}</span>
            <span className="font-mono text-[10px]" style={{ color: walletCfg.color + "88" }}>B-Tokens</span>
          </div>
        )}
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-6">
        {/* Search + Filter bar */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar por nombre, skills, temas..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "rgba(133,200,255,0.05)",
                border: "1px solid rgba(133,200,255,0.12)",
                color: "#e8eeff",
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            {(Object.keys(TIPO_LABELS) as FilterTipo[]).map(tipo => (
              <button
                key={tipo}
                onClick={() => setFilter(tipo)}
                className="px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all duration-150"
                style={{
                  background: filter === tipo ? "rgba(133,200,255,0.12)" : "rgba(133,200,255,0.04)",
                  border: filter === tipo ? "1px solid rgba(133,200,255,0.30)" : "1px solid rgba(133,200,255,0.08)",
                  color: filter === tipo ? BBVA.sereneBlue : "#3d4f6e",
                }}
              >
                {TIPO_LABELS[tipo]}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl h-64 animate-pulse" style={{ background: "rgba(133,200,255,0.04)" }} />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-mono text-sm" style={{ color: "#3d4f6e" }}>No se encontraron perfiles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map(profile => (
              <ProfileCard
                key={profile.empleado.id}
                profile={profile}
                userWallet={wallet}
                onConnect={handleConnect}
                loading={connecting === profile.empleado.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl font-mono text-sm font-bold z-50 transition-all"
          style={{ background: "rgba(10,22,40,0.95)", border: "1px solid rgba(133,200,255,0.20)", color: BBVA.lime, backdropFilter: "blur(20px)" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
