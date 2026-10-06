// Encabezado, pie de página, efectos y arranque comunes a todas las páginas
import { loadSiteData, isConfigured } from './data.js';
import { $, $$, esc, safeUrl, icon } from './utils.js';
import { serviceHref } from './components.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

function renderHeader(data, active) {
  const { settings: S, services } = data;
  const header = $('#site-header');
  header.innerHTML = `
    <div class="nav-inner">
      <a class="brand" href="/"><img class="brand-mark" src="/img/logo-mark.svg" alt="" width="34" height="34"><span>${esc(S.brand)}</span></a>
      <nav class="nav-links" id="nav-links" aria-label="Principal">
        ${services.map((s) => `<a href="${serviceHref(s)}" ${active === `s:${s.slug}` ? 'aria-current="page"' : ''}>${esc(s.title)}</a>`).join('')}
        <a href="/html/nosotros.html" ${active === 'about' ? 'aria-current="page"' : ''}>Nosotros</a>
        <a class="nav-contact-mobile" href="/html/contacto.html">Contacto</a>
      </nav>
      <a class="pill-btn nav-cta" href="/html/contacto.html" ${active === 'contact' ? 'aria-current="page"' : ''}>Contacto ${icon.arrowSm}</a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="Abrir menú"><span></span><span></span></button>
    </div>`;

  const toggle = $('.menu-toggle', header);
  toggle.addEventListener('click', () => {
    const open = header.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  $$('.nav-links a', header).forEach((a) => a.addEventListener('click', () => header.classList.remove('menu-open')));

  const onScroll = () => header.classList.toggle('scrolled', scrollY > 12);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function renderFooter(data) {
  const { settings: S, services, contacts } = data;
  const social = contacts.filter((c) => safeUrl(c.url));
  $('#site-footer').innerHTML = `
    <div class="footer-grid">
      <div class="footer-brand">
        <a class="brand" href="/"><img class="brand-mark" src="/img/logo-mark.svg" alt="" width="34" height="34"><span>${esc(S.brand)}</span></a>
        <p class="text">${esc(S.hero_subtitle)}</p>
      </div>
      <div>
        <p class="kicker accent">Servicios</p>
        <ul>${services.map((s) => `<li><a href="${serviceHref(s)}">${esc(s.title)}</a></li>`).join('')}</ul>
      </div>
      <div>
        <p class="kicker accent">Estudio</p>
        <ul>
          <li><a href="/html/nosotros.html">Sobre nosotros</a></li>
          <li><a href="/#paquetes">Paquetes y precios</a></li>
          <li><a href="/html/contacto.html">Contacto</a></li>
        </ul>
      </div>
      ${social.length ? `<div>
        <p class="kicker accent">Síguenos</p>
        <ul>${social.map((c) => {
          const url = safeUrl(c.url);
          return `<li><a href="${esc(url)}"${url.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${esc(c.label)}</a></li>`;
        }).join('')}</ul>
      </div>` : ''}
    </div>
    <p class="footer-legal">© ${new Date().getFullYear()} ${esc(S.brand)}. Todos los derechos reservados.</p>`;
}

function initFx() {
  // Aparición al hacer scroll
  const els = $$('.reveal');
  if (reduced || !('IntersectionObserver' in window)) els.forEach((el) => el.classList.add('in'));
  else {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => io.observe(el));
  }
  if (reduced || !finePointer) return;

  // Inclinación 3D de tarjetas
  $$('.tilt').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--ry', `${(((e.clientX - r.left) / r.width - 0.5) * 7).toFixed(2)}deg`);
      el.style.setProperty('--rx', `${(-((e.clientY - r.top) / r.height - 0.5) * 7).toFixed(2)}deg`);
    });
    el.addEventListener('pointerleave', () => { el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); });
  });

  // Parallax de las figuras
  $$('[data-parallax]').forEach((stage) => {
    const layers = $$('[data-depth]', stage);
    stage.closest('section').addEventListener('pointermove', (e) => {
      const x = e.clientX / innerWidth - 0.5;
      const y = e.clientY / innerHeight - 0.5;
      layers.forEach((l) => {
        l.style.setProperty('--px', `${(x * l.dataset.depth).toFixed(1)}px`);
        l.style.setProperty('--py', `${(y * l.dataset.depth).toFixed(1)}px`);
      });
    });
  });
}

/** Rota textos dentro de [data-ticker]. */
export function startTicker(words) {
  const el = $('[data-ticker]');
  if (!el || words.length < 2 || reduced) return;
  let i = 0;
  setInterval(() => {
    el.classList.add('out');
    setTimeout(() => { i = (i + 1) % words.length; el.textContent = words[i]; el.classList.remove('out'); }, 350);
  }, 2800);
}

/**
 * Carga los datos, pinta encabezado y pie, ejecuta la página y activa los efectos.
 * @param {string} active  qué enlace del menú marcar ('home', 'about', 'contact', 's:<slug>')
 * @param {(data) => void} renderPage
 */
export async function boot(active, renderPage) {
  const main = $('#page');
  try {
    const data = await loadSiteData();
    renderHeader(data, typeof active === 'function' ? active(data) : active);
    renderFooter(data);
    await renderPage(data, main);
    if (!(await isConfigured())) {
      const b = document.createElement('div');
      b.className = 'demo-badge';
      b.textContent = 'Vista demo · configura Supabase en Vercel';
      document.body.append(b);
    }
    initFx();
    if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
  } catch (err) {
    console.error(err);
    main.innerHTML = `<section class="section page-hero"><div class="hero-copy">
      <p class="eyebrow">Error</p><h1 class="display h2">No pudimos cargar el contenido.</h1>
      <p class="text">Revisa las variables SUPABASE_URL y SUPABASE_ANON_KEY en Vercel y que hayas ejecutado schema.sql.</p>
    </div></section>`;
  }
}
