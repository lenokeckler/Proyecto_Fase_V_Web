/* etapas/etapa3.js — Análisis de Datos 1 (EDA): univariante, bivariante/multivariante,
   anomalías y análisis global. Cubre las preguntas obligatorias del enunciado. */
'use strict';

/* 3.1 Distribuciones (univariante) */
registerView('e3uni', {
  group: 'Reporte', label: 'Etapa 3 · Distribuciones', icon: 'chart',
  crumb: 'Etapa 3', title: 'Etapa 3 · Distribuciones (univariante)',
  render(c) {
    const s = D.e3.stats;
    const statRows = s.map(r => [r.var, r.mean, r.median, r.mode, r.min, r.q1, r.q3, r.max, r.iqr, r.std, r.skew]);
    const ageStat = s.find(r => r.var === 'age');
    c.innerHTML = `<div class="view-intro"><h2>Distribuciones (univariante)</h2>
      <p>Medidas de tendencia central y dispersión para edad, overall, potential, value, wage y las 2 variables elegidas por el grupo (<b>BrechaPotencial</b> y <b>pace</b>), más las categóricas.</p></div>
    ${panel({ tag: 'Resumen', q: 'Medidas de tendencia central y dispersión', body: `<div style="overflow-x:auto">${kvTable(statRows, ['Variable', 'Media', 'Mediana', 'Moda', 'Mín', 'Q1', 'Q3', 'Máx', 'IQR', 'Desv.', 'Sesgo'])}</div>`, answer: `<b>Edad:</b> media ${ageStat.mean}, moda ${ageStat.mode}, sesgo ${ageStat.skew} → la distribución de edad está sesgada a la derecha (más jóvenes que veteranos), lo cual tiene sentido en el fútbol profesional.` })}
    <div class="grid-2">
    </div><h3 class="section-title">Histogramas y distribuciones</h3><div class="grid-2">
      ${panel({ tag: 'Numérico', q: 'Distribución de edad', canvas: 'u1', answer: '<b>Respuesta:</b> concentrada entre 21 y 29 años (moda 22) con sesgo leve a la derecha (0.43): hay más jóvenes que veteranos.' })}
      ${panel({ tag: 'Numérico', q: 'Distribución de overall', canvas: 'u2', answer: '<b>Respuesta:</b> campana casi simétrica centrada en ~65; los jugadores de élite (85+) son muy pocos.' })}
      ${panel({ tag: 'Numérico', q: 'Distribución de valor (log₁₀)', canvas: 'u3', answer: '<b>Respuesta:</b> fuerte sesgo a la derecha: la mayoría vale poco y unos pocos cracks alcanzan cientos de millones (por eso se usa escala log).' })}
      ${panel({ tag: 'Numérico', q: 'Distribución de salario (log₁₀)', canvas: 'u4', answer: '<b>Respuesta:</b> igual de sesgada que el valor: salarios bajos para la mayoría y altísimos para una minoría.' })}
      ${panel({ tag: 'Numérico', q: 'Distribución de BrechaPotencial', canvas: 'u5', answer: '<b>Respuesta:</b> moda 0 y sesgo positivo (0.83): la mayoría ya está cerca de su techo, pero hay jóvenes con gran margen (hasta +28).' })}
      ${panel({ tag: 'Numérico', q: 'Distribución de pace', canvas: 'u6', answer: '<b>Respuesta:</b> bastante simétrica y centrada en ~68, más uniforme que las variables económicas.' })}
    </div><h3 class="section-title">Variables categóricas</h3><div class="grid-2">
      ${panel({ tag: 'Categórico', q: 'Top 10 nacionalidades por número de jugadores', canvas: 'u7', answer: '<b>Respuesta:</b> England lidera con ~20,000 registros acumulados en 10 temporadas, seguida de Spain, Germany y Argentina. El conteo refleja registros históricos acumulados, no jugadores únicos activos.' })}
      ${panel({ tag: 'Categórico', q: 'Top 10 clubes por nº de jugadores', canvas: 'u8', answer: `<b>Respuesta:</b> el club con más jugadores es <b>${D.e3.topClubs[0].k}</b>.` })}
      ${panel({ tag: 'Categórico', q: 'Jugadores por grupo de posición', canvas: 'u9', answer: '<b>Respuesta:</b> mediocampistas (37%) y defensas (32%) son los más numerosos; los porteros, los menos (11%).' })}
      ${panel({ tag: 'Categórico', q: 'Distribución por grupo de edad', canvas: 'u10', answer: '<b>Respuesta:</b> Prime domina con el 55% de los registros.' })}
      ${panel({ tag: 'Categórico', q: 'Pie dominante', canvas: 'u11', answer: '<b>Respuesta:</b> ~77% de los jugadores son diestros y ~23% zurdos, proporción típica en el fútbol.' })}
      ${panel({ tag: 'Categórico', q: 'Nacionalidad con mejor rating promedio (≥50 jug.)', canvas: 'u12', answer: `<b>Respuesta:</b> <b>${D.e3.natBestRating[0].k}</b> encabeza el rating promedio.` })}
    </div>`;
    const H = D.e3.hist;
    bar('u1', H.age.labels, H.age.counts, { horizontal: false });
    bar('u2', H.overall.labels, H.overall.counts, { horizontal: false, colorVar: '--accent' });
    bar('u3', H.value.labels, H.value.counts, { horizontal: false, colorVar: '--teal' });
    bar('u4', H.wage.labels, H.wage.counts, { horizontal: false, colorVar: '--violet' });
    bar('u5', H.BrechaPotencial.labels, H.BrechaPotencial.counts, { horizontal: false });
    bar('u6', H.pace.labels, H.pace.counts, { horizontal: false, colorVar: '--accent' });
    bar('u7', D.e3.topNat.map(x => x.k), D.e3.topNat.map(x => x.v));
    bar('u8', D.e3.topClubs.map(x => x.k), D.e3.topClubs.map(x => x.v), { colorVar: '--accent' });
    bar('u9', D.e3.posDist.map(x => x.k), D.e3.posDist.map(x => x.v), { horizontal: false, colorVar: '--violet' });
    doughnut('u10', D.e1.ageGroupDist.map(x => x.k), D.e1.ageGroupDist.map(x => x.v));
    doughnut('u11', D.e3.footDist.map(x => x.k), D.e3.footDist.map(x => x.v));
    bar('u12', D.e3.natBestRating.map(x => x.k), D.e3.natBestRating.map(x => x.v), { colorVar: '--teal' });
  },
});

