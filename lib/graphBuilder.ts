import type { GraphResponse, GraphNode, GraphLink, EmpleadoResult } from "./types";
import { CANDIDATE_POOL } from "./mock-data";
import { STAFFING_PROFILES } from "./staffing-mock";

/**
 * Builds an enriched graph for an employee that distinguishes between:
 *   - Current project(s): assignments in the most recent quarter
 *   - Past projects: assignments from previous quarters
 *   - Current teammates: other employees sharing a current project this quarter
 *   - Historical collaborators: people who appear in the candidate's
 *     `colaboradores` list but aren't on a current project together
 *   - Skills (top 6 by score)
 *
 * The graph uses these node types:
 *   - "empleado"        → the central employee
 *   - "habilidad"       → skill nodes (top 6)
 *   - "proyecto-actual" → projects in the most recent quarter
 *   - "proyecto"        → past projects (kept for backwards compat)
 *   - "teammate"        → coworker on a current project this quarter
 *   - "colaborador"     → historical collaborator (no shared current project)
 *
 * And these link types:
 *   - "HAS_SKILL"
 *   - "WORKING_ON"        → to current projects (highlighted)
 *   - "WORKED_ON"         → to past projects (dimmer)
 *   - "TEAMMATE_OF"       → to current teammates
 *   - "COLLABORATES_WITH" → to historical collaborators
 */
export function buildEnrichedGraph(employeeId: string): GraphResponse {
  const employee = CANDIDATE_POOL[employeeId];
  if (!employee) {
    return { nodes: [], links: [] };
  }

  const profile = STAFFING_PROFILES[employeeId];
  const staffing = profile?.staffing_historico ?? employee.staffing_historico ?? [];

  // ── Determine the "current" quarter (most recent in the history) ──
  const quarters = Array.from(new Set(staffing.map(r => r.quarter))).sort();
  const currentQuarter = quarters[quarters.length - 1];

  const currentRecords = currentQuarter
    ? staffing.filter(r => r.quarter === currentQuarter)
    : [];
  const pastRecords = currentQuarter
    ? staffing.filter(r => r.quarter !== currentQuarter)
    : staffing;

  // Unique projects, separated by current vs past
  const currentProjectCodes = new Set(currentRecords.map(r => r.proyecto_codigo));
  const pastProjectCodes = new Set(
    pastRecords
      .filter(r => !currentProjectCodes.has(r.proyecto_codigo))
      .map(r => r.proyecto_codigo)
  );

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  const empNodeId = `emp_${employeeId}`;

  // ── 1. Central employee node ──
  nodes.push({
    id: empNodeId,
    label: employee.nombre,
    type: "empleado",
    properties: {
      rol: employee.rol,
      squad: employee.squad,
      nivel: employee.nivel,
      ubicacion: employee.ubicacion,
      ...(employee.registro ? { registro: employee.registro } : {}),
    },
  });

  // ── 2. Skills (top 6 by score) ──
  const topSkills = [...employee.habilidades]
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  for (const skill of topSkills) {
    const skillNodeId = `skill_${skill.nombre.replace(/\s+/g, "_")}`;
    nodes.push({
      id: skillNodeId,
      label: skill.nombre,
      type: "habilidad",
      properties: { categoria: skill.categoria, score: skill.score },
    });
    links.push({
      source: empNodeId,
      target: skillNodeId,
      type: "HAS_SKILL",
      properties: { score: skill.score },
    });
  }

  // ── 3. Current projects + WORKING_ON links ──
  const currentProjectsByCode = new Map<string, { nombre: string; fte: number; dominio?: string }>();
  for (const r of currentRecords) {
    if (currentProjectsByCode.has(r.proyecto_codigo)) {
      // Aggregate FTE if multiple records for same project in same quarter
      const cur = currentProjectsByCode.get(r.proyecto_codigo)!;
      cur.fte += r.fte;
    } else {
      currentProjectsByCode.set(r.proyecto_codigo, {
        nombre: r.proyecto_nombre,
        fte: r.fte,
        dominio: r.dominio,
      });
    }
  }

  for (const [codigo, data] of currentProjectsByCode.entries()) {
    const projNodeId = `proj_${codigo}`;
    nodes.push({
      id: projNodeId,
      label: `${codigo} · ${data.nombre}`,
      type: "proyecto-actual",
      properties: {
        codigo,
        nombre: data.nombre,
        fte: data.fte,
        ...(data.dominio ? { dominio: data.dominio } : {}),
        ...(currentQuarter ? { quarter: currentQuarter } : {}),
      },
    });
    links.push({
      source: empNodeId,
      target: projNodeId,
      type: "WORKING_ON",
      properties: { fte: data.fte, ...(currentQuarter ? { quarter: currentQuarter } : {}) },
    });
  }

  // ── 4. Past projects + WORKED_ON links ──
  const pastProjectsByCode = new Map<string, { nombre: string; quarters: string[]; dominio?: string }>();
  for (const r of pastRecords) {
    if (currentProjectCodes.has(r.proyecto_codigo)) continue; // already in current
    if (pastProjectsByCode.has(r.proyecto_codigo)) {
      pastProjectsByCode.get(r.proyecto_codigo)!.quarters.push(r.quarter);
    } else {
      pastProjectsByCode.set(r.proyecto_codigo, {
        nombre: r.proyecto_nombre,
        quarters: [r.quarter],
        dominio: r.dominio,
      });
    }
  }

  for (const [codigo, data] of pastProjectsByCode.entries()) {
    const projNodeId = `proj_${codigo}`;
    nodes.push({
      id: projNodeId,
      label: `${codigo} · ${data.nombre}`,
      type: "proyecto",
      properties: {
        codigo,
        nombre: data.nombre,
        ...(data.dominio ? { dominio: data.dominio } : {}),
        quarters: data.quarters.join(", "),
      },
    });
    links.push({
      source: empNodeId,
      target: projNodeId,
      type: "WORKED_ON",
      properties: { quarters: data.quarters.join(", ") },
    });
  }

  // Also add legacy projects from `proyectos` field if not already present
  // (covers cases where staffing_historico is empty but `proyectos` has entries)
  for (const proj of employee.proyectos) {
    const projNodeId = `proj_${proj.id}`;
    if (nodes.find(n => n.id === projNodeId)) continue; // already added
    nodes.push({
      id: projNodeId,
      label: proj.nombre,
      type: "proyecto",
      properties: { dominio: proj.dominio, estado: proj.estado },
    });
    links.push({
      source: empNodeId,
      target: projNodeId,
      type: "WORKED_ON",
      properties: { estado: proj.estado },
    });
  }

  // ── 5. Find current teammates ──
  // Other employees who have the same current project in their staffing history
  const teammateIds = new Set<string>();

  for (const [otherId, otherProfile] of Object.entries(STAFFING_PROFILES)) {
    if (otherId === employeeId) continue;
    if (!otherProfile.staffing_historico) continue;

    const sharedCurrent = otherProfile.staffing_historico.some(
      r => r.quarter === currentQuarter && currentProjectCodes.has(r.proyecto_codigo)
    );
    if (sharedCurrent) teammateIds.add(otherId);
  }

  for (const tid of teammateIds) {
    const teammate = CANDIDATE_POOL[tid];
    if (!teammate) continue;
    const teammateNodeId = `emp_${tid}`;

    // Find which current project they share with the central employee
    const otherStaffing = STAFFING_PROFILES[tid]?.staffing_historico ?? [];
    const sharedProjectCode = otherStaffing.find(
      r => r.quarter === currentQuarter && currentProjectCodes.has(r.proyecto_codigo)
    )?.proyecto_codigo;

    nodes.push({
      id: teammateNodeId,
      label: teammate.nombre,
      type: "teammate",
      properties: {
        rol: teammate.rol,
        squad: teammate.squad,
        nivel: teammate.nivel,
        ...(sharedProjectCode ? { proyecto_compartido: sharedProjectCode } : {}),
      },
    });

    // Link from employee → teammate
    links.push({
      source: empNodeId,
      target: teammateNodeId,
      type: "TEAMMATE_OF",
      properties: { ...(sharedProjectCode ? { proyecto: sharedProjectCode } : {}) },
    });

    // Also link teammate → shared project so the graph clusters around it
    if (sharedProjectCode) {
      links.push({
        source: teammateNodeId,
        target: `proj_${sharedProjectCode}`,
        type: "WORKING_ON",
        properties: {},
      });
    }
  }

  // ── 6. Historical collaborators (from `colaboradores` field, excluding current teammates) ──
  for (const colab of employee.colaboradores) {
    if (teammateIds.has(colab.id)) continue; // already added as teammate

    const colabNodeId = `emp_${colab.id}`;
    if (nodes.find(n => n.id === colabNodeId)) continue;

    nodes.push({
      id: colabNodeId,
      label: colab.nombre,
      type: "colaborador",
      properties: { rol: colab.rol, weight: colab.weight },
    });
    links.push({
      source: empNodeId,
      target: colabNodeId,
      type: "COLLABORATES_WITH",
      properties: { weight: colab.weight },
    });
  }

  return { nodes, links };
}

