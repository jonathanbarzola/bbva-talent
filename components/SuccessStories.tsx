"use client";

import { motion } from "framer-motion";
import { BBVA } from "@/lib/bbva-colors";

interface Story {
  code: string;
  title: string;
  domain: string;
  domainColor: string;
  metric: { value: string; label: string };
  result: string;
  highlight: string;
}

const STORIES: Story[] = [
  {
    code: "SDA-53024",
    title: "Fraud Detection AI",
    domain: "Seguridad & Riesgo",
    domainColor: BBVA.mandarin,
    metric: { value: "2 hs", label: "tiempo de armado" },
    result: "Equipo de 5 personas vs. 18 días en proceso manual.",
    highlight: "Descubrió 3 ML Engineers ocultos en Pagos que llevaban 4 años sin moverse.",
  },
  {
    code: "SDA-53033",
    title: "Real-time Notifications",
    domain: "Plataforma",
    domainColor: BBVA.lime,
    metric: { value: "35 min", label: "para encontrar al Expert ideal" },
    result: "Manager armó squad completo de 4 personas en una sentada.",
    highlight: "Match con un Expert en Kafka del squad de Banca Digital que nadie tenía en el radar.",
  },
  {
    code: "SDA-53038",
    title: "AML Monitor",
    domain: "Compliance",
    domainColor: BBVA.purple,
    metric: { value: "$2.4M", label: "ahorro anual estimado" },
    result: "De 3 semanas de búsqueda a 1 día de validación con stakeholders.",
    highlight: "Equipo balanceado con 4 de 5 con historial de colaboración previa entre sí.",
  },
];

export default function SuccessStories() {
  return (
    <section
      className="relative w-full max-w-5xl mx-auto mt-16 mb-4 animate-fade-up"
      style={{ animationDelay: "0.42s" }}
    >
      <div className="flex items-center gap-3 mb-5">
        <span
          className="font-mono text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded"
          style={{ background: `${BBVA.lime}1a`, color: BBVA.lime, border: `1px solid ${BBVA.lime}38` }}
        >
          Casos reales
        </span>
        <div className="flex-1 h-px" style={{ background: "var(--theme-tile-medium)" }} />
        <span className="font-mono text-[10px]" style={{ color: "var(--theme-text-dim)" }}>
          datos de los últimos 3 meses
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {STORIES.map((story, i) => (
          <motion.article
            key={story.code}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl p-5 overflow-hidden flex flex-col"
            style={{
              background: "var(--theme-bg-surface-soft)",
              border: `1px solid ${story.domainColor}24`,
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
              style={{ background: `radial-gradient(circle at 80% 20%, ${story.domainColor}1a 0%, transparent 70%)` }}
            />

            <header className="relative z-10 flex items-center justify-between gap-2 mb-3">
              <span
                className="font-mono text-[10px] font-bold px-2 py-0.5 rounded"
                style={{ background: `${story.domainColor}18`, color: story.domainColor, border: `1px solid ${story.domainColor}38` }}
              >
                {story.code}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--theme-text-dim)" }}>
                {story.domain}
              </span>
            </header>

            <h3 className="relative z-10 font-black text-base leading-tight mb-3" style={{ color: "var(--theme-text-primary)" }}>
              {story.title}
            </h3>

            <div className="relative z-10 mb-3">
              <p className="font-black font-mono leading-none" style={{ color: story.domainColor, fontSize: 28 }}>
                {story.metric.value}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest mt-1" style={{ color: story.domainColor, opacity: 0.75 }}>
                {story.metric.label}
              </p>
            </div>

            <p className="relative z-10 text-[12px] leading-relaxed mb-3" style={{ color: "var(--theme-text-secondary)" }}>
              {story.result}
            </p>

            <div
              className="relative z-10 mt-auto rounded-lg px-3 py-2 flex items-start gap-2"
              style={{ background: "var(--theme-tile-soft)", border: "1px solid rgba(133,200,255,0.08)" }}
            >
              <span style={{ color: BBVA.sereneBlue, fontSize: 11, lineHeight: "16px" }}>✦</span>
              <p className="font-mono text-[10px] leading-relaxed flex-1" style={{ color: BBVA.sereneBlue }}>
                {story.highlight}
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
