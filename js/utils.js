export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const pad = (n) => String(n).padStart(2, '0');

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

/** Solo permite enlaces http(s), mailto y tel. */
export function safeUrl(u) {
  if (!u) return '';
  try {
    const url = new URL(String(u).trim(), location.href);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

export function domainOf(u) {
  try {
    const url = new URL(u);
    return url.protocol.startsWith('http') ? url.hostname.replace(/^www\./, '') : '';
  } catch {
    return '';
  }
}

export function slugify(s) {
  return String(s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function toast(msg, type = '') {
  let el = $('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.append(el);
  }
  el.textContent = msg;
  el.dataset.type = type;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 4000);
}

const svg = (d, size = 22, w = 2) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

export const icon = {
  arrow: svg('<path d="M7 17 17 7M8 7h9v9"/>', 22, 2.2),
  arrowSm: svg('<path d="M7 17 17 7M8 7h9v9"/>', 16, 2.4),
  down: svg('<path d="M12 5v14M5 12l7 7 7-7"/>', 18, 2.2),
  left: svg('<path d="M19 12H5M11 18l-6-6 6-6"/>'),
  right: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  grid: svg('<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M12 4v16M4 12h16"/>', 18, 2),
  close: svg('<path d="M6 6l12 12M18 6 6 18"/>', 20, 2.2),
};
