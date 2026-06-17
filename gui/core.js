/* gui/core.js — ensambla navegación desde el registro de vistas, router, tema e init.
   Se carga DE ÚLTIMO (después de etapas/*.js). */
'use strict';

/* mapa de vistas + navegación (desde window.__VIEWS) */
const views = Object.fromEntries(window.__VIEWS.map(v => [v.key, v]));

function buildNav() {
  const nav = $('#nav');
  const groups = [];
  window.__VIEWS.forEach(v => {
    let g = groups.find(x => x.group === v.group);
    if (!g) { g = { group: v.group, items: [] }; groups.push(g); }
    g.items.push(v);
  });
  nav.innerHTML = groups.map(g =>
    (g.group ? `<div class="nav-group-label">${g.group}</div>` : '') +
    g.items.map(v => `<button class="nav-item" data-key="${v.key}">${icon(v.icon)}<span>${v.label}</span></button>`).join('')
  ).join('');
  nav.querySelectorAll('.nav-item').forEach(b => b.addEventListener('click', () => { location.hash = b.dataset.key; closeNav(); }));
}

function route() {
  const key = location.hash.replace('#', '') || window.__VIEWS[0].key;
  const v = views[key] || views[window.__VIEWS[0].key];
  const content = $('#content');
  content.querySelectorAll('canvas').forEach(cv => { const ch = Chart.getChart(cv); if (ch) ch.destroy(); });
  applyChartTheme();
  v.render(content);
  $('#viewTitle').textContent = v.title;
  $('#crumb').textContent = v.crumb;
  document.querySelectorAll('.nav-item').forEach(b => b.setAttribute('aria-current', b.dataset.key === key ? 'page' : 'false'));
  content.scrollTo?.(0, 0); window.scrollTo(0, 0);
}

/* tema claro/oscuro */
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('fifa-theme', t);
  const sun = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
  const moon = '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>';
  $('#themeIcon').innerHTML = t === 'dark' ? moon : sun;
  if ($('#content').children.length) route(); // re-render con el nuevo tema
}

function closeNav() { $('#app').classList.remove('nav-open'); }

/* init */
function init() {
  buildNav();
  setTheme(localStorage.getItem('fifa-theme') || (location.search.includes('dark') ? 'dark' : 'light'));
  $('#themeBtn').addEventListener('click', () => setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));
  $('#menuBtn').addEventListener('click', () => $('#app').classList.toggle('nav-open'));
  $('#backdrop').addEventListener('click', closeNav);
  window.addEventListener('hashchange', route);
  route();
}
init();
