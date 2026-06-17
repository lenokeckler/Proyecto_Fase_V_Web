# Proyecto Fase V — Panel BI · FIFA Players 2015–2024

Versión **web** de la Etapa 5 / Fase V (Visualización y Presentación) del proyecto académico
*"De datos a Información"* (TEC, curso Análisis de Datos). Panel de Business Intelligence sobre el
dataset **FIFA Players 2015–2024** que comunica las respuestas de las Etapas 1–4 y permite explorar
**3 dashboards prescriptivos interactivos**.

🔗 **Sitio en vivo:** se publica con GitHub Pages (ver más abajo).

## Cómo abrir
Es un sitio **100 % estático** (HTML/CSS/JS, sin framework ni backend). Hay dos formas:

- **Doble clic en `index.html`** — funciona directamente desde el disco (`file://`), sin instalar nada.
- **Online** — vía el enlace de GitHub Pages una vez publicado.

## Qué incluye
- Reporte de las **Etapas 1–4** con cada gráfico y su interpretación.
- **3 dashboards prescriptivos:**
  - **Transferencias** — candidatos según el filtro del enunciado (edad, potencial, valor/rating).
  - **Construcción de Equipo** — optimización con toggle entre *Programación Lineal* y *Greedy look-ahead*.
  - **Vender o No** — score continuo 0–100 % con valor estimado por regresión.

## Estructura
- `index.html` — punto de entrada; carga en orden: `vendor` → `dataset` → `gui` → `etapas` → `gui/core`.
- `dataset/`
  - `data.js` — datos precalculados que lee la web (pool de jugadores + métricas).
  - `export_web_data.py` — regenera `data.js` a partir del CSV.
  - `archivo_final_proyecto_entrega.csv` — dataset original completo (~35 MB).
- `gui/` — `charts.js`, `ui.js`, `core.js`, `styles.css`.
- `etapas/` — una vista por etapa: `resumen`, `etapa1`…`etapa4`.
- `vendor/chart.umd.min.js` — Chart.js local (funciona offline).

## Regenerar los datos
```bash
python dataset/export_web_data.py
```
Requiere `pandas` y `numpy` y el CSV en `dataset/`.

## Tecnología
HTML + CSS + JavaScript clásico (sin build, sin frameworks) y [Chart.js](https://www.chartjs.org/) servido localmente.
Datos: dataset público *FIFA Players 2015–2024* (Kaggle).
