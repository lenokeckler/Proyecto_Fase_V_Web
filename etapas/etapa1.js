/* etapas/etapa1.js — Preprocesado y limpieza: calidad, diccionario, features y flags. */
'use strict';

registerView('e1', {
  group: 'Reporte', label: 'Etapa 1 · Limpieza', icon: 'broom',
  crumb: 'Etapa 1', title: 'Etapa 1 · Preprocesado y limpieza',
  render(c) {
    const q = D.e1.quality;
    const featRows = D.e1.features.map(f => [f.name, f.regla]);
    const dictRows = D.e1.dict.map(d => [d.col, d.tipo, d.rango, d.desc]);
    c.innerHTML = `<div class="view-intro"><h2>Preprocesado y limpieza</h2>
      <p>Consolidación de 10 temporadas en un único dataset limpio, con diccionario de datos, informe de calidad, 6 features derivados y 3 reglas de seguridad para proteger el análisis de ruido.</p></div>
    <div class="kpi-grid">
      <div class="kpi brand"><div class="label">Filas finales</div><div class="value num">${fmtInt(q.rows)}</div></div>
      <div class="kpi"><div class="label">Columnas</div><div class="value num">${fmtInt(q.cols)}</div></div>
      <div class="kpi"><div class="label">% nulos global</div><div class="value num">${q.pctNulls}%</div></div>
      <div class="kpi"><div class="label">Duplicados jugador-temporada</div><div class="value num">${fmtInt(q.dupes)}</div></div>
      <div class="kpi"><div class="label">Temporadas</div><div class="value num">${q.seasons}</div></div>
    </div>
    <div class="grid-2">
      ${panel({ tag: 'Diccionario', q: 'Diccionario de datos (columnas clave)', body: `<div style="overflow-x:auto">${kvTable(dictRows, ['Columna', 'Tipo', 'Rango', 'Descripción'])}</div>`, answer: '<b>Resultado de la limpieza:</b> CSV consolidado de 10 temporadas, sin nulos ni duplicados, listo para análisis.' })}
      ${panel({ tag: 'Seguridad', q: 'Registros marcados por las 3 reglas de seguridad', canvas: 'e1flag', answer: '<b>Respuesta:</b> los flags aíslan datos potencialmente inválidos (edad/habilidades/valor-salario) sin eliminarlos.' })}
      ${panel({ tag: 'Features', q: '6 features derivados complejos', body: `<div style="overflow-x:auto">${kvTable(featRows, ['Feature', 'Regla de derivación'])}</div>`, answer: '<b>Respuesta:</b> los 6 features convierten columnas crudas en categorías y ratios listos para análisis (etapa de carrera, banda de valor/altura, brecha de potencial, posición principal y eficiencia financiera).' })}
      ${panel({ tag: 'Feature', q: 'Distribución por GrupoEdad', canvas: 'e1age', answer: '<b>Respuesta:</b> domina <b>Prime</b> (55%), seguido de Veteran (26%) y Young (19%).' })}
      ${panel({ tag: 'Feature', q: 'Distribución por GrupoValor', canvas: 'e1val', answer: '<b>Respuesta:</b> la mayoría tiene valor <b>Medio</b> (52%) o Bajo (25%); solo el 23% es de valor Alto.' })}
      ${panel({ tag: 'Feature', q: 'Distribución por GrupoAltura', canvas: 'e1hgt', answer: '<b>Respuesta:</b> predomina la altura <b>Media</b> (58%, 175–185 cm); los extremos son minoría.' })}
    </div>`;
    bar('e1flag', D.e1.flags.map(x => x.k), D.e1.flags.map(x => x.v), { colorVar: '--violet' });
    doughnut('e1age', D.e1.ageGroupDist.map(x => x.k), D.e1.ageGroupDist.map(x => x.v));
    bar('e1val', D.e1.valueGroupDist.map(x => x.k), D.e1.valueGroupDist.map(x => x.v), { horizontal: false, colorVar: '--teal' });
    bar('e1hgt', D.e1.heightGroupDist.map(x => x.k), D.e1.heightGroupDist.map(x => x.v), { horizontal: false, colorVar: '--accent' });
  },
});
