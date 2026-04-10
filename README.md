# BBVA Talent — Knowledge Graph + GenAI

Motor semántico de talento que combina grafos de conocimiento con embeddings de OpenAI para descubrir perfiles de empleados en lenguaje natural.

---

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│  Next.js 16 (frontend)                              │
│  ┌──────────┐  ┌────────────┐  ┌─────────────────┐  │
│  │  Search  │→ │  Results   │→ │  Constellation  │  │
│  │  (home)  │  │  View      │  │  360° (graph)   │  │
│  └──────────┘  └────────────┘  └─────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP
┌──────────────────────▼──────────────────────────────┐
│  FastAPI (backend)                                  │
│  POST /search  ·  GET /employees/{id}/graph         │
└────────────┬────────────────────┬───────────────────┘
             │                    │
      ┌──────▼──────┐    ┌────────▼────────┐
      │   Neo4j     │    │  OpenAI API     │
      │  (grafos +  │    │  embeddings +   │
      │   vectores) │    │  intent LLM     │
      └─────────────┘    └─────────────────┘
```

## Stack

| Capa       | Tecnología                                      |
|------------|-------------------------------------------------|
| Frontend   | Next.js 16, React 19, Tailwind CSS v4           |
| Grafo UI   | react-force-graph-2d (canvas 2D con d3-force)  |
| Backend    | Python 3.11+, FastAPI, Pydantic v2              |
| Base datos | Neo4j Community Edition                         |
| IA         | OpenAI `text-embedding-3-small` + `gpt-4o-mini` |
| Tests      | Jest 30 + @testing-library/react                |

---

## Estructura del proyecto

```
bbva-talent/
├── frontend/                   # Next.js app
│   ├── app/
│   │   ├── page.tsx            # State machine: home → search → results → constellation
│   │   ├── layout.tsx          # Fonts (Syne + Space Mono)
│   │   └── globals.css         # Design system (CSS vars, keyframes, utilities)
│   ├── components/
│   │   ├── SearchingAnimation.tsx   # Animación 6-pasos con fuentes de datos
│   │   ├── ResultsView.tsx          # Vista de resultados con FeaturedCard
│   │   ├── ConstellationView.tsx    # Vista 360° con sidebar + grafo
│   │   ├── TalentGraph.tsx          # Grafo interactivo (ForceGraph2D + canvas)
│   │   └── CandidateCard.tsx        # Card de candidato con score ring
│   ├── lib/
│   │   ├── api.ts              # Cliente HTTP (con mock mode)
│   │   ├── bbva-colors.ts      # Paleta de colores BBVA
│   │   ├── mock-data.ts        # Datos mock para desarrollo sin backend
│   │   └── types.ts            # Tipos TypeScript compartidos
│   └── __tests__/              # Tests unitarios
├── backend/
│   └── app/
│       ├── main.py             # FastAPI app entry point
│       ├── api/routes.py       # Endpoints REST
│       ├── services/
│       │   ├── neo4j_service.py    # Consultas Cypher + similitud coseno
│       │   └── openai_service.py   # Embeddings + extracción de intención
│       └── core/
│           ├── config.py           # Settings (pydantic-settings)
│           └── database.py         # Driver async Neo4j
└── scripts/
    └── seed_neo4j.py           # Seed: 10 empleados, 28 skills, 8 proyectos
```

---

## Setup

### Prerequisitos

- Node.js 18+
- Python 3.11+
- Neo4j Community Edition (local o Docker)
- Cuenta OpenAI con acceso a embeddings

### 1. Neo4j

```bash
# Con Docker:
docker run -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:5-community
```

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Copiar y configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

`.env`:
```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
OPENAI_API_KEY=sk-...
```

```bash
# Seed de datos
python scripts/seed_neo4j.py

# Iniciar servidor
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install

# Modo mock (sin backend)
echo "NEXT_PUBLIC_MOCK=true" > .env.local

# Modo real (requiere backend corriendo)
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

npm run dev
```

La app estará disponible en `http://localhost:3000`.

---

## Modo Mock

El frontend puede funcionar completamente sin backend:

```env
# frontend/.env.local
NEXT_PUBLIC_MOCK=true
```

En este modo, `lib/api.ts` intercepta todas las llamadas y retorna datos estáticos de `lib/mock-data.ts`. Incluye 4 candidatos de muestra y 2 grafos de constelación.

---

## API Reference

### `POST /search`

Búsqueda semántica de empleados.

**Request:**
```json
{ "query": "Experto en pasarelas de pago y PSD2" }
```

**Response:**
```json
{
  "query": "Experto en pasarelas de pago y PSD2",
  "intencion_detectada": "Busca un profesional especializado en...",
  "total": 4,
  "candidatos": [
    {
      "id": "emp_001",
      "nombre": "Ana García",
      "rol": "Senior Backend Engineer",
      "score": 0.94,
      "habilidades": [...],
      "proyectos": [...],
      "colaboradores": [...]
    }
  ]
}
```

### `GET /employees/{id}/graph`

Grafo de constelación 360° de un empleado.

**Response:**
```json
{
  "nodes": [
    { "id": "emp_001", "label": "Ana García", "type": "empleado", "properties": {...} },
    { "id": "skill_001", "label": "PSD2", "type": "habilidad", "properties": {...} }
  ],
  "links": [
    { "source": "emp_001", "target": "skill_001", "type": "HAS_SKILL", "properties": {} }
  ]
}
```

---

## Tests

```bash
cd frontend
npm test                  # correr todos los tests
npm run test:watch        # modo watch
npm run test:coverage     # con reporte de cobertura
```

Los tests cubren: paleta de colores (`bbva-colors`), datos mock (`mock-data`), y el componente `CandidateCard`.

---

## Notas de arquitectura

**Similitud coseno manual en Neo4j**: La versión Community Edition no incluye índices vectoriales nativos (requiere AuraDB/Enterprise). La búsqueda usa una consulta Cypher que carga todos los embeddings y calcula la similitud en memoria. Para producción, migrar a Neo4j AuraDB o implementar un índice HNSW externo.

**State machine de vistas**: El frontend usa un state machine simple (`home → searching → results → constellation`) en lugar de routing para evitar parpadeos entre transiciones y mantener el estado de búsqueda entre vistas.

**Animación paralela al fetch**: `SearchingAnimation` corre en paralelo con la llamada al backend. Solo transiciona a resultados cuando ambos terminan (`animDone && dataReady`), garantizando una duración mínima de UX y ocultando la latencia de red.
