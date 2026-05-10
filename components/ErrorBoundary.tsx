"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { BBVA } from "@/lib/bbva-colors";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[BBVA Talent] Render error:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    if (typeof window !== "undefined") window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "var(--theme-bg-page)" }}
      >
        <div
          className="max-w-md w-full rounded-2xl p-7 text-center"
          style={{
            background: "var(--theme-bg-surface-strong)",
            border: "1px solid rgba(248,113,113,0.25)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.28)" }}
          >
            <span style={{ color: "#fca5a5", fontSize: 24 }}>⚠</span>
          </div>

          <h2 className="font-black text-lg mb-2" style={{ color: "var(--theme-text-primary)" }}>
            Algo se rompió
          </h2>
          <p className="font-mono text-xs leading-relaxed mb-5" style={{ color: "var(--theme-text-secondary)" }}>
            Ocurrió un error inesperado en la aplicación. Puedes intentar volver al inicio o recargar la página.
          </p>

          {this.state.error && (
            <div
              className="text-left rounded-lg px-3 py-2 mb-5 overflow-x-auto"
              style={{ background: "var(--theme-bg-overlay-soft)", border: "1px solid rgba(248,113,113,0.15)" }}
            >
              <p className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--theme-text-dim)" }}>
                Detalle técnico
              </p>
              <p className="font-mono text-[11px] break-words" style={{ color: "#fca5a5" }}>
                {this.state.error.name}: {this.state.error.message}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={this.handleReset}
              className="flex-1 py-2.5 rounded-lg font-mono text-xs font-bold transition-opacity hover:opacity-80"
              style={{ background: "var(--theme-tile-medium)", border: `1px solid ${BBVA.sereneBlue}28`, color: BBVA.sereneBlue, cursor: "pointer" }}
            >
              Volver al inicio
            </button>
            <button
              onClick={this.handleReload}
              className="flex-1 py-2.5 rounded-lg font-mono text-xs font-black uppercase tracking-wider transition-all"
              style={{ background: "linear-gradient(135deg, #001391, #0020cc)", color: "#fff", boxShadow: "0 0 20px rgba(0,19,145,0.4)", cursor: "pointer" }}
            >
              Recargar
            </button>
          </div>
        </div>
      </div>
    );
  }
}
