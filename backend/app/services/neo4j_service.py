"""
Servicio Neo4j: búsqueda vectorial y construcción del grafo 360°.
"""
from ..core.database import get_session
from ..models.talent import (
    EmpleadoResult,
    SkillNode,
    ProyectoNode,
    ColaboradorRef,
    GraphNode,
    GraphLink,
    GraphResponse,
)


async def cosine_similarity_search(
    query_embedding: list[float],
    limit: int = 10,
) -> list[EmpleadoResult]:
    """
    Búsqueda por similitud de coseno contra los embeddings de habilidades.
    Agrega los scores por empleado y devuelve los mejores candidatos.

    Nota: Neo4j 5.x tiene soporte nativo para índices vectoriales con
    db.index.vector.queryNodes(). Este query usa similitud manual para
    compatibilidad con Neo4j Community Edition.
    """
    cypher = """
    WITH $query_embedding AS qe
    MATCH (e:Empleado)-[:HAS_SKILL]->(s:Habilidad)
    WHERE s.embedding IS NOT NULL

    // Similitud coseno manual entre el embedding de la query y el de la habilidad
    WITH e, s, qe,
         reduce(dot = 0.0, i IN range(0, size(qe)-1) | dot + qe[i] * s.embedding[i]) AS dot_product,
         sqrt(reduce(norm_q = 0.0, x IN qe | norm_q + x*x)) AS norm_q,
         sqrt(reduce(norm_s = 0.0, x IN s.embedding | norm_s + x*x)) AS norm_s

    WITH e, s,
         CASE WHEN norm_q * norm_s = 0 THEN 0
              ELSE dot_product / (norm_q * norm_s)
         END AS cosine_sim

    // Agregar score por empleado (máxima similitud de sus skills)
    WITH e, max(cosine_sim) AS score
    ORDER BY score DESC
    LIMIT $limit

    // Hidratar con relaciones
    MATCH (e)-[:HAS_SKILL]->(s:Habilidad)
    OPTIONAL MATCH (e)-[:WORKED_ON]->(p:Proyecto)
    OPTIONAL MATCH (e)-[c:COLLABORATES_WITH]->(colab:Empleado)

    WITH e, score,
         collect(DISTINCT {nombre: s.nombre, categoria: s.categoria, score: 0.0}) AS habilidades,
         collect(DISTINCT {id: p.id, nombre: p.nombre, dominio: p.dominio, estado: p.estado}) AS proyectos,
         collect(DISTINCT {id: colab.id, nombre: colab.nombre, rol: colab.rol, weight: c.weight}) AS colaboradores

    RETURN
        e.id AS id,
        e.nombre AS nombre,
        e.email AS email,
        e.rol AS rol,
        e.squad AS squad,
        e.nivel AS nivel,
        e.ubicacion AS ubicacion,
        e.bio AS bio,
        score,
        habilidades,
        proyectos,
        [c IN colaboradores WHERE c.id IS NOT NULL] AS colaboradores
    ORDER BY score DESC
    """

    results = []
    async with get_session() as session:
        cursor = await session.run(
            cypher,
            query_embedding=query_embedding,
            limit=limit,
        )
        records = await cursor.data()

        for record in records:
            # Filtrar nulls de proyectos con id null
            proyectos = [
                ProyectoNode(**p)
                for p in record["proyectos"]
                if p.get("id") is not None
            ]
            colaboradores = [
                ColaboradorRef(**c)
                for c in record["colaboradores"]
                if c.get("id") is not None
            ]
            habilidades = [SkillNode(**s) for s in record["habilidades"]]

            results.append(
                EmpleadoResult(
                    id=record["id"],
                    nombre=record["nombre"],
                    email=record["email"],
                    rol=record["rol"],
                    squad=record["squad"],
                    nivel=record["nivel"],
                    ubicacion=record["ubicacion"],
                    bio=record["bio"],
                    score=round(record["score"], 4),
                    habilidades=habilidades,
                    proyectos=proyectos,
                    colaboradores=colaboradores,
                )
            )

    return results


async def get_employee_graph(employee_id: str) -> GraphResponse:
    """
    Construye el grafo 360° de un empleado:
    - Nodo central: Empleado
    - Nodos conectados: Habilidades, Proyectos, Colaboradores
    """
    cypher = """
    MATCH (e:Empleado {id: $emp_id})
    OPTIONAL MATCH (e)-[hs:HAS_SKILL]->(s:Habilidad)
    OPTIONAL MATCH (e)-[wo:WORKED_ON]->(p:Proyecto)
    OPTIONAL MATCH (e)-[cw:COLLABORATES_WITH]->(colab:Empleado)

    RETURN
        e,
        collect(DISTINCT {skill: s, rel: hs}) AS skills_data,
        collect(DISTINCT {proj: p, rel: wo}) AS projects_data,
        collect(DISTINCT {colab: colab, rel: cw}) AS colabs_data
    """

    async with get_session() as session:
        cursor = await session.run(cypher, emp_id=employee_id)
        record = await cursor.single()

        if not record:
            return GraphResponse(nodes=[], links=[])

        emp = record["e"]
        nodes: list[GraphNode] = []
        links: list[GraphLink] = []

        # Nodo central — empleado
        center_id = f"emp_{emp['id']}"
        nodes.append(GraphNode(
            id=center_id,
            label=emp["nombre"],
            type="empleado",
            properties={
                "rol": emp["rol"],
                "squad": emp["squad"],
                "nivel": emp["nivel"],
                "ubicacion": emp["ubicacion"],
                "email": emp["email"],
            },
        ))

        # Nodos de habilidades
        for item in record["skills_data"]:
            skill = item["skill"]
            if skill is None:
                continue
            skill_id = f"skill_{skill['nombre'].replace(' ', '_')}"
            nodes.append(GraphNode(
                id=skill_id,
                label=skill["nombre"],
                type="habilidad",
                properties={"categoria": skill["categoria"]},
            ))
            links.append(GraphLink(
                source=center_id,
                target=skill_id,
                type="HAS_SKILL",
                properties={"nivel_dominio": item["rel"].get("nivel_dominio", "")},
            ))

        # Nodos de proyectos
        for item in record["projects_data"]:
            proj = item["proj"]
            if proj is None:
                continue
            proj_id = f"proj_{proj['id']}"
            nodes.append(GraphNode(
                id=proj_id,
                label=proj["nombre"],
                type="proyecto",
                properties={
                    "dominio": proj["dominio"],
                    "estado": proj["estado"],
                },
            ))
            links.append(GraphLink(
                source=center_id,
                target=proj_id,
                type="WORKED_ON",
                properties={"rol_en_proyecto": item["rel"].get("rol_en_proyecto", "")},
            ))

        # Nodos de colaboradores
        for item in record["colabs_data"]:
            colab = item["colab"]
            if colab is None:
                continue
            colab_node_id = f"emp_{colab['id']}"
            # Evitar duplicados si ya fue añadido
            if not any(n.id == colab_node_id for n in nodes):
                nodes.append(GraphNode(
                    id=colab_node_id,
                    label=colab["nombre"],
                    type="colaborador",
                    properties={"rol": colab["rol"]},
                ))
            links.append(GraphLink(
                source=center_id,
                target=colab_node_id,
                type="COLLABORATES_WITH",
                properties={"weight": item["rel"].get("weight", 0)},
            ))

        return GraphResponse(nodes=nodes, links=links)
