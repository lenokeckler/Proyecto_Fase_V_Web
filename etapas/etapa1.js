/* etapas/etapa1.js — Preprocesado y limpieza: calidad, diccionario, features y flags. */
"use strict";

registerView("e1", {
  group: "Reporte",
  label: "Etapa 1 · Limpieza",
  icon: "broom",
  crumb: "Etapa 1",
  title: "Etapa 1 · Preprocesado y limpieza",

  render(c) {
    const q = D.e1.quality;

    const featRows = D.e1.features.map((f) => [f.name, f.regla]);

    const dictRows = D.e1.dict.map((d) => [d.col, d.tipo, d.rango, d.desc]);

    /*
     * Datos históricos correspondientes al dataset original,
     * antes de realizar el proceso de limpieza.
     *
     * Se mantienen fijos porque el CSV utilizado actualmente
     * ya contiene los datos limpios.
     */
    const beforeCleaningRows = [
      ["Total de filas", "214,804"],
      ["Total de columnas", "22"],
      ["Total de celdas", "4,725,688"],
      ["Celdas nulas", "197,766"],
      ["Filas duplicadas exactas", "0"],
      ["% de nulos global", "4.18 %"],
      ["% de duplicados global", "0.0 %"],
    ];

    c.innerHTML = `
      <div class="view-intro">
        <h2>Preprocesado y limpieza</h2>

        <p>
          Consolidación de 10 temporadas en un único dataset limpio,
          con diccionario de datos, informe de calidad, 6 features
          derivados y 3 reglas de seguridad para proteger el análisis
          de ruido.
        </p>
      </div>

      <h3 class="section-title">
        Calidad de los datos antes de la limpieza
      </h3>

      ${panel({
        tag: "Calidad inicial",
        q: "Informe de calidad del dataset original",
        body: `
          <div style="overflow-x:auto">
            ${kvTable(beforeCleaningRows, ["Métrica", "Valor"])}
          </div>
        `,
        answer: `
          <b>Resultado del diagnóstico inicial:</b>
          antes del proceso de limpieza, el dataset contenía
          <b>197,766 celdas nulas</b>, equivalentes al
          <b>4.18 %</b> del total. No se identificaron filas
          duplicadas exactas.
        `,
      })}

      <h3 class="section-title">
        Resultado después de la limpieza
      </h3>

      <div class="kpi-grid">
        <div class="kpi brand">
          <div class="label">Filas finales</div>
          <div class="value num">${fmtInt(q.rows)}</div>
        </div>

        <div class="kpi">
          <div class="label">Columnas</div>
          <div class="value num">${fmtInt(q.cols)}</div>
        </div>

        <div class="kpi">
          <div class="label">% nulos global</div>
          <div class="value num">${q.pctNulls}%</div>
        </div>

        <div class="kpi">
          <div class="label">Duplicados jugador-temporada</div>
          <div class="value num">${fmtInt(q.dupes)}</div>
        </div>

        <div class="kpi">
          <div class="label">Temporadas</div>
          <div class="value num">${q.seasons}</div>
        </div>
      </div>

      <div class="grid-2">
        <h3 class="section-title">
          Calidad y estructura del dataset
        </h3>

        ${panel({
          tag: "Diccionario",
          q: "Diccionario de datos (columnas clave)",
          body: `
            <div style="overflow-x:auto">
              ${kvTable(dictRows, ["Columna", "Tipo", "Rango", "Descripción"])}
            </div>
          `,
          answer: `
            <b>Resultado de la limpieza:</b>
            CSV consolidado de 10 temporadas, sin nulos ni duplicados,
            listo para análisis.
          `,
        })}

        ${panel({
          tag: "Seguridad",
          q: "Registros marcados por las 3 reglas de seguridad",
          canvas: "e1flag",
          answer: `
            <b>Respuesta:</b>
            los flags aíslan datos potencialmente inválidos
            (edad, habilidades y relación valor-salario)
            sin eliminarlos.
          `,
        })}

        ${panel({
          tag: "Features",
          q: "6 features derivados complejos",
          body: `
            <div style="overflow-x:auto">
              ${kvTable(featRows, ["Feature", "Regla de derivación"])}
            </div>
          `,
          answer: `
            <b>Respuesta:</b>
            los 6 features convierten columnas crudas en categorías
            y ratios listos para análisis: etapa de carrera, banda de
            valor y altura, brecha de potencial, posición principal
            y eficiencia financiera.
          `,
        })}

        <h3 class="section-title">
          Distribución de features derivados
        </h3>

        ${panel({
          tag: "Feature",
          q: "Distribución por GrupoEdad",
          canvas: "e1age",
          answer: `
            <b>Respuesta:</b>
            domina <b>Prime</b> (55%), seguido de Veteran (26%)
            y Young (19%).
          `,
        })}

        ${panel({
          tag: "Feature",
          q: "Distribución por GrupoValor",
          canvas: "e1val",
          answer: `
            <b>Respuesta:</b>
            la mayoría tiene valor <b>Medio</b> (52%) o Bajo (25%);
            solo el 23% es de valor Alto.
          `,
        })}

        ${panel({
          tag: "Feature",
          q: "Distribución por GrupoAltura",
          canvas: "e1hgt",
          answer: `
            <b>Respuesta:</b>
            predomina la altura <b>Media</b> (58%, 175–185 cm);
            los extremos son minoría.
          `,
        })}

        ${panel({
          tag: "Feature",
          q: "Distribución por PosicionPrincipal (top 15)",
          canvas: "e1pos",
          answer: `
            <b>Respuesta:</b>
            las posiciones ST y CB son las más comunes;
            los porteros (GK) representan una minoría del plantel.
          `,
        })}

        ${panel({
          tag: "Feature",
          q: "Distribución de BrechaPotencial (potential − overall)",
          canvas: "e1brecha",
          answer: `
            <b>Respuesta:</b>
            la mayoría de jugadores tiene una brecha cercana a 0
            (rango −2 a 2), lo que indica que el potencial proyectado
            ya fue alcanzado. Solo una minoría tiene brechas positivas
            grandes, correspondientes a talento sin desarrollar.
          `,
        })}

        ${panel({
          tag: "Feature",
          q: "Distribución de EficienciaFinanciera (valor / salario, clip 0–50)",
          canvas: "e1ef",
          answer: `
            <b>Respuesta:</b>
            la distribución está concentrada en el extremo superior
            (45–50), lo que refleja jugadores con salario muy bajo
            respecto a su valor de mercado. El límite en 50 evita
            distorsiones producidas por valores extremos, por ejemplo,
            cuando el salario es cercano a cero.
          `,
        })}
      </div>
    `;

    bar(
      "e1flag",
      D.e1.flags.map((x) => x.k),
      D.e1.flags.map((x) => x.v),
      { colorVar: "--violet" },
    );

    doughnut(
      "e1age",
      D.e1.ageGroupDist.map((x) => x.k),
      D.e1.ageGroupDist.map((x) => x.v),
    );

    bar(
      "e1val",
      D.e1.valueGroupDist.map((x) => x.k),
      D.e1.valueGroupDist.map((x) => x.v),
      {
        horizontal: false,
        colorVar: "--teal",
      },
    );

    bar(
      "e1hgt",
      D.e1.heightGroupDist.map((x) => x.k),
      D.e1.heightGroupDist.map((x) => x.v),
      {
        horizontal: false,
        colorVar: "--accent",
      },
    );

    bar(
      "e1pos",
      D.e1.posicionDist.map((x) => x.k),
      D.e1.posicionDist.map((x) => x.v),
      {
        horizontal: true,
        colorVar: "--brand",
      },
    );

    bar("e1brecha", D.e1.brechaHist.labels, D.e1.brechaHist.counts, {
      colorVar: "--teal",
    });

    bar("e1ef", D.e1.eficienciaHist.labels, D.e1.eficienciaHist.counts, {
      colorVar: "--violet",
    });
  },
});
