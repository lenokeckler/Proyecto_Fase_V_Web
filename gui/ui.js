/* gui/ui.js — helpers de marcado: paneles, tablas, heatmap HTML, controles e iconos. */
'use strict';

/* panel + tablas */
function panel({ tag, q, canvas, tall, answer, body }) {
  return `<article class="panel">
    <div class="panel-head"><h3 class="panel-q">${q}</h3>${tag ? `<span class="panel-tag">${tag}</span>` : ''}</div>
    ${body ?? `<div class="chart-wrap${tall ? ' tall' : ''}"><canvas id="${canvas}"></canvas></div>`}
    ${answer ? `<p class="answer">${answer}</p>` : ''}
  </article>`;
}
function kvTable(rows, headers, eurCols = []) {
  const numeric = headers.map((_, i) => rows.length > 0 && typeof rows[0][i] === 'number');
  const th = headers.map((h, i) => `<th class="${numeric[i] ? 'n' : ''}">${h}</th>`).join('');
  const body = rows.map(r => `<tr>${r.map((c, i) => {
    const isNum = typeof c === 'number';
    const val = isNum ? (eurCols.includes(i) ? fmtEur(c) : fmtInt(c)) : c;
    return `<td class="${numeric[i] ? 'n' : ''}">${val}</td>`;
  }).join('')}</tr>`).join('');
  return `<table class="tbl"><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table>`;
}
/* heatmap de correlación como tabla HTML coloreada (azul = +, rojo = −) */
function heatmapTable(labels, matrix) {
  const short = labels.map(l => l.replace('value_eur', 'value').replace('wage_eur', 'wage').replace('BrechaPotencial', 'brecha').replace('potential', 'potent.'));
  const cell = v => {
    const a = Math.min(Math.abs(v), 1);
    const c = v >= 0 ? `rgba(37,99,235,${a})` : `rgba(225,67,90,${a})`;
    const txt = a > 0.55 ? '#fff' : 'var(--ink)';
    return `<td class="hm" style="background:${c};color:${txt}">${v.toFixed(2)}</td>`;
  };
  const head = '<th></th>' + short.map(l => `<th class="hm-h">${l}</th>`).join('');
  const rows = matrix.map((row, i) => `<tr><th class="hm-h">${short[i]}</th>${row.map(cell).join('')}</tr>`).join('');
  return `<div style="overflow-x:auto"><table class="tbl hm-tbl"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

/* controles (sliders) */
const _fmtMap = {};
function rangeCtl(id, label, val, min, max, step, fmt) {
  _fmtMap[id] = fmt;
  return `<div class="control">
    <label for="${id}">${label}<span class="out num" id="${id}-out">${fmt(val)}</span></label>
    <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}" aria-label="${label}">
  </div>`;
}
function bindRange(id, set, onChange) {
  const el = $('#' + id), out = $('#' + id + '-out'), fmt = _fmtMap[id] || (v => v);
  let raf = 0;
  el.addEventListener('input', () => {
    const v = +el.value; out.textContent = fmt(v); set(v);
    cancelAnimationFrame(raf); raf = requestAnimationFrame(onChange);
  });
}

/* iconos */
const ICONS = {
  home: '<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',
  broom: '<path d="M19 4l-7 7M5 21l4-1 9-9-3-3-9 9-1 4z"/><path d="M11 9l4 4"/>',
  cube: '<path d="M21 16V8l-9-5-9 5v8l9 5z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 14l3-4 3 3 5-7"/>',
  scatter: '<path d="M3 3v18h18"/><circle cx="8" cy="15" r="1.4"/><circle cx="13" cy="10" r="1.4"/><circle cx="18" cy="6" r="1.4"/>',
  alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.8L2 18a2 2 0 0 0 1.7 3h16.6A2 2 0 0 0 22 18L13.7 3.8a2 2 0 0 0-3.4 0z"/>',
  brain: '<path d="M9 3a3 3 0 0 0-3 3v1a3 3 0 0 0 0 6 3 3 0 0 0 3 3M15 3a3 3 0 0 1 3 3v1a3 3 0 0 1 0 6 3 3 0 0 1-3 3M9 3v15M15 3v15"/>',
  cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.4A2 2 0 0 0 9.5 17H18a2 2 0 0 0 2-1.6L21.5 8H6"/>',
  team: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 6a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6"/>',
  scale: '<path d="M12 3v18M6 7h12M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
};
function icon(n) { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[n]}</svg>`; }