/**
 * Returns a small summary describing the graph composition.
 * Useful for the sidebar to show "current project: X · 3 teammates this Q".
 */
export interface GraphContextSummary {
  currentQuarter: string | null;
  currentProjectCount: number;
  currentTeammateCount: number;
  pastProjectCount: number;
  historicalCollaboratorCount: number;
}

export function summarizeGraphContext(employeeId: string): GraphContextSummary {
  const employee = CANDIDATE_POOL[employeeId];
  if (!employee) {
    return {
      currentQuarter: null,
      currentProjectCount: 0,
      currentTeammateCount: 0,
      pastProjectCount: 0,
      historicalCollaboratorCount: 0,
    };
  }

  const staffing = STAFFING_PROFILES[employeeId]?.staffing_historico ?? [];
  const quarters = Array.from(new Set(staffing.map(r => r.quarter))).sort();
  const currentQuarter = quarters[quarters.length - 1] ?? null;

  const currentProjects = currentQuarter
    ? new Set(staffing.filter(r => r.quarter === currentQuarter).map(r => r.proyecto_codigo))
    : new Set<string>();

  const pastProjects = new Set(
    staffing.filter(r => !currentProjects.has(r.proyecto_codigo)).map(r => r.proyecto_codigo)
  );

  let teammateCount = 0;
  for (const [otherId, otherProfile] of Object.entries(STAFFING_PROFILES)) {
    if (otherId === employeeId) continue;
    if (!otherProfile.staffing_historico) continue;
    const shared = otherProfile.staffing_historico.some(
      r => r.quarter === currentQuarter && currentProjects.has(r.proyecto_codigo)
    );
    if (shared) teammateCount++;
  }

  return {
    currentQuarter,
    currentProjectCount: currentProjects.size,
    currentTeammateCount: teammateCount,
    pastProjectCount: pastProjects.size,
    historicalCollaboratorCount: employee.colaboradores.length,
  };
}
