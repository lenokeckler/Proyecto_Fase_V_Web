/* etapas/etapa4.js — Análisis predictivo/prescriptivo + los 3 dashboards interactivos.
   La lógica de cada dashboard replica fielmente Proyecto_Fase_IV.ipynb. */
'use strict';

const median = arr => {
  if (!arr.length) return 0;
  const a = arr.slice().sort((x, y) => x - y), m = a.length >> 1;
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
};

/* 4.1 Reporte predictivo */
registerView('e4', {
  group: 'Reporte', label: 'Etapa 4 · Modelos', icon: 'brain',
  crumb: 'Etapa 4', title: 'Etapa 4 · Predictivo y prescriptivo',
  render(c) {
    const vm = D.e4.valueModel, pm = D.e4.potModel;
    const cont = D.e4.contratacion, rows = [];
    Object.keys(cont).forEach(g => cont[g].forEach(r => rows.push([g, r[0], r[1], r[2], r[3]])));
    const cm = pm.confusion;
    const cmTable = `<table class="tbl"><thead><tr><th></th><th class="n">Pred. 0</th><th class="n">Pred. 1</th></tr></thead>
      <tbody><tr><th>Real 0</th><td class="n">${fmtInt(cm[0][0])}</td><td class="n">${fmtInt(cm[0][1])}</td></tr>
      <tr><th>Real 1</th><td class="n">${fmtInt(cm[1][0])}</td><td class="n">${fmtInt(cm[1][1])}</td></tr></tbody></table>`;
    const clusters = D.e4.clusters.map(c => `<span class="chip">${c.label}</span>`).join(' ');
    c.innerHTML = `<div class="view-intro"><h2>Análisis predictivo y prescriptivo</h2>
      <p>Modelos de regresión, clasificación y clustering, y la recomendación de contratación más eficiente.</p></div>
    <div class="grid-2">
      ${panel({ tag: 'Regresión', q: 'Valor de mercado — 5 features más influyentes (correlación con log-valor)', canvas: 'p1', answer: `<b>Respuesta:</b> <b>overall, potential y wage</b> son los principales motores del valor. Modelo final <b>overall + age</b>: R² = ${vm.r2}, RMSE = ${vm.rmse} (escala log).` })}
      ${panel({ tag: 'Clasificación', q: '¿Potencial > 85? — Matriz de confusión (regresión logística)', body: `<div style="overflow-x:auto">${cmTable}</div>`, answer: `<b>Respuesta:</b> accuracy ${(pm.accuracy * 100).toFixed(0)}%, recall ${(pm.recall * 100).toFixed(0)}%, precisión ${(pm.precision * 100).toFixed(0)}%, F1 ${pm.f1}. Clase minoritaria (1%) → se prioriza recall para no perder promesas.` })}
      ${panel({ tag: 'Clustering', q: 'Tipos de jugador (K-Means, k=4 + PCA)', body: `<div class="chips">${clusters}</div>`, answer: 'Perfiles según edad, potencial, valor y salario: identifican talento joven, estrellas, veteranos y base.' })}
      ${panel({ tag: 'Prescriptivo', q: 'Contratación — Top 3 más eficientes por posición (overall ≥ 75)', body: `<div style="overflow-x:auto">${kvTable(rows, ['Posición', 'Jugador', 'Overall', 'Valor', 'Eficiencia'], [3])}</div>`, answer: 'Eficiencia = overall por cada millón de € de valor. Premia el bajo costo por punto de rendimiento.' })}
    </div>`;
    bar('p1', D.e4.valueModel.feats.map(x => x[0]), D.e4.valueModel.feats.map(x => x[1]));
  },
});

