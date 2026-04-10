from pydantic import BaseModel


class SearchRequest(BaseModel):
    query: str
    limit: int = 10


class SkillNode(BaseModel):
    nombre: str
    categoria: str
    score: float = 0.0


class ProyectoNode(BaseModel):
    id: str
    nombre: str
    dominio: str
    estado: str


class ColaboradorRef(BaseModel):
    id: str
    nombre: str
    rol: str
    weight: float


class EmpleadoResult(BaseModel):
    id: str
    nombre: str
    email: str
    rol: str
    squad: str
    nivel: str
    ubicacion: str
    bio: str
    score: float
    habilidades: list[SkillNode]
    proyectos: list[ProyectoNode]
    colaboradores: list[ColaboradorRef]


class SearchResponse(BaseModel):
    query: str
    intencion_detectada: str
    candidatos: list[EmpleadoResult]
    total: int


# ─── Modelos para el Grafo 360° ──────────────────────────────────────────────

class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # "empleado" | "habilidad" | "proyecto" | "colaborador"
    properties: dict


class GraphLink(BaseModel):
    source: str
    target: str
    type: str
    properties: dict = {}


class GraphResponse(BaseModel):
    nodes: list[GraphNode]
    links: list[GraphLink]
