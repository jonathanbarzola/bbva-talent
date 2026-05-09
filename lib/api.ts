import type {
  SearchResponse, GraphResponse, TeamCompositionResponse, SDAProject,
  NetworkingSearchResponse, NetworkingTipo, BTokenWallet,
} from "./types";
import {
  MOCK_SEARCH_RESULT, getMockGraph, getMockTeamComposition,
  MOCK_SDA_PROJECTS, getMockNetworkingProfiles, MOCK_USER_WALLET,
  CANDIDATE_POOL,
} from "./mock-data";
import type { EmpleadoResult } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
// Default to mock mode unless explicitly disabled (e.g. when a real backend is wired up).
// NEXT_PUBLIC_MOCK="false" → real fetches; everything else (unset, "true", "") → mocks.
const IS_MOCK  = process.env.NEXT_PUBLIC_MOCK !== "false";

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// ── Profile search ────────────────────────────────────────────────────────

export async function searchTalent(query: string, limit = 10): Promise<SearchResponse> {
  if (IS_MOCK) {
    await delay(600);
    return { ...MOCK_SEARCH_RESULT, query };
  }
  const res = await fetch(`${API_BASE}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, limit }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Error desconocido" }));
    throw new Error(error.detail ?? "Error en la búsqueda");
  }
  return res.json();
}

// ── Single employee profile ───────────────────────────────────────────────

export async function getEmployeeById(employeeId: string): Promise<EmpleadoResult | null> {
  if (IS_MOCK) {
    await delay(150);
    return CANDIDATE_POOL[employeeId] ?? null;
  }
  const res = await fetch(`${API_BASE}/employees/${employeeId}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("No se pudo cargar el perfil del empleado");
  return res.json();
}

export function listAllEmployees(): EmpleadoResult[] {
  return Object.values(CANDIDATE_POOL);
}

// ── Graph ─────────────────────────────────────────────────────────────────

export async function getEmployeeGraph(employeeId: string): Promise<GraphResponse> {
  if (IS_MOCK) {
    await delay(400);
    return getMockGraph(employeeId);
  }
  const res = await fetch(`${API_BASE}/employees/${employeeId}/graph`);
  if (!res.ok) throw new Error("No se pudo cargar el grafo del empleado");
  return res.json();
}

// ── Project recommendation (primary flow) ────────────────────────────────

export async function getProjectRecommendations(
  project: SDAProject
): Promise<TeamCompositionResponse> {
  if (IS_MOCK) {
    await delay(700);
    return getMockTeamComposition({
      project_name: `[${project.codigo}] ${project.nombre}`,
      roles: project.roles,
    });
  }
  const res = await fetch(`${API_BASE}/team/compose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project_name: `[${project.codigo}] ${project.nombre}`,
      roles: project.roles,
    }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Error desconocido" }));
    throw new Error(error.detail ?? "Error al obtener recomendaciones");
  }
  return res.json();
}

// ── Team composition (free-form, kept for custom requirements) ────────────

export async function composeTeam(request: { project_name: string; roles: { role: string; quantity: number }[] }): Promise<TeamCompositionResponse> {
  if (IS_MOCK) {
    await delay(700);
    return getMockTeamComposition(request);
  }
  const res = await fetch(`${API_BASE}/team/compose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Error desconocido" }));
    throw new Error(error.detail ?? "Error al armar el equipo");
  }
  return res.json();
}

// ── Projects ──────────────────────────────────────────────────────────────

export async function getSDAProjects(): Promise<SDAProject[]> {
  if (IS_MOCK) {
    await delay(300);
    return MOCK_SDA_PROJECTS;
  }
  const res = await fetch(`${API_BASE}/projects`);
  if (!res.ok) throw new Error("No se pudieron cargar los proyectos SDA");
  return res.json();
}

// ── Networking & Mentoring ────────────────────────────────────────────────

export async function getNetworkingProfiles(
  tipo: NetworkingTipo | "all" = "all",
  query = ""
): Promise<NetworkingSearchResponse> {
  if (IS_MOCK) {
    await delay(500);
    let perfiles = getMockNetworkingProfiles();
    if (tipo !== "all") perfiles = perfiles.filter(p => p.tipo === tipo);
    if (query.trim()) {
      const q = query.toLowerCase();
      perfiles = perfiles.filter(p =>
        p.empleado.nombre.toLowerCase().includes(q) ||
        p.temas.some(t => t.toLowerCase().includes(q)) ||
        p.empleado.habilidades.some(h => h.nombre.toLowerCase().includes(q))
      );
    }
    return { query, tipo, perfiles, total: perfiles.length };
  }
  const params = new URLSearchParams({ tipo, query });
  const res = await fetch(`${API_BASE}/networking?${params}`);
  if (!res.ok) throw new Error("No se pudieron cargar los perfiles de networking");
  return res.json();
}

// ── B-Tokens ──────────────────────────────────────────────────────────────

export async function getUserBTokens(): Promise<BTokenWallet> {
  if (IS_MOCK) {
    await delay(200);
    return MOCK_USER_WALLET;
  }
  const res = await fetch(`${API_BASE}/btokens/me`);
  if (!res.ok) throw new Error("No se pudo cargar el wallet de B-Tokens");
  return res.json();
}

export async function requestNetworking(targetId: string): Promise<{ ok: boolean; nuevo_balance: number }> {
  if (IS_MOCK) {
    await delay(400);
    return { ok: true, nuevo_balance: MOCK_USER_WALLET.balance - 15 };
  }
  const res = await fetch(`${API_BASE}/networking/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target_id: targetId }),
  });
  if (!res.ok) throw new Error("No se pudo procesar la solicitud");
  return res.json();
}

export async function requestMentoring(targetId: string): Promise<{ ok: boolean; nuevo_balance: number }> {
  if (IS_MOCK) {
    await delay(400);
    return { ok: true, nuevo_balance: MOCK_USER_WALLET.balance - 30 };
  }
  const res = await fetch(`${API_BASE}/networking/mentoring`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mentor_id: targetId }),
  });
  if (!res.ok) throw new Error("No se pudo procesar la solicitud de mentoría");
  return res.json();
}