/* DASHBOARD 1 — Mercado de Transferencias */
registerView('dash1', {
  group: 'Dashboards interactivos', label: 'Transferencias', icon: 'cart',
  crumb: 'Dashboards', title: 'Mercado de Transferencias',
  state: { budget: 100, age: 25, pot: 85 },
  render(c) {
    const s = this.state;
    c.innerHTML = `<div class="view-intro"><h2>Mercado de Transferencias</h2>
      <p>Réplica del experimento de Fase IV: de los jugadores <b>menores de la edad</b> con <b>potencial</b> sobre el umbral, se calcula la <b>media de valor/rating del cohorte</b> y se retienen los que están por debajo (los eficientes). Se eligen los 5 de mayor calidad que caben en el presupuesto.</p></div>
    <div class="dash-controls">
      ${rangeCtl('d1-budget', 'Presupuesto', s.budget, 10, 250, 5, v => '€' + v + 'M')}
      ${rangeCtl('d1-age', 'Menor de', s.age, 17, 38, 1, v => v + ' años')}
      ${rangeCtl('d1-pot', 'Potencial mayor que', s.pot, 70, 95, 1, v => '' + v)}
      <div class="kpi brand"><div class="label">Valor total · 5 fichajes</div><div class="value num" id="d1-total">—</div></div>
    </div>
    <div class="grid-2">
      ${panel({ tag: 'Resultado', q: '5 fichajes recomendados', body: `<div id="d1-table" style="overflow-x:auto"></div><p class="answer" id="d1-meta"></p>` })}
      ${panel({ tag: 'Comparativa', q: 'Overall vs Potencial de los candidatos', canvas: 'd1-chart', answer: 'Cada fichaje combina un overall competitivo con un potencial más alto: la diferencia entre ambas barras es el margen de revalorización.' })}
    </div>`;
    bindRange('d1-budget', v => { s.budget = v; }, () => this.update());
    bindRange('d1-age', v => { s.age = v; }, () => this.update());
    bindRange('d1-pot', v => { s.pot = v; }, () => this.update());
    this.update();
  },
  update() {
    const s = this.state;
    const cohort = D.pool.filter(p => p.a < s.age && p.t > s.pot);
    const mediaVpr = cohort.length ? cohort.reduce((x, p) => x + p.v / p.o, 0) / cohort.length : 0;
    const elegibles = cohort.filter(p => p.v / p.o < mediaVpr).sort((a, b) => b.t - a.t || b.o - a.o);
    const sel = [], budget = s.budget * 1e6; let rest = budget;
    for (const p of elegibles) { if (sel.length === 5) break; if (p.v <= rest) { sel.push(p); rest -= p.v; } }
    const total = sel.reduce((x, p) => x + p.v, 0);
    $('#d1-total').textContent = sel.length ? fmtEur(total) : '€0';
    $('#d1-meta').innerHTML = `Media valor/rating del cohorte: <b class="num">${fmtEur(mediaVpr)}</b> por punto · cohorte: <b>${fmtInt(cohort.length)}</b> · elegibles (bajo la media): <b>${fmtInt(elegibles.length)}</b> · restante: <b class="num">${fmtEur(budget - total)}</b>`;
    $('#d1-table').innerHTML = sel.length
      ? kvTable(sel.map((p, i) => [`<span class="rank">${i + 1}</span> ${p.n}`, p.a, p.o, p.t, p.v]), ['Jugador', 'Edad', 'Ovr', 'Pot', 'Valor'], [4])
      : `<p class="empty">Ningún jugador cumple estos filtros. Subí el presupuesto o bajá el potencial mínimo.</p>`;
    const ch = Chart.getChart('d1-chart'); if (ch) ch.destroy();
    if (sel.length) groupBar('d1-chart', sel.map(p => p.n.split(' ').slice(-1)[0]), [{ label: 'Overall', data: sel.map(p => p.o) }, { label: 'Potencial', data: sel.map(p => p.t) }]);
  },
});

/* DASHBOARD 2 — Construcción de Equipo */
let _d2cache = null;
function d2prep() {
  if (_d2cache) return _d2cache;
  const byOvr = D.pool.slice().sort((a, b) => b.o - a.o);
  const byCat = { GK: [], DEF: [], MID: [], ATT: [] };
  const cheap = { GK: [], DEF: [], MID: [], ATT: [] };
  D.pool.forEach(p => { if (byCat[p.cat]) { byCat[p.cat].push(p); if (p.o >= 70) cheap[p.cat].push(p.v); } });
  const pref = {};
  for (const k in cheap) { const a = cheap[k].sort((x, y) => x - y), s = [0]; for (let i = 0; i < a.length; i++) s.push(s[i] + a[i]); pref[k] = s; }
  _d2cache = { byOvr, byCat, pref };
  return _d2cache;
}
const d2minRest = (pref, cupos) => { let t = 0; for (const k in cupos) { const n = cupos[k]; if (n <= 0) continue; const s = pref[k]; t += s[Math.min(n, s.length - 1)]; } return t; };