/* 3.2 Relaciones (bivariante + multivariante) */
registerView('e3rel', {
  group: 'Reporte', label: 'Etapa 3 · Relaciones', icon: 'scatter',
  crumb: 'Etapa 3', title: 'Etapa 3 · Relaciones (bi/multivariante)',
  render(c) {
    const cp = D.e3.corrPairs;
    const pairRows = [...cp.high.map(p => ['Alta', p[0], p[1]]), ...cp.low.map(p => ['Baja', p[0], p[1]])];
    c.innerHTML = `<div class="view-intro"><h2>Relaciones entre variables</h2>
      <p>Matriz de correlación, dispersión y comparaciones numérico × categórico, más cruces multivariantes.</p></div>
    <div class="grid-2">
      ${panel({ tag: 'Num × Num', q: 'Matriz de correlación', body: heatmapTable(D.e3.corr.labels, D.e3.corr.matrix), answer: '<b>Respuesta:</b> value y wage muy correlacionadas (0.78); edad y brecha de potencial inversamente (−0.84).' })}
      ${panel({ tag: 'Num × Num', q: 'Pares de alta y baja correlación', body: `<div style="overflow-x:auto">${kvTable(pairRows, ['Tipo', 'Par', 'r'])}</div>`, answer: '<b>Respuesta:</b> alta correlación entre <b>value y wage</b> (0.78) e inversa fuerte entre <b>edad y brecha</b> (−0.84); en cambio edad-value y pace-brecha son prácticamente nulas.' })}
      ${panel({ tag: 'Num × Num', q: 'Overall vs Valor de mercado', canvas: 'b1', tall: true, answer: '<b>Respuesta:</b> a mayor overall el valor crece de forma exponencial (eje log).' })}
      ${panel({ tag: 'Num × Num', q: 'Potencial vs Salario', canvas: 'b2', tall: true, answer: '<b>Respuesta:</b> el potencial correlaciona más con value que con wage.' })}
      ${panel({ tag: 'Num × Cat', q: 'Valor mediano por posición', canvas: 'b3', answer: '<b>Respuesta:</b> los <b>delanteros</b> tienen el valor mediano más alto.' })}
      ${panel({ tag: 'Num × Cat', q: 'Salario mediano por grupo de edad', canvas: 'b4', answer: '<b>Respuesta:</b> el salario sube con la edad: la experiencia se paga.' })}
      ${panel({ tag: 'Num × Cat', q: 'Overall medio por liga (Top 8)', canvas: 'b5', answer: '<b>Respuesta:</b> las grandes ligas muestran mayor overall mediano.' })}
      ${panel({ tag: 'Num × Cat', q: 'Overall medio por pie dominante', canvas: 'b6', answer: '<b>Respuesta:</b> diestros y zurdos tienen un overall prácticamente idéntico (~65), confirmando que el pie dominante no influye en el rendimiento.' })}
      ${panel({ tag: 'Multivariante', q: 'Valor promedio por posición y grupo de edad', canvas: 'b7', tall: true, answer: '<b>Respuesta:</b> la combinación <b>Prime + Ofensivos</b> (delanteros) alcanza el mayor valor de mercado promedio.' })}
      ${panel({ tag: 'Multivariante', q: 'Salario mediano de jóvenes por posición', canvas: 'b8', answer: '<b>Respuesta:</b> entre los jóvenes, delanteros, defensas y mediocampistas tienen salarios muy similares (~€2K); los porteros quedan significativamente por debajo (~€1K).' })}
    </div>`;
    scatter('b1', D.e3.scatterOV, 'Overall', 'Valor (EUR, log)');
    scatter('b2', D.e3.scatterPW, 'Potencial', 'Salario (EUR, log)');
    bar('b3', D.e3.valueByPos.map(x => x.k), D.e3.valueByPos.map(x => x.v), { colorVar: '--accent', eur: true });
    bar('b4', D.e3.wageByAge.map(x => x.k), D.e3.wageByAge.map(x => x.v), { horizontal: false, colorVar: '--teal', eur: true });
    bar('b5', D.e3.overallByLeague.map(x => x.k), D.e3.overallByLeague.map(x => x.v));
    bar('b6', D.e3.overallByFoot.map(x => x.k), D.e3.overallByFoot.map(x => x.v), { horizontal: false, colorVar: '--violet' });
    const va = D.e3.valueByAgePos;
    groupBar('b7', va.positions, [
      { label: 'Young', data: va.young.map(x => x.v) },
      { label: 'Prime', data: va.prime.map(x => x.v) },
      { label: 'Veteran', data: va.veteran.map(x => x.v) }], { eur: true });
    bar('b8', D.e3.youngBestPaidByPos.map(x => x.k), D.e3.youngBestPaidByPos.map(x => x.v), { colorVar: '--teal', eur: true });
  },
});

