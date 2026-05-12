"""
Generador del diagrama de arquitectura AWS para BBVA Talent.
Produce docs/aws-architecture-diagram.excalidraw.

Diseño:
- 10 capas verticales con colores distintivos (edge, frontend, auth, api, data, ai, integration, on-prem, cross-cutting)
- Cajas componentes dentro de cada capa
- Flechas mostrando el flow principal de datos
- Compatible con Excalidraw v2 schema, fontFamily 5 (Excalifont)
"""
import json
import os
import random
import string

random.seed(42)  # ids reproducibles

# ── helpers ───────────────────────────────────────────────────────────────────

_counter = 0
def nid(prefix="e"):
    global _counter
    _counter += 1
    return f"{prefix}-{_counter:04d}-{''.join(random.choices(string.ascii_lowercase + string.digits, k=8))}"

def seed():
    return random.randint(100000, 999999999)

elements = []

def add_zone(x, y, w, h, fill, stroke):
    """Capa de fondo amplia."""
    eid = nid("zone")
    elements.append({
        "type": "rectangle",
        "id": eid, "x": x, "y": y, "width": w, "height": h, "angle": 0,
        "strokeColor": stroke, "backgroundColor": fill, "fillStyle": "solid",
        "strokeWidth": 1, "strokeStyle": "solid", "roughness": 0, "opacity": 100,
        "groupIds": [], "frameId": None, "roundness": {"type": 3},
        "seed": seed(), "versionNonce": seed(), "isDeleted": False,
        "boundElements": [], "updated": 1, "link": None, "locked": False,
    })
    return eid

def add_box(x, y, w, h, text, fill="#ffffff", stroke="#1971c2", text_color="#0a1628",
            font_size=16, stroke_width=2, bold=False):
    """Caja componente con texto centrado."""
    box_id = nid("box")
    text_id = nid("txt")
    elements.append({
        "type": "rectangle",
        "id": box_id, "x": x, "y": y, "width": w, "height": h, "angle": 0,
        "strokeColor": stroke, "backgroundColor": fill, "fillStyle": "solid",
        "strokeWidth": stroke_width, "strokeStyle": "solid", "roughness": 1, "opacity": 100,
        "groupIds": [], "frameId": None, "roundness": {"type": 3},
        "seed": seed(), "versionNonce": seed(), "isDeleted": False,
        "boundElements": [{"id": text_id, "type": "text"}],
        "updated": 1, "link": None, "locked": False,
    })
    elements.append({
        "type": "text",
        "id": text_id, "x": x, "y": y, "width": w, "height": h, "angle": 0,
        "strokeColor": text_color, "backgroundColor": "transparent", "fillStyle": "solid",
        "strokeWidth": 1, "strokeStyle": "solid", "roughness": 1, "opacity": 100,
        "groupIds": [], "frameId": None, "roundness": None,
        "seed": seed(), "versionNonce": seed(), "isDeleted": False,
        "boundElements": [], "updated": 1, "link": None, "locked": False,
        "fontSize": font_size, "fontFamily": 5, "text": text,
        "textAlign": "center", "verticalAlign": "middle",
        "containerId": box_id, "originalText": text,
        "lineHeight": 1.25,
    })
    return box_id

def add_text(x, y, w, h, text, color="#0a1628", font_size=16, align="left", bold=False):
    """Texto libre, no asociado a un container."""
    tid = nid("txt")
    elements.append({
        "type": "text",
        "id": tid, "x": x, "y": y, "width": w, "height": h, "angle": 0,
        "strokeColor": color, "backgroundColor": "transparent", "fillStyle": "solid",
        "strokeWidth": 1, "strokeStyle": "solid", "roughness": 1, "opacity": 100,
        "groupIds": [], "frameId": None, "roundness": None,
        "seed": seed(), "versionNonce": seed(), "isDeleted": False,
        "boundElements": [], "updated": 1, "link": None, "locked": False,
        "fontSize": font_size, "fontFamily": 5, "text": text,
        "textAlign": align, "verticalAlign": "top",
        "containerId": None, "originalText": text,
        "lineHeight": 1.25,
    })
    return tid