/* Greedy con look-ahead de presupuesto (Fase IV): mejor overall que aún deje completar las plazas */
function d2Greedy(req, budget) {
  const { byOvr, pref } = d2prep();
  const cupos = { ...req }; let presup = budget; const xi = [];
  for (const p of byOvr) {
    if (cupos.GK + cupos.DEF + cupos.MID + cupos.ATT === 0) break;
    if (cupos[p.cat] <= 0 || p.v > presup) continue;
    const after = { ...cupos }; after[p.cat]--;
    if (presup - p.v < d2minRest(pref, after)) continue;
    xi.push(p); cupos[p.cat]--; presup -= p.v;
  }
  return xi;
}

/* Programación Lineal (Fase IV): relajación lagrangiana del presupuesto. Para cada λ se eligen
   por categoría los n mejores por (overall − λ·valor); se busca el λ mínimo que cumple el
   presupuesto → equivale a la solución de linprog (relajar la restricción y redondear por posición). */
function d2TopByScore(arr, n, lam) {
  const top = [];                                    // n pequeño (≤5): se mantiene el top-n por score
  for (const p of arr) {
    const sc = p.o - lam * p.v;
    if (top.length < n) { top.push({ sc, p }); if (top.length === n) top.sort((a, b) => a.sc - b.sc); }
    else if (sc > top[0].sc) { top[0] = { sc, p }; top.sort((a, b) => a.sc - b.sc); }
  }
  return top.map(t => t.p);
}
function d2Linprog(req, budget) {
  const { byCat } = d2prep();
  const evalLam = lam => {
    let xi = [], val = 0;
    for (const cat in req) { const picks = d2TopByScore(byCat[cat], req[cat], lam); xi = xi.concat(picks); picks.forEach(p => { val += p.v; }); }
    return { xi, val };
  };
  const base = evalLam(0);                            // λ=0 → máximo overall sin penalizar costo
  if (base.val <= budget) return base.xi;             // si ya cabe, es el óptimo sin restricción
  let lo = 0, hi = 1e-3, g = 0;
  while (evalLam(hi).val > budget && g++ < 80) hi *= 2;
  for (let i = 0; i < 50; i++) { const mid = (lo + hi) / 2; if (evalLam(mid).val <= budget) hi = mid; else lo = mid; }
  return evalLam(hi).xi;                              // λ mínimo factible → XI óptimo dentro del presupuesto
}

