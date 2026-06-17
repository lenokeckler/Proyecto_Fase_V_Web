# PRODUCT.md — FIFA Analytics (Etapa 5, versión web)

**Qué es:** versión web de la Entrega 5 del proyecto académico *De datos a Información* (TEC). Un panel analítico (BI) que comunica los hallazgos del análisis del dataset FIFA Players 2015–2024 y permite explorar 3 decisiones prescriptivas de forma interactiva.

**Register:** product (el diseño SIRVE a la tarea; es un dashboard/herramienta, no una landing).

**Usuarios:** estudiantes y profesor evaluando el proyecto; contexto de escritorio principalmente, también móvil. Quieren leer respuestas rápido y "jugar" con los 3 dashboards.

**Superficies:**
1. Resumen (KPIs del proyecto).
2. Reporte por etapas (Etapa 2 dimensional; Etapa 3 distribuciones, relaciones, anomalías; Etapa 4 predictivo/prescriptivo) — cada pregunta con su gráfico y respuesta.
3. Tres dashboards interactivos (Mercado de Transferencias, Construcción de Equipo, Vender o No) con controles en vivo.

**Tono:** preciso, analítico, confiable. Familiaridad ganada (como Linear/Stripe dashboards), no estridente.

**Stack:** sin framework, organizado en paquetes (scripts clásicos → funciona con doble clic, `file://`):
- `dataset/` — `archivo_final_proyecto_entrega.csv` (dataset final, 214.804×33), `data.js` (agregaciones precalculadas + pool) y `export_web_data.py` (regenera `data.js` desde el CSV local; replica la lógica de los notebooks Fase I–IV). **Proyecto autocontenido**: el CSV vive dentro del paquete.
- `gui/` — infraestructura de interfaz reutilizable: `charts.js` (fábrica Chart.js), `ui.js` (paneles/tablas/heatmap/controles/iconos), `core.js` (router + nav + tema, se carga de último), `styles.css`.
- `etapas/` — una vista por etapa (`resumen`, `etapa1`..`etapa4`); cada archivo se registra solo vía `registerView()`. Editar una etapa = tocar un único archivo.
- `vendor/` — `chart.umd.min.js` local (offline).

Orden de carga en `index.html`: vendor → dataset → gui (charts, ui) → etapas → gui/core. Tema: botón claro/oscuro (o `?dark` en la URL).

**No-objetivos:** no es app de producción con backend; no autenticación; no edición de datos.
