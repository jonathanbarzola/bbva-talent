import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CandidateCard from "@/components/CandidateCard";
import type { EmpleadoResult } from "@/lib/types";

const MOCK_CANDIDATE: EmpleadoResult = {
  id: "emp_001",
  nombre: "Valentina Ríos",
  email: "v.rios@bbva.com",
  rol: "Senior Backend Engineer",
  squad: "Pagos Digitales",
  nivel: "Senior",
  ubicacion: "Buenos Aires",
  bio: "Especialista en arquitecturas de microservicios para procesamiento de pagos en tiempo real.",
  score: 0.94,
  habilidades: [
    { nombre: "Python", categoria: "Lenguaje", score: 0.9 },
    { nombre: "FastAPI", categoria: "Framework", score: 0.85 },
    { nombre: "PSD2", categoria: "Regulación", score: 0.98 },
    { nombre: "AWS", categoria: "Cloud", score: 0.88 },
    { nombre: "OAuth2", categoria: "Protocolo", score: 0.9 },
    { nombre: "Kafka", categoria: "Tecnología", score: 0.8 },
  ],
  proyectos: [
    { id: "proj_core_pagos", nombre: "Core-Pagos", dominio: "Pagos Digitales", estado: "En Producción" },
  ],
  colaboradores: [
    { id: "emp_004", nombre: "Rodrigo Montoya", rol: "Cloud Architect", weight: 0.92 },
    { id: "emp_006", nombre: "Sebastián Molina", rol: "Security Engineer", weight: 0.88 },
  ],
};

describe("CandidateCard", () => {
  it("renders the candidate name", () => {
    render(<CandidateCard candidate={MOCK_CANDIDATE} rank={1} onViewGraph={() => {}} />);
    expect(screen.getByText("Valentina Ríos")).toBeInTheDocument();
  });

  it("renders the candidate role and squad", () => {
    render(<CandidateCard candidate={MOCK_CANDIDATE} rank={1} onViewGraph={() => {}} />);
    expect(screen.getByText("Senior Backend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Pagos Digitales")).toBeInTheDocument();
  });

  it("renders the score as percentage (94)", () => {
    render(<CandidateCard candidate={MOCK_CANDIDATE} rank={1} onViewGraph={() => {}} />);
    expect(screen.getByText("94")).toBeInTheDocument();
  });

  it("shows nivel badge", () => {
    render(<CandidateCard candidate={MOCK_CANDIDATE} rank={1} onViewGraph={() => {}} />);
    expect(screen.getByText("Senior")).toBeInTheDocument();
  });

  it("renders rank with leading zero", () => {
    render(<CandidateCard candidate={MOCK_CANDIDATE} rank={3} onViewGraph={() => {}} />);
    expect(screen.getByText("#03")).toBeInTheDocument();
  });

  it("shows first 5 skills, hides the rest with +N badge", () => {
    render(<CandidateCard candidate={MOCK_CANDIDATE} rank={1} onViewGraph={() => {}} />);
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("FastAPI")).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("renders project names", () => {
    render(<CandidateCard candidate={MOCK_CANDIDATE} rank={1} onViewGraph={() => {}} />);
    expect(screen.getByText("Core-Pagos")).toBeInTheDocument();
  });

  it("calls onViewGraph with candidate id when CTA is clicked", () => {
    const onViewGraph = jest.fn();
    render(<CandidateCard candidate={MOCK_CANDIDATE} rank={1} onViewGraph={onViewGraph} />);
    fireEvent.click(screen.getByRole("button", { name: /constelación 360/i }));
    expect(onViewGraph).toHaveBeenCalledTimes(1);
    expect(onViewGraph).toHaveBeenCalledWith("emp_001");
  });

  it("shows collaborators count", () => {
    render(<CandidateCard candidate={MOCK_CANDIDATE} rank={1} onViewGraph={() => {}} />);
    expect(screen.getByText(/2 colaboradores/)).toBeInTheDocument();
  });

  it("renders initials in avatar (VR for Valentina Ríos)", () => {
    render(<CandidateCard candidate={MOCK_CANDIDATE} rank={1} onViewGraph={() => {}} />);
    expect(screen.getByText("VR")).toBeInTheDocument();
  });
});