def add_arrow(x1, y1, x2, y2, label=None, color="#1971c2", style="solid", width=2):
    """Flecha entre dos puntos con label opcional."""
    aid = nid("arr")
    dx = x2 - x1
    dy = y2 - y1
    arrow_el = {
        "type": "arrow",
        "id": aid, "x": x1, "y": y1, "width": abs(dx), "height": abs(dy), "angle": 0,
        "strokeColor": color, "backgroundColor": "transparent", "fillStyle": "solid",
        "strokeWidth": width, "strokeStyle": style, "roughness": 1, "opacity": 100,
        "groupIds": [], "frameId": None, "roundness": {"type": 2},
        "seed": seed(), "versionNonce": seed(), "isDeleted": False,
        "boundElements": [], "updated": 1, "link": None, "locked": False,
        "points": [[0, 0], [dx, dy]],
        "lastCommittedPoint": None,
        "startBinding": None, "endBinding": None,
        "startArrowhead": None, "endArrowhead": "arrow",
        "elbowed": False,
    }
    elements.append(arrow_el)
    if label:
        # bound label as text
        lid = nid("lbl")
        mid_x = (x1 + x2) / 2 - 60
        mid_y = (y1 + y2) / 2 - 12
        elements.append({
            "type": "text",
            "id": lid, "x": mid_x, "y": mid_y, "width": 120, "height": 24, "angle": 0,
            "strokeColor": color, "backgroundColor": "#ffffff", "fillStyle": "solid",
            "strokeWidth": 1, "strokeStyle": "solid", "roughness": 0, "opacity": 100,
            "groupIds": [], "frameId": None, "roundness": None,
            "seed": seed(), "versionNonce": seed(), "isDeleted": False,
            "boundElements": [], "updated": 1, "link": None, "locked": False,
            "fontSize": 12, "fontFamily": 5, "text": label,
            "textAlign": "center", "verticalAlign": "middle",
            "containerId": None, "originalText": label,
            "lineHeight": 1.25,
        })
    return aid


# ── Color palette by layer ────────────────────────────────────────────────────

C = {
    "users":      {"fill": "#fff",     "stroke": "#495057", "text": "#212529"},
    "edge_zone":  {"fill": "#e7f5ff",  "stroke": "#74c0fc"},
    "edge_box":   {"fill": "#a5d8ff",  "stroke": "#1c7ed6"},
    "fe_zone":    {"fill": "#f3f0ff",  "stroke": "#9775fa"},
    "fe_box":     {"fill": "#d0bfff",  "stroke": "#7048e8"},
    "auth_zone":  {"fill": "#ebfbee",  "stroke": "#51cf66"},
    "auth_box":   {"fill": "#b2f2bb",  "stroke": "#2f9e44"},
    "api_zone":   {"fill": "#fff4e6",  "stroke": "#fd7e14"},
    "api_box":    {"fill": "#ffd8a8",  "stroke": "#e8590c"},
    "data_zone":  {"fill": "#e7f5ff",  "stroke": "#339af0"},
    "data_box":   {"fill": "#74c0fc",  "stroke": "#1971c2"},
    "ai_zone":    {"fill": "#f8f0fc",  "stroke": "#cc5de8"},
    "ai_box":     {"fill": "#e599f7",  "stroke": "#9c36b5"},
    "int_zone":   {"fill": "#fff9db",  "stroke": "#fcc419"},
    "int_box":    {"fill": "#ffe066",  "stroke": "#f08c00"},
    "op_zone":    {"fill": "#f1f3f5",  "stroke": "#868e96"},
    "op_box":     {"fill": "#ced4da",  "stroke": "#495057"},
    "cc_zone":    {"fill": "#f8f9fa",  "stroke": "#adb5bd"},
}

ARROW_MAIN  = "#1971c2"
ARROW_BBVA  = "#9c36b5"  # bidi privatelink/direct connect

# ── Diagram ───────────────────────────────────────────────────────────────────

W = 2200

# Title
add_text(700, 20, 800, 60, "BBVA Talent — Arquitectura de producción en AWS",
         color="#0a1628", font_size=30, align="center")
add_text(700, 65, 800, 30, "1.800 colaboradores · multi-region (Frankfurt / Madrid) · GDPR + ISO 27001",
         color="#495057", font_size=14, align="center")

# Row 1 — Users
USERS_X, USERS_Y, USERS_W, USERS_H = 900, 120, 400, 60
add_box(USERS_X, USERS_Y, USERS_W, USERS_H,
        "👥  1.800 colaboradores BBVA Engineering",
        fill=C["users"]["fill"], stroke=C["users"]["stroke"],
        text_color=C["users"]["text"], font_size=16, stroke_width=2)

