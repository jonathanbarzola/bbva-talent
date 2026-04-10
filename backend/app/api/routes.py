from fastapi import APIRouter, HTTPException, Query
from ..models.talent import SearchRequest, SearchResponse, GraphResponse
from ..services import openai_service, neo4j_service

router = APIRouter()


@router.post("/search", response_model=SearchResponse)
async def search_talent(body: SearchRequest):
    """
    Motor de búsqueda semántica de talento.

    Flujo:
    1. OpenAI extrae la intención semántica de la query
    2. OpenAI genera el embedding vectorial de la query expandida
    3. Neo4j realiza la búsqueda por similitud coseno contra embeddings de habilidades
    4. Se devuelven los candidatos rankeados con su contexto completo
    """
    if not body.query.strip():
        raise HTTPException(status_code=400, detail="La query no puede estar vacía.")

    try:
        # Paso 1: Extraer intención semántica
        intent = await openai_service.extract_search_intent(body.query)
        query_expandida = intent.get("query_expandida", body.query)
        intencion = intent.get("intencion", body.query)

        # Paso 2: Generar embedding de la query expandida
        query_embedding = await openai_service.get_embedding(query_expandida)

        # Paso 3: Búsqueda vectorial en Neo4j
        candidatos = await neo4j_service.cosine_similarity_search(
            query_embedding=query_embedding,
            limit=body.limit,
        )

        return SearchResponse(
            query=body.query,
            intencion_detectada=intencion,
            candidatos=candidatos,
            total=len(candidatos),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en la búsqueda: {str(e)}")


@router.get("/employees/{employee_id}/graph", response_model=GraphResponse)
async def get_employee_graph(employee_id: str):
    """
    Devuelve el grafo 360° (Constelación) de un empleado.
    Incluye: habilidades, proyectos y colaboradores directos.
    """
    graph = await neo4j_service.get_employee_graph(employee_id)
    if not graph.nodes:
        raise HTTPException(status_code=404, detail=f"Empleado '{employee_id}' no encontrado.")
    return graph


@router.get("/employees/{employee_id}/profile")
async def get_employee_profile(employee_id: str):
    """
    Perfil completo de un empleado para la vista de detalle.
    """
    from ..core.database import get_session

    async with get_session() as session:
        result = await session.run(
            """
            MATCH (e:Empleado {id: $emp_id})
            OPTIONAL MATCH (e)-[:HAS_SKILL]->(s:Habilidad)
            OPTIONAL MATCH (e)-[:WORKED_ON]->(p:Proyecto)
            OPTIONAL MATCH (e)-[c:COLLABORATES_WITH]->(colab:Empleado)
            RETURN e,
                   collect(DISTINCT s {.nombre, .categoria}) AS habilidades,
                   collect(DISTINCT p {.id, .nombre, .dominio, .estado}) AS proyectos,
                   collect(DISTINCT {id: colab.id, nombre: colab.nombre, rol: colab.rol, weight: c.weight}) AS colaboradores
            """,
            emp_id=employee_id,
        )
        record = await result.single()

    if not record:
        raise HTTPException(status_code=404, detail="Empleado no encontrado.")

    emp = dict(record["e"])
    emp.pop("embedding", None)  # No exponer el vector en la API

    return {
        **emp,
        "habilidades": record["habilidades"],
        "proyectos": [p for p in record["proyectos"] if p.get("id")],
        "colaboradores": [c for c in record["colaboradores"] if c.get("id")],
    }
