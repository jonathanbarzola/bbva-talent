"use client";

import { motion } from "framer-motion";
import { BBVA } from "@/lib/bbva-colors";
import type { CareerProgress, CourseRec, CertRec } from "@/lib/careerProgress";

interface Props {
  progress: CareerProgress;
}

const SOURCE_CONFIG: Record<"campus-bbva" | "techu" | "ninja-project", { label: string; color: string; icon: string; subtitle: string }> = {
  "campus-bbva": {
    label: "Campus BBVA",
    color: BBVA.sereneBlue,
    icon: "🎓",
    subtitle: "Cursos en alianza con Coursera + LinkedIn Learning",
  },
  techu: {
    label: "TechU",
    color: BBVA.purple,
    icon: "✦",
    subtitle: "Cursos propios BBVA · APX · Cells · NACAR · HOST",
  },
  "ninja-project": {
    label: "TheNinjaProject",
    color: BBVA.lime,
    icon: "🥷",
    subtitle: "Certificaciones cloud y de mercado · costo en B-Tokens",
  },
};

export default function LearningPlanCards({ progress }: Props) {
  const { topCourses, topCertifications } = progress;

  const campusCourses = topCourses.filter(c => c.source === "campus-bbva");
  const techuCourses = topCourses.filter(c => c.source === "techu");

  return (
    <section className="space-y-5">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: BBVA.purple }}>
          Plan de aprendizaje recomendado
        </p>
        <p className="font-bold text-base" style={{ color: "var(--theme-text-primary)" }}>
          Cursos y certificaciones priorizados según tus gaps
        </p>
        <p className="font-mono text-[10px] mt-1" style={{ color: "var(--theme-text-muted)" }}>
          El ranking combina cobertura de gaps × dificultad alineada con tu nivel target × costo. Las recomendaciones se recalculan cuando cambia tu perfil.
        </p>
      </header>

      {/* CampusBBVA */}
      <PlatformSection
        source="campus-bbva"
        items={campusCourses}
        emptyMessage="Sin matches en CampusBBVA — tus gaps actuales se cubren mejor con TechU o certificaciones de mercado."
        renderItem={c => <CourseCard key={c.id} course={c} />}
      />

      {/* TechU */}
      <PlatformSection
        source="techu"
        items={techuCourses}
        emptyMessage="Sin gaps en stacks propietarios BBVA — buena señal si trabajás con tecnologías modernas."
        renderItem={c => <CourseCard key={c.id} course={c} />}
      />

      {/* TheNinjaProject */}
      <PlatformSection
        source="ninja-project"
        items={topCertifications}
        emptyMessage="Sin certificaciones que amplíen tu perfil ahora — foco en cursos primero."
        renderItem={c => <CertCard key={c.id} cert={c} />}
      />
    </section>
  );
}

