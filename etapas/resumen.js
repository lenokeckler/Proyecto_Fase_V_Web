/* etapas/resumen.js — portada del proyecto (Etapa 5 = la presentación misma). */
'use strict';

registerView('resumen', {
  group: null, label: 'Resumen', icon: 'home',
  crumb: 'Resumen', title: 'Resumen del proyecto',
  render(c) {
    const k = D.kpis;
    c.innerHTML = `
    <div class="view-intro"><h2>De datos a Información</h2>
      <p>Recorrido visual del proyecto <b>FIFA Players (2015–2024)</b>: cada pregunta de las Etapas 1 a 4 con el gráfico que la justifica, más los tres dashboards prescriptivos donde podés modificar los parámetros y ver la recomendación en vivo. La lógica de cada dashboard replica exactamente los notebooks entregados.</p></div>
    <div class="kpi-grid">
      <div class="kpi brand"><div class="label">Registros</div><div class="value num">${fmtInt(k.players)}</div></div>
      <div class="kpi"><div class="label">Jugadores únicos</div><div class="value num">${fmtInt(k.unique)}</div></div>
      <div class="kpi"><div class="label">Valor de mercado (2024)</div><div class="value num">${fmtEur(k.value)}</div></div>
      <div class="kpi"><div class="label">Clubes</div><div class="value num">${fmtInt(k.clubs)}</div></div>
      <div class="kpi"><div class="label">Ligas · temporadas</div><div class="value num">${fmtInt(k.leagues)} · 10</div></div>
    </div>
    <div class="grid-2">
      ${panel({ tag: 'Etapa 3', q: 'Top 10 jugadores por valor de mercado', canvas: 'rs1', answer: '<b>Respuesta:</b> las superestrellas (Mbappé, Haaland, Neymar) concentran los valores de mercado más altos del dataset.' })}
      ${panel({ tag: 'Etapa 2', q: 'Valor total por región', canvas: 'rs2', answer: '<b>Respuesta:</b> Europa concentra la mayor parte del valor de mercado mundial.' })}
    </div>`;
    bar('rs1', D.e3.global.topValue.map(x => x.k), D.e3.global.topValue.map(x => x.v), { eur: true });
    bar('rs2', D.e2.regionValue.map(x => x.k), D.e2.regionValue.map(x => x.v), { colorVar: '--accent', eur: true });
  },
});