registerView('dash2', {
  group: 'Dashboards interactivos', label: 'Construcción de equipo', icon: 'team',
  crumb: 'Dashboards', title: 'Construcción de Equipo',
  state: { budget: 150, def: 4, mid: 3, fwd: 3, method: 'linprog' },
  render(c) {
    const s = this.state;
    c.innerHTML = `<div class="view-intro"><h2>Construcción de Equipo</h2>
      <p>Arma el XI de mayor overall dentro del presupuesto y la formación elegida. Resolvelo con <b>Programación Lineal</b> (óptimo, como concluye la Fase IV) o con <b>Greedy + look-ahead</b>; el botón cambia el método sin tocar nada más, para comparar rating y costo.</p></div>
    <div class="dash-controls">
      ${rangeCtl('d2-budget', 'Presupuesto', s.budget, 30, 600, 10, v => '€' + v + 'M')}
      ${rangeCtl('d2-def', 'Defensas', s.def, 3, 5, 1, v => '' + v)}
      ${rangeCtl('d2-mid', 'Mediocampistas', s.mid, 2, 5, 1, v => '' + v)}
      ${rangeCtl('d2-fwd', 'Delanteros', s.fwd, 1, 4, 1, v => '' + v)}
    </div>
    <div class="dash-controls">
      <div class="kpi brand"><div class="label">Overall total del XI</div><div class="value num" id="d2-ovr">—</div></div>
      <div class="kpi"><div class="label">Costo total</div><div class="value num" id="d2-cost">—</div></div>
      <div class="control" style="display:flex;flex-direction:column;gap:var(--sp-2);justify-content:center">
        <button id="d2-method" class="method-btn" type="button"></button>
        <span id="d2-badge"></span>
      </div>
    </div>
    ${panel({ tag: 'Resultado', q: 'XI seleccionado (1 portero + tu formación)', body: `<div id="d2-table" style="overflow-x:auto"></div>`, answer: 'La <b>Programación Lineal</b> devuelve el XI óptimo (máximo overall posible dentro del presupuesto); el <b>Greedy</b> elige paso a paso y suele quedar algo por debajo. Cambiá el método con el botón y comparás el rating y el costo, igual que en la Fase IV.' })}`;
    ['budget', 'def', 'mid', 'fwd'].forEach(k => bindRange('d2-' + k, v => { s[k] = v; }, () => this.update()));
    $('#d2-method').addEventListener('click', () => { s.method = s.method === 'linprog' ? 'greedy' : 'linprog'; this.update(); });
    this.update();
  },
  update() {
    const s = this.state;
    const req = { GK: 1, DEF: s.def, MID: s.mid, ATT: s.fwd };
    const budget = s.budget * 1e6, total = 1 + s.def + s.mid + s.fwd;
    const xi = s.method === 'linprog' ? d2Linprog(req, budget) : d2Greedy(req, budget);
    const ovr = xi.reduce((x, p) => x + p.o, 0), cost = xi.reduce((x, p) => x + p.v, 0);
    const within = cost <= budget && xi.length === total;
    $('#d2-ovr').textContent = ovr || '—';
    $('#d2-cost').textContent = fmtEur(cost);
    const mb = $('#d2-method');
    mb.textContent = s.method === 'linprog' ? 'Método: Programación Lineal (óptimo) · cambiar a Greedy' : 'Método: Greedy + look-ahead · cambiar a Lineal';
    mb.setAttribute('aria-pressed', s.method === 'linprog');
    $('#d2-badge').outerHTML = `<span id="d2-badge" class="badge ${within ? 'ok' : 'bad'}">${within ? icon('check') : icon('alert')} ${within ? 'XI completo dentro del presupuesto' : 'No se completa el XI con este presupuesto'}</span>`;
    $('#d2-table').innerHTML = kvTable(xi.map(p => [p.n, p.p, p.o, p.t, p.v, p.c]), ['Jugador', 'Posición', 'Ovr', 'Pot', 'Valor', 'Club'], [4]);
  },
});