function PlatformSection<T>({
  source,
  items,
  emptyMessage,
  renderItem,
}: {
  source: keyof typeof SOURCE_CONFIG;
  items: T[];
  emptyMessage: string;
  renderItem: (item: T) => React.ReactNode;
}) {
  const cfg = SOURCE_CONFIG[source];

  return (
    <div
      className="rounded-2xl p-4 sm:p-5"
      style={{ background: "var(--theme-bg-surface-soft)", border: `1px solid ${cfg.color}28` }}
    >
      {/* Section header */}
      <div className="flex items-start gap-3 mb-3 pb-3" style={{ borderBottom: `1px solid ${cfg.color}1c` }}>
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base"
          style={{ background: `${cfg.color}16`, border: `1px solid ${cfg.color}40` }}
        >
          {cfg.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm" style={{ color: cfg.color }}>
            {cfg.label}
          </p>
          <p className="font-mono text-[10px] mt-0.5" style={{ color: "var(--theme-text-muted)" }}>
            {cfg.subtitle}
          </p>
        </div>
        <span
          className="font-mono text-[10px] font-bold px-2 py-0.5 rounded"
          style={{ background: `${cfg.color}18`, color: cfg.color }}
        >
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="font-mono text-[11px] italic py-3 text-center" style={{ color: "var(--theme-text-muted)" }}>
          {emptyMessage}
        </p>
      ) : (
        <div className="space-y-2.5">
          {items.map(renderItem)}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course }: { course: CourseRec }) {
  const cfg = SOURCE_CONFIG[course.source];
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl p-3"
      style={{ background: "var(--theme-tile-soft)", border: "1px solid rgba(133,200,255,0.10)" }}
    >
      <div className="flex items-start gap-3 mb-2 flex-wrap">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[13px] leading-tight" style={{ color: "var(--theme-text-primary)" }}>
            {course.nombre}
          </p>
          <p className="font-mono text-[10px] mt-0.5" style={{ color: "var(--theme-text-dim)" }}>
            {course.provider} · {course.duracion_horas}h · nivel {course.dificultad}
          </p>
        </div>
        <span
          className="font-mono text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0"
          style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}40` }}
        >
          cubre {course.coverage}
        </span>
      </div>

      <p className="text-[11px] leading-relaxed mb-2" style={{ color: "var(--theme-text-muted)" }}>
        {course.descripcion}
      </p>

      <div
        className="rounded-lg px-2.5 py-1.5 mt-2"
        style={{ background: `${cfg.color}08`, border: `1px solid ${cfg.color}25` }}
      >
        <p className="font-mono text-[9px] uppercase tracking-widest mb-0.5" style={{ color: cfg.color }}>
          Por qué este curso
        </p>
        <p className="font-mono text-[10px] leading-relaxed" style={{ color: "var(--theme-text-secondary)" }}>
          {course.why}
        </p>
      </div>
    </motion.div>
  );
}

function CertCard({ cert }: { cert: CertRec }) {
  const cfg = SOURCE_CONFIG[cert.source];
  const tokenColor = cert.affordable ? BBVA.canary : "#fb923c";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl p-3"
      style={{ background: "var(--theme-tile-soft)", border: "1px solid rgba(133,200,255,0.10)" }}
    >
      <div className="flex items-start gap-3 mb-2 flex-wrap">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[13px] leading-tight" style={{ color: "var(--theme-text-primary)" }}>
            {cert.nombre}
          </p>
          <p className="font-mono text-[10px] mt-0.5" style={{ color: "var(--theme-text-dim)" }}>
            {cert.provider} · prep ~{cert.prep_horas}h · nivel {cert.dificultad}
          </p>
        </div>
        <span
          className="font-mono text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0"
          style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}40` }}
        >
          +{cert.trust_score_boost} trust
        </span>
      </div>

      <p className="text-[11px] leading-relaxed mb-2" style={{ color: "var(--theme-text-muted)" }}>
        {cert.descripcion}
      </p>

      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span
          className="font-mono text-[10px] font-bold px-2 py-1 rounded"
          style={{
            background: `${tokenColor}14`,
            color: tokenColor,
            border: `1px solid ${tokenColor}40`,
          }}
        >
          {cert.costo_bt} B-Tokens {cert.affordable ? "✓" : "· saldo insuficiente"}
        </span>
        <span
          className="font-mono text-[10px] font-bold px-2 py-1 rounded"
          style={{ background: `${cfg.color}10`, color: cfg.color, border: `1px solid ${cfg.color}30` }}
        >
          cubre {cert.coverage}
        </span>
      </div>

      <div
        className="rounded-lg px-2.5 py-1.5"
        style={{ background: `${cfg.color}08`, border: `1px solid ${cfg.color}25` }}
      >
        <p className="font-mono text-[9px] uppercase tracking-widest mb-0.5" style={{ color: cfg.color }}>
          Por qué esta certificación
        </p>
        <p className="font-mono text-[10px] leading-relaxed" style={{ color: "var(--theme-text-secondary)" }}>
          {cert.why}
        </p>
      </div>
    </motion.div>
  );
}
