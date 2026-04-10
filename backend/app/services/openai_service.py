"""
Servicio OpenAI: embeddings y extracción de intención semántica.
"""
import json
from openai import AsyncOpenAI
from ..core.config import settings

_client: AsyncOpenAI | None = None


def get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


async def get_embedding(text: str) -> list[float]:
    """Genera un embedding vectorial para el texto dado."""
    client = get_client()
    response = await client.embeddings.create(
        model=settings.OPENAI_EMBEDDING_MODEL,
        input=text,
    )
    return response.data[0].embedding


async def extract_search_intent(query: str) -> dict:
    """
    Usa un LLM para extraer la intención semántica de la búsqueda.
    Devuelve las habilidades clave, el dominio y una descripción del perfil buscado.
    """
    client = get_client()

    system_prompt = """Sos un asistente especializado en RRHH para una empresa fintech (BBVA).
Tu tarea es analizar una consulta de búsqueda de talento y extraer su intención.

Respondé ÚNICAMENTE con un JSON válido con esta estructura:
{
  "intencion": "descripción clara de qué perfil se busca",
  "habilidades_clave": ["skill1", "skill2", "skill3"],
  "dominio": "área principal (ej: Pagos, ML, DevOps, Mobile, Seguridad)",
  "nivel_sugerido": "Junior|Mid|Senior|Staff o null si no se especifica",
  "query_expandida": "versión expandida de la query con sinónimos y términos relacionados para búsqueda semántica"
}"""

    response = await client.chat.completions.create(
        model=settings.OPENAI_CHAT_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Consulta: {query}"},
        ],
        temperature=0.1,
        response_format={"type": "json_object"},
    )

    return json.loads(response.choices[0].message.content)