/* DASHBOARD 3 — Vender o No */
registerView('dash3', {
  group: 'Dashboards interactivos', label: 'Vender o no', icon: 'scale',
  crumb: 'Dashboards', title: 'Vender o No',
  state: { age: 28, ovr: 82, pot: 83, wage: 200 },
  render(c) {
    const s = this.state;
    c.innerHTML = `<div class="view-intro"><h2>Vender o No</h2>
      <p>Decisión basada en los 3 factores que pide el enunciado — <b>valor por rating</b>, <b>salario</b> y <b>brecha de potencial</b> — comparados contra los jugadores existentes de su mismo nivel (overall ±2, edad ±2). En vez de un sí/no rígido se calcula una <b>conveniencia de vender (0–100%)</b> que combina los tres de forma gradual.</p></div>
    <div class="dash-controls">
      ${rangeCtl('d3-age', 'Edad', s.age, 16, 40, 1, v => v + ' años')}
      ${rangeCtl('d3-ovr', 'Overall', s.ovr, 50, 95, 1, v => '' + v)}
      ${rangeCtl('d3-pot', 'Potencial', s.pot, 50, 99, 1, v => '' + v)}
      ${rangeCtl('d3-wage', 'Salario', s.wage, 1, 600, 5, v => '€' + v + 'K')}
    </div>
    <div class="grid-2">
      <div id="d3-verdict"></div>
      ${panel({ tag: 'Perfil', q: 'Jugador vs. su cohorte (overall ±2, edad ±2)', canvas: 'd3-chart', answer: 'El radar compara al jugador con el promedio de su cohorte (mismo nivel y edad) en cada criterio; cuanto más sobresale en salario/valor y menos en juventud y brecha, más conviene vender.' })}
    </div>`;
    ['age', 'ovr', 'pot', 'wage'].forEach(k => bindRange('d3-' + k, v => { s[k] = v; }, () => this.update()));
    this.update();
  },
  update() {
    const s = this.state;
    const peers = D.pool.filter(p => p.o >= s.ovr - 2 && p.o <= s.ovr + 2 && p.a >= s.age - 2 && p.a <= s.age + 2);
    const brecha = s.pot - s.ovr;
    // valor por rating: se ESTIMA el valor del jugador con la regresión de Fase IV (overall+age+potential)
    const rg = D.e4.valueReg;
    const estVal = Math.expm1(rg.b0 + rg.ovr * s.ovr + rg.age * s.age + rg.pot * s.pot);
    const estVpr = s.ovr ? estVal / s.ovr : 0;
    const medVpr = median(peers.map(p => p.v / p.o)) || 1;
    const medWage = median(peers.map(p => p.w)) || 1;
    const ratioV = estVpr / medVpr, ratioW = (s.wage * 1000) / medWage;
    const logistic = (x, c, k) => 1 / (1 + Math.exp(-k * (x - c)));
    // sub-señales 0..1 (1 = apunta a vender), continuas → sin saltos por 1 punto
    const sBrecha = 1 / (1 + Math.exp((brecha - 3) / 1.5));   // poca brecha → vender
    const sWage = logistic(ratioW, 1, 1.6);                    // salario sobre el mercado → vender
    const sVpr = logistic(ratioV, 1, 1.6);                     // valor/rating sobre el mercado → vender
    const score = (sBrecha + sWage + sVpr) / 3;
    const pct = Math.round(score * 100);
    const verdict = score >= 0.5 ? 'VENDER' : 'RETENER';
    const drivers = [];
    if (sBrecha > 0.55) drivers.push('poco margen de crecimiento');
    if (sWage > 0.55) drivers.push('salario alto para su nivel');
    if (sVpr > 0.55) drivers.push('valor por rating sobre el mercado');
    const keepers = [];
    if (sBrecha < 0.45) keepers.push('aún tiene margen de mejora');
    if (sWage < 0.45) keepers.push('salario contenido');
    if (sVpr < 0.45) keepers.push('precio razonable para su nivel');
    const why = verdict === 'VENDER'
      ? 'Conviene vender: ' + (drivers.join(' y ') || 'la combinación de los tres factores') + '.'
      : 'Conviene retenerlo: ' + (keepers.join(' y ') || 'los factores no justifican venderlo') + '.';
    const fbar = (label, sub, detail) => `<div class="factor">
      <div class="factor-head"><span>${label}</span><span class="num">${Math.round(sub * 100)}%</span></div>
      <div class="fbar"><div class="fbar-fill ${sub >= 0.5 ? 'sell' : 'keep'}" style="width:${Math.round(sub * 100)}%"></div></div>
      <div class="factor-det">${detail}</div></div>`;
    $('#d3-verdict').innerHTML = `
      <div class="verdict ${verdict === 'RETENER' ? 'keep' : 'sell'}">
        <span class="vlabel">Conveniencia de vender</span><span class="vbig">${pct}%</span><span class="vwhy">${verdict} · ${why}</span>
      </div>
      <div class="panel" style="margin-top:var(--sp-4)">
        <div class="factor-list">
          ${fbar('Valor por rating', sVpr, `valor estimado <b>${fmtEur(estVal)}</b> · ${ratioV >= 1 ? 'por encima' : 'por debajo'} del mercado de su nivel`)}
          ${fbar('Salario', sWage, `<b>€${s.wage}K</b> vs <b>${fmtEur(medWage)}</b> mediana del nivel`)}
          ${fbar('Brecha de potencial', sBrecha, `<b>${brecha}</b> pts de margen (potencial − overall)`)}
        </div>
        <p class="answer">Comparado con <b>${fmtInt(peers.length)}</b> jugadores de su mismo nivel y edad. El veredicto cambia de forma gradual, no de golpe.</p>
      </div>`;
    const ch = Chart.getChart('d3-chart'); if (ch) ch.destroy();
    const avg = f => peers.length ? peers.reduce((x, p) => x + f(p), 0) / peers.length : 0;
    radar('d3-chart', ['Overall', 'Potencial', 'Brecha', 'Juventud', 'Salario (K)'],
      [{ label: 'Jugador', data: [s.ovr, s.pot, brecha, 40 - s.age, s.wage] },
       { label: 'Cohorte (prom.)', data: [Math.round(avg(p => p.o)), Math.round(avg(p => p.t)), Math.round(avg(p => p.b)), Math.round(40 - avg(p => p.a)), Math.round(avg(p => p.w) / 1000)] }]);
  },
});