# Row 2 — Edge
EDGE_Y = 220
add_zone(100, EDGE_Y, 2000, 140, C["edge_zone"]["fill"], C["edge_zone"]["stroke"])
add_text(120, EDGE_Y + 8, 200, 24, "▎ EDGE LAYER", color="#1c7ed6", font_size=14)
ROUTE53_CX = 820
add_box(ROUTE53_CX - 130, EDGE_Y + 45, 260, 70, "Route 53\n(DNS latency-based)",
        fill=C["edge_box"]["fill"], stroke=C["edge_box"]["stroke"], font_size=14)
CF_CX = 1260
add_box(CF_CX - 170, EDGE_Y + 45, 340, 70, "CloudFront + WAF + Shield\n(CDN global)",
        fill=C["edge_box"]["fill"], stroke=C["edge_box"]["stroke"], font_size=14)

# Row 3 — Frontend
FE_Y = 390
add_zone(100, FE_Y, 2000, 110, C["fe_zone"]["fill"], C["fe_zone"]["stroke"])
add_text(120, FE_Y + 8, 200, 24, "▎ FRONTEND", color="#7048e8", font_size=14)
AMPLIFY_CX = 1100
add_box(AMPLIFY_CX - 280, FE_Y + 35, 560, 60,
        "AWS Amplify Hosting  ·  Next.js 16 (SSR + ISR)",
        fill=C["fe_box"]["fill"], stroke=C["fe_box"]["stroke"], font_size=15)

# Row 4 — Auth
AUTH_Y = 530
add_zone(100, AUTH_Y, 2000, 110, C["auth_zone"]["fill"], C["auth_zone"]["stroke"])
add_text(120, AUTH_Y + 8, 200, 24, "▎ AUTH", color="#2f9e44", font_size=14)
COGNITO_CX = 900
add_box(COGNITO_CX - 150, AUTH_Y + 35, 300, 60, "Cognito User Pool",
        fill=C["auth_box"]["fill"], stroke=C["auth_box"]["stroke"], font_size=14)
add_text(COGNITO_CX + 160, AUTH_Y + 50, 60, 24, "⇄", color="#2f9e44", font_size=24, align="center")
ENTRA_CX = 1300
add_box(ENTRA_CX - 200, AUTH_Y + 35, 400, 60,
        "Microsoft Entra ID (corporate IdP)",
        fill="#d8f5a2", stroke=C["auth_box"]["stroke"], font_size=13)

# Row 5 — API
API_Y = 670
add_zone(100, API_Y, 2000, 150, C["api_zone"]["fill"], C["api_zone"]["stroke"])
add_text(120, API_Y + 8, 200, 24, "▎ API LAYER", color="#e8590c", font_size=14)
GW_CX = 380
add_box(GW_CX - 150, API_Y + 50, 300, 70,
        "API Gateway\n(REST + WebSocket)",
        fill=C["api_box"]["fill"], stroke=C["api_box"]["stroke"], font_size=14)
LBD_CX = 780
add_box(LBD_CX - 110, API_Y + 50, 220, 70,
        "Lambda\n(queries CRUD)",
        fill=C["api_box"]["fill"], stroke=C["api_box"]["stroke"], font_size=14)
ECS_CX = 1180
add_box(ECS_CX - 170, API_Y + 50, 340, 70,
        "ECS Fargate\n(KG queries · ML orchestration)",
        fill=C["api_box"]["fill"], stroke=C["api_box"]["stroke"], font_size=13)
SF_CX = 1620
add_box(SF_CX - 170, API_Y + 50, 340, 70,
        "Step Functions\n(EDI cycles · workflows)",
        fill=C["api_box"]["fill"], stroke=C["api_box"]["stroke"], font_size=14)

# Row 6 — Data Layer (6 cajas)
DATA_Y = 860
add_zone(100, DATA_Y, 2000, 180, C["data_zone"]["fill"], C["data_zone"]["stroke"])
add_text(120, DATA_Y + 8, 200, 24, "▎ DATA LAYER", color="#1971c2", font_size=14)

data_boxes = [
    ("Aurora Postgres\nServerless v2",          180,  300),
    ("Neptune\n(Knowledge Graph)",              500,  300),
    ("OpenSearch\n(vector + full-text)",        820,  300),
    ("DynamoDB\n(B-Tokens · sessions)",        1140,  300),
    ("S3 (WORM)\nexports · audit logs",        1460,  300),
    ("ElastiCache Redis\n(query cache · RT)",  1780,  300),
]
data_centers = []
for label, x, w in data_boxes:
    add_box(x, DATA_Y + 50, w, 100, label,
            fill=C["data_box"]["fill"], stroke=C["data_box"]["stroke"],
            text_color="#0c2a4a", font_size=13)
    data_centers.append((x + w / 2, DATA_Y + 50))

