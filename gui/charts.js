/* gui/charts.js — fábrica de gráficos (Chart.js) + utilidades de tema y registro de vistas.
   Se carga después de dataset/data.js. Todo es global (scripts clásicos, funciona con file://). */
'use strict';

/* atajos y formato */
const $ = (s, r = document) => r.querySelector(s);
const D = DATA;
const fmtEur = v => {
  const a = Math.abs(v);
  if (a >= 1e9) return '€' + (v / 1e9).toFixed(1) + 'B';
  if (a >= 1e6) return '€' + (v / 1e6).toFixed(1) + 'M';
  if (a >= 1e3) return '€' + (v / 1e3).toFixed(0) + 'K';
  return '€' + Math.round(v);
};
const fmtInt = v => v.toLocaleString('es-CR');
const fmtNum = v => (Math.round(v * 100) / 100).toLocaleString('es-CR');

/* registro de vistas (cada etapa se registra aquí) */
window.__VIEWS = [];
function registerView(key, cfg) { cfg.key = key; window.__VIEWS.push(cfg); }

/* resolución de colores del tema (para canvas) */
const _probe = document.createElement('span');
_probe.style.display = 'none';
document.body.appendChild(_probe);
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
function resolve(c) { _probe.style.color = '#000'; _probe.style.color = c; return getComputedStyle(_probe).color; }
const tc = name => resolve(cssVar(name));
function alpha(rgb, a) { const m = rgb.match(/\d+(\.\d+)?/g); return `rgba(${m[0]},${m[1]},${m[2]},${a})`; }
function palette() { return ['--brand', '--accent', '--teal', '--violet', '--brand-strong'].map(tc); }

/* fábrica de gráficos */
const _reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
function applyChartTheme() {
  Chart.defaults.font.family = 'Fira Sans, system-ui, sans-serif';
  Chart.defaults.font.size = 12;
  Chart.defaults.color = tc('--muted');
  if (_reduceMotion) Chart.defaults.animation = false;   // respeta prefers-reduced-motion
  Chart.defaults.plugins.tooltip.backgroundColor = tc('--ink');
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.plugins.tooltip.titleFont = { family: 'Fira Sans', weight: '600' };
  Chart.defaults.plugins.tooltip.bodyFont = { family: 'Fira Code' };
}
const axis = (eur = false) => ({
  grid: { color: tc('--grid'), drawBorder: false },
  ticks: { color: tc('--muted'), callback: eur ? (v => fmtEur(v)) : undefined },
});
function bar(id, labels, vals, { horizontal = true, colorVar = '--brand', eur = false } = {}) {
  const col = tc(colorVar);
  const valAx = { ...axis(eur), beginAtZero: true };
  const catAx = { type: 'category', grid: { display: false }, ticks: { color: tc('--muted'), autoSkip: false, maxRotation: horizontal ? 0 : 50 } };
  return new Chart($('#' + id), {
    type: 'bar',
    data: { labels, datasets: [{ data: vals, backgroundColor: alpha(col, 0.85), hoverBackgroundColor: col, borderRadius: 5, maxBarThickness: 30 }] },
    options: {
      indexAxis: horizontal ? 'y' : 'x', responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { title: () => '', label: c => eur ? fmtEur(c.parsed[horizontal ? 'x' : 'y']) : fmtNum(c.parsed[horizontal ? 'x' : 'y']) } } },
      scales: horizontal ? { x: valAx, y: catAx } : { x: catAx, y: valAx },
      animation: { duration: 500, easing: 'easeOutQuart' },
    },
  });
}
function groupBar(id, labels, datasets, { eur = false } = {}) {
  const pal = palette();
  return new Chart($('#' + id), {
    type: 'bar',
    data: { labels, datasets: datasets.map((d, i) => ({ label: d.label, data: d.data, backgroundColor: alpha(pal[i], 0.85), hoverBackgroundColor: pal[i], borderRadius: 5, maxBarThickness: 34 })) },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'top', labels: { boxWidth: 12, boxHeight: 12, usePointStyle: true, color: tc('--ink-soft') } },
        tooltip: { callbacks: { label: c => `${c.dataset.label}: ${eur ? fmtEur(c.parsed.y) : fmtNum(c.parsed.y)}` } } },
      scales: { x: { type: 'category', grid: { display: false }, ticks: { color: tc('--muted'), maxRotation: 0 } }, y: axis(eur) }, animation: { duration: 500, easing: 'easeOutQuart' },
    },
  });
}
function doughnut(id, labels, vals) {
  const pal = palette();
  return new Chart($('#' + id), {
    type: 'doughnut',
    data: { labels, datasets: [{ data: vals, backgroundColor: pal.map(c => alpha(c, 0.9)), borderColor: tc('--surface'), borderWidth: 2 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '58%', plugins: { legend: { position: 'right', labels: { color: tc('--ink-soft'), boxWidth: 12, usePointStyle: true } } }, animation: { duration: 500 } },
  });
}
function scatter(id, pts, xl, yl, { logY = true } = {}) {
  const col = tc('--brand');
  return new Chart($('#' + id), {
    type: 'scatter',
    data: { datasets: [{ data: pts, backgroundColor: alpha(col, 0.5), pointRadius: 3, pointHoverRadius: 5 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${xl} ${c.parsed.x} · ${fmtEur(c.parsed.y)}` } } },
      scales: { x: { ...axis(), title: { display: true, text: xl, color: tc('--muted') } },
                y: { ...axis(true), type: logY ? 'logarithmic' : 'linear', title: { display: true, text: yl, color: tc('--muted') } } },
      animation: { duration: 400 },
    },
  });
}
function radar(id, labels, datasets) {
  const pal = palette();
  return new Chart($('#' + id), {
    type: 'radar',
    data: { labels, datasets: datasets.map((d, i) => ({ label: d.label, data: d.data, borderColor: pal[i], backgroundColor: alpha(pal[i], 0.18), pointBackgroundColor: pal[i], borderWidth: 2 })) },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'top', labels: { color: tc('--ink-soft'), boxWidth: 12, usePointStyle: true } } },
      scales: { r: { grid: { color: tc('--grid') }, angleLines: { color: tc('--grid') }, pointLabels: { color: tc('--ink-soft'), font: { size: 12 } }, ticks: { display: false } } },
      animation: { duration: 500 },
    },
  });
}