/* 3.3 Anomalías + análisis global */
registerView('e3anom', {
  group: 'Reporte', label: 'Etapa 3 · Anomalías y global', icon: 'alert',
  crumb: 'Etapa 3', title: 'Etapa 3 · Anomalías y análisis global',
  render(c) {
    const a = D.e3.anom, g = D.e3.global;
    const zRows = [...a.zAge.map(r => ['Edad', r.n, r.val, r.z]), ...a.zWage.map(r => ['Salario', r.n, r.val, r.z])];
    const shRows = a.salaryHighRatingLow.map(r => [r.n, r.o, r.w]);
    c.innerHTML = `<div class="view-intro"><h2>Anomalías y análisis global</h2>
      <p>Detección de anomalías por Z-score (umbral 3.0) e IQR, más rankings agregados de negocio.</p></div>
    <div class="grid-2">
      ${panel({ tag: 'Z-score', q: 'Anomalías por Z-score (|z| > 3) en edad y salario', body: `<div style="overflow-x:auto">${kvTable(zRows, ['Variable', 'Jugador', 'Valor', 'z'])}</div>`, answer: '<b>Respuesta:</b> edades extremas y salarios desorbitados respecto al promedio del dataset.' })}
      ${panel({ tag: 'IQR', q: `Top 5 BrechaPotencial (outliers IQR, umbral > ${a.iqrThreshold})`, canvas: 'an1', answer: '<b>Respuesta:</b> las brechas altas son <b>jóvenes promesas</b> con gran margen de crecimiento.' })}
      ${panel({ tag: 'Negocio', q: 'Salario alto pero rating bajo (overall < 70)', body: `<div style="overflow-x:auto">${kvTable(shRows, ['Jugador', 'Overall', 'Salario'], [2])}</div>`, answer: '<b>Respuesta:</b> casos a revisar: salario elevado no respaldado por el rendimiento.' })}
      ${panel({ tag: 'Global', q: 'Top 10 por potencial', canvas: 'an2', answer: '<b>Respuesta:</b> Neymar, Messi y Mbappé encabezan el potencial máximo registrado en el dataset.' })}
      ${panel({ tag: 'Global', q: 'Top 10 países por valor total', canvas: 'an3', answer: '<b>Respuesta:</b> España, Brasil y Francia dominan la generación de valor.' })}
      ${panel({ tag: 'Inversión', q: 'Clubes con mejor ratio valor/salario', canvas: 'an4', answer: '<b>Respuesta:</b> los clubes más eficientes generan mucho valor con baja masa salarial.' })}
      ${panel({ tag: 'Talento', q: 'Top 10 jóvenes (<21) con rating > 80', canvas: 'an5', answer: '<b>Respuesta:</b> las futuras estrellas que ya rinden a nivel de élite.' })}
      ${panel({ tag: 'Global', q: 'Potencial medio por grupo de edad', canvas: 'an6', answer: '<b>Respuesta:</b> el grupo <b>Young</b> tiene el mayor potencial medio.' })}
    </div>`;
    bar('an1', a.iqrBrecha.map(x => x.n), a.iqrBrecha.map(x => x.val));
    bar('an2', g.topPot.map(x => x.k), g.topPot.map(x => x.v), { colorVar: '--accent' });
    bar('an3', g.topCountries.map(x => x.k), g.topCountries.map(x => x.v), { colorVar: '--teal', eur: true });
    bar('an4', g.ratioClubs.map(x => x.k), g.ratioClubs.map(x => x.v), { colorVar: '--violet' });
    bar('an5', g.topYoungRating.map(x => x.k), g.topYoungRating.map(x => x.v));
    bar('an6', g.potByAge.map(x => x.k), g.potByAge.map(x => x.v), { horizontal: false, colorVar: '--accent' });
  },
});