# Row 7 — AI/ML
AI_Y = 1080
add_zone(100, AI_Y, 2000, 140, C["ai_zone"]["fill"], C["ai_zone"]["stroke"])
add_text(120, AI_Y + 8, 200, 24, "▎ AI / ML LAYER", color="#9c36b5", font_size=14)
BR_CX = 700
add_box(BR_CX - 300, AI_Y + 45, 600, 80,
        "AWS Bedrock\nClaude Opus 4.7  ·  Titan Embeddings",
        fill=C["ai_box"]["fill"], stroke=C["ai_box"]["stroke"], font_size=14)
SM_CX = 1500
add_box(SM_CX - 300, AI_Y + 45, 600, 80,
        "SageMaker\nteam-success-predictor  ·  retention-risk",
        fill=C["ai_box"]["fill"], stroke=C["ai_box"]["stroke"], font_size=14)

# Row 8 — Integration
INT_Y = 1260
add_zone(100, INT_Y, 2000, 140, C["int_zone"]["fill"], C["int_zone"]["stroke"])
add_text(120, INT_Y + 8, 220, 24, "▎ INTEGRATION", color="#f08c00", font_size=14)
EB_CX = 500
add_box(EB_CX - 170, INT_Y + 45, 340, 80,
        "EventBridge\n(event bus · async)",
        fill=C["int_box"]["fill"], stroke=C["int_box"]["stroke"], font_size=14)
MSK_CX = 1080
add_box(MSK_CX - 170, INT_Y + 45, 340, 80,
        "MSK Kafka\n(streaming HR events)",
        fill=C["int_box"]["fill"], stroke=C["int_box"]["stroke"], font_size=14)
GLUE_CX = 1660
add_box(GLUE_CX - 170, INT_Y + 45, 340, 80,
        "Glue\n(ETL nightly batches)",
        fill=C["int_box"]["fill"], stroke=C["int_box"]["stroke"], font_size=14)

# Row 9 — BBVA On-Prem
OP_Y = 1440
add_zone(100, OP_Y, 2000, 180, C["op_zone"]["fill"], C["op_zone"]["stroke"])
add_text(120, OP_Y + 8, 600, 24,
         "▎ BBVA ON-PREM   ←  PrivateLink + Direct Connect  →",
         color="#495057", font_size=14)
op_boxes = [
    ("HR Hub\nWorkday / SAP SF",  220, 380),
    ("SDA System\n(catálogo SDA)", 640, 380),
    ("EDI System",                1060, 380),
    ("B-Tokens API",              1480, 380),
]
for label, x, w in op_boxes:
    add_box(x, OP_Y + 55, w, 100, label,
            fill=C["op_box"]["fill"], stroke=C["op_box"]["stroke"], font_size=14)

# Row 10 — Cross-cutting
CC_Y = 1660
add_zone(100, CC_Y, 2000, 160, C["cc_zone"]["fill"], C["cc_zone"]["stroke"])
add_text(120, CC_Y + 8, 300, 24, "▎ CROSS-CUTTING", color="#495057", font_size=14)
add_text(160, CC_Y + 50, 600, 30,
         "📊  OBSERVABILITY", color="#1971c2", font_size=14)
add_text(160, CC_Y + 78, 800, 24,
         "CloudWatch  ·  X-Ray  ·  Datadog  ·  Synthetics  ·  RUM",
         color="#495057", font_size=13)
add_text(820, CC_Y + 50, 600, 30,
         "🔒  SECURITY & COMPLIANCE", color="#9c36b5", font_size=14)
add_text(820, CC_Y + 78, 800, 24,
         "GuardDuty  ·  Macie  ·  Security Hub  ·  KMS  ·  Config  ·  CloudTrail",
         color="#495057", font_size=13)
add_text(820, CC_Y + 105, 800, 24,
         "Object Lock WORM (audit 7 años)  ·  GDPR + ISO 27001",
         color="#495057", font_size=13)
add_text(1500, CC_Y + 50, 600, 30,
         "🚀  CI / CD + IaC", color="#e8590c", font_size=14)
add_text(1500, CC_Y + 78, 600, 24,
         "GitHub Actions  ·  CodePipeline  ·  CDK (TypeScript)",
         color="#495057", font_size=13)
add_text(1500, CC_Y + 105, 600, 24,
         "ECR  ·  multi-account (Organizations)",
         color="#495057", font_size=13)

