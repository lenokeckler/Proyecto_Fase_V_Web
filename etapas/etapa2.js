/* etapas/etapa2.js — Modelo dimensional: las 5 consultas de negocio del esquema estrella. */
'use strict';

registerView('e2', {
  group: 'Reporte', label: 'Etapa 2 · Dimensional', icon: 'cube',
  crumb: 'Etapa 2', title: 'Etapa 2 · Modelo dimensional',
  render(c) {
    c.innerHTML = `<div class="view-intro"><h2>Modelo dimensional (estrella)</h2>
      <p>Esquema con jerarquía <b>Región → Liga → Club</b> y un hecho de valor/salario. Las 5 consultas de negocio que justifican la granularidad elegida.</p></div>
    <h3 class="section-title">Consultas de negocio</h3>
    <div class="grid-2">
      ${panel({ tag: 'Q1', q: '¿Top 10 clubes por valor de mercado promedio?', canvas: 'e2a', eur: true, answer: '<b>Respuesta:</b> los clubes de la élite europea concentran el mayor valor promedio por plantilla.' })}
      ${panel({ tag: 'Q2', q: '¿Valor total de mercado por región?', canvas: 'e2b', answer: '<b>Respuesta:</b> Europa concentra más del 90% del valor total (~€40B), evidenciando la concentración del talento global en las grandes ligas del continente.' })}
      ${panel({ tag: 'Q3', q: '¿Overall medio por GrupoEdad y posición?', canvas: 'e2c', tall: true, answer: '<b>Respuesta:</b> el overall sube de <b>Young → Veteran</b>; la experiencia pesa más que la posición.' })}
      ${panel({ tag: 'Q4', q: '¿Margen (Valor − Salario) por club?', canvas: 'e2d', answer: '<b>Respuesta:</b> Real Madrid y PSG lideran el margen, lo que indica que sus plantillas tienen alto valor de mercado sin que el salario lo refleje proporcionalmente.' })}
      ${panel({ tag: 'Q5', q: 'Drill-down Región → Liga (valor promedio, top 10)', canvas: 'e2e', answer: '<b>Respuesta:</b> el drill-down confirma que las grandes ligas europeas dominan el valor promedio por jugador.' })}
    </div>`;
    bar('e2a', D.e2.topClubsValue.map(x => x.k), D.e2.topClubsValue.map(x => x.v), { eur: true });
    bar('e2b', D.e2.regionValue.map(x => x.k), D.e2.regionValue.map(x => x.v), { colorVar: '--accent', eur: true });
    groupBar('e2c', D.e2.positions, [{ label: 'Young', data: D.e2.young }, { label: 'Prime', data: D.e2.prime }, { label: 'Veteran', data: D.e2.veteran }]);
    bar('e2d', D.e2.marginClubs.map(x => x.k), D.e2.marginClubs.map(x => x.v), { colorVar: '--teal', eur: true });
    bar('e2e', D.e2.drilldown.map(x => x.k), D.e2.drilldown.map(x => x.v), { colorVar: '--violet', eur: true });
  },
});