# ── Arrows: main flow ────────────────────────────────────────────────────────

# Users → Route 53 (vertical down)
add_arrow(USERS_X + USERS_W / 2, USERS_Y + USERS_H,
          ROUTE53_CX, EDGE_Y + 45,
          label="HTTPS", color=ARROW_MAIN)

# Route 53 → CloudFront (lateral)
add_arrow(ROUTE53_CX + 130, EDGE_Y + 80,
          CF_CX - 170, EDGE_Y + 80,
          color=ARROW_MAIN)

# CloudFront → Amplify (down)
add_arrow(CF_CX, EDGE_Y + 115,
          AMPLIFY_CX, FE_Y + 35,
          color=ARROW_MAIN)

# Amplify → Cognito (down-left)
add_arrow(AMPLIFY_CX - 100, FE_Y + 95,
          COGNITO_CX, AUTH_Y + 35,
          label="JWT", color=ARROW_MAIN)

# Amplify → API Gateway (down-left, more pronounced)
add_arrow(AMPLIFY_CX - 200, FE_Y + 95,
          GW_CX, API_Y + 50,
          label="HTTPS / WSS", color=ARROW_MAIN)

# API Gateway → Lambda
add_arrow(GW_CX + 150, API_Y + 85,
          LBD_CX - 110, API_Y + 85,
          color=ARROW_MAIN)
# API Gateway → ECS
add_arrow(GW_CX + 150, API_Y + 95,
          ECS_CX - 170, API_Y + 95,
          color=ARROW_MAIN)
# API Gateway → Step Functions
add_arrow(GW_CX + 150, API_Y + 105,
          SF_CX - 170, API_Y + 105,
          color=ARROW_MAIN)

# Compute layer → Data Layer (bundled vertical arrow)
add_arrow(LBD_CX, API_Y + 120,
          (data_centers[0][0] + data_centers[1][0]) / 2, DATA_Y + 50,
          label="read / write", color=ARROW_MAIN, width=2)
add_arrow(ECS_CX, API_Y + 120,
          (data_centers[1][0] + data_centers[2][0]) / 2, DATA_Y + 50,
          color=ARROW_MAIN, width=2)
add_arrow(SF_CX, API_Y + 120,
          (data_centers[3][0] + data_centers[4][0]) / 2, DATA_Y + 50,
          color=ARROW_MAIN, width=2)

# Compute → AI/ML (curved/diagonal)
add_arrow(ECS_CX, API_Y + 120,
          BR_CX, AI_Y + 45,
          label="inference", color="#9c36b5", width=2)
add_arrow(SF_CX, API_Y + 120,
          SM_CX, AI_Y + 45,
          color="#9c36b5", width=2)

# Integration ↔ On-Prem (bi-directional, thick)
add_arrow(EB_CX, INT_Y + 125,
          op_boxes[0][1] + op_boxes[0][2] / 2, OP_Y + 55,
          label="PrivateLink", color=ARROW_BBVA, width=3)
add_arrow(MSK_CX, INT_Y + 125,
          op_boxes[1][1] + op_boxes[1][2] / 2, OP_Y + 55,
          label="Kafka", color=ARROW_BBVA, width=3)
add_arrow(GLUE_CX, INT_Y + 125,
          op_boxes[2][1] + op_boxes[2][2] / 2, OP_Y + 55,
          color=ARROW_BBVA, width=3)
add_arrow(op_boxes[3][1] + op_boxes[3][2] / 2, OP_Y + 55,
          GLUE_CX + 80, INT_Y + 125,
          color=ARROW_BBVA, width=3)

# Integration → Data Layer (events write to DB)
add_arrow(EB_CX, INT_Y + 45,
          data_centers[0][0], DATA_Y + 150,
          label="events", color="#f08c00", width=2)
add_arrow(MSK_CX, INT_Y + 45,
          data_centers[1][0], DATA_Y + 150,
          color="#f08c00", width=2)

# ── Output ────────────────────────────────────────────────────────────────────

doc = {
    "type": "excalidraw",
    "version": 2,
    "source": "https://excalidraw.com",
    "elements": elements,
    "appState": {
        "viewBackgroundColor": "#fafbfc",
        "gridSize": 20,
    },
    "files": {},
}

here = os.path.dirname(os.path.abspath(__file__))
out_path = os.path.normpath(os.path.join(here, "..", "docs", "aws-architecture-diagram.excalidraw"))
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(doc, f, indent=2, ensure_ascii=False)

print(f"OK  wrote {out_path}")
print(f"    elements: {len(elements)}")
