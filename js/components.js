// Piezas reutilizables que comparten todas las páginas
import { submitRequest } from './data.js';
import { $, pad, esc, safeUrl, domainOf, toast, icon } from './utils.js';

export const serviceHref = (s) => `/html/servicio.html?s=${encodeURIComponent(s.slug)}`;
export const contactHref = (serviceId) => (serviceId ? `/html/contacto.html?s=${encodeURIComponent(serviceId)}` : '/html/contacto.html');

/** Divide "Título | descripción" por línea. */
export const pairs = (text) => String(text || '').split('\n').map((l) => l.trim()).filter(Boolean)
  .map((l) => { const [a, ...b] = l.split('|'); return [a.trim(), b.join('|').trim()]; });

export function illustration(kind, label = '') {
  if (kind === 'flow') {
    return `<div class="ill ill-flow">
      <svg viewBox="0 0 400 320" aria-hidden="true">
        <defs><linearGradient id="flowGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d64d6c"/><stop offset="1" stop-color="#e2786a"/></linearGradient></defs>
        <path id="flowPath" class="wire" d="M90 80 C 200 80, 200 160, 310 160 S 200 250, 90 250"/>
        <rect class="node" x="30" y="56" width="120" height="48" rx="14"/><text x="90" y="85" text-anchor="middle">Evento</text>
        <rect class="node node-accent" x="250" y="136" width="120" height="48" rx="14"/><text x="310" y="165" text-anchor="middle">Procesa</text>
        <rect class="node" x="30" y="226" width="120" height="48" rx="14"/><text x="90" y="255" text-anchor="middle">Notifica</text>
        <circle r="7" fill="#ffd2dc"><animateMotion dur="3.6s" repeatCount="indefinite"><mpath href="#flowPath"/></animateMotion></circle>
      </svg></div>`;
  }
  if (kind === 'chat') {
    return `<div class="ill ill-chat" aria-hidden="true">
      <div class="bubble">Hola, ¿tienen disponibilidad esta semana?</div>
      <div class="bubble out">¡Hola! Sí 🙌 Te comparto los horarios disponibles.</div>
      <div class="bubble">Perfecto, quiero agendar.</div>
      <div class="bubble out typing"><i></i><i></i><i></i></div>
    </div>`;
  }
  if (kind === 'none') return '<div class="ill" style="background:var(--grad-accent)"></div>';
  return `<div class="ill ill-browser" aria-hidden="true">
    <div class="ill-bar"><i></i><i></i><i></i><span>${esc(label)}</span></div>
    <div class="ill-body"><div class="ill-hero"></div><div class="ill-grid"><b></b><b></b><b></b><b></b><b></b><b></b></div></div>
  </div>`;
}

export function mediaStage(s) {
  const img = safeUrl(s.image_url);
  return `
    <div class="media-stage reveal" style="--d:.12s">
      <div class="halo"></div>
      <div class="media-frame">
        ${img ? `<img src="${esc(img)}" alt="${esc(s.image_caption || s.title)}">` : illustration(s.illustration, s.title)}
      </div>
      ${s.image_caption ? `<div class="media-caption">${esc(s.image_caption)}</div>` : ''}
    </div>`;
}

export function sectionHead({ eyebrow, title, text, h = 'h2', action = '' }) {
  return `
    <div class="section-head">
      <div>
        ${eyebrow ? `<p class="eyebrow reveal">${esc(eyebrow)}</p>` : ''}
        <${h} class="display ${h} reveal" style="--d:.06s">${esc(title)}</${h}>
      </div>
      ${text || action ? `<div class="section-aside reveal" style="--d:.12s">${text ? `<p class="text">${esc(text)}</p>` : ''}${action}</div>` : ''}
    </div>`;
}

export function serviceCard(s, i) {
  return `
    <a class="nav-card service-card tilt reveal" href="${serviceHref(s)}" style="--d:${(i * 0.08).toFixed(2)}s">
      <span class="kicker">${pad(i + 1)} / ${esc(s.short_tag || 'Categoría')}</span>
      <span class="display h3">${esc(s.title)}</span>
      <span class="card-text">${esc(s.description)}</span>
      <span class="card-link">Ver más <span class="arrow">${icon.arrow}</span></span>
    </a>`;
}

export function projectCard(p, j, tag) {
  const url = safeUrl(p.url);
  const dom = domainOf(url);
  const img = safeUrl(p.image_url);
  const media = img ? `<img src="${esc(img)}" alt="" loading="lazy">` : illustration('browser', dom || p.title);
  return `
    <article class="project tilt reveal" style="--d:${(j * 0.08).toFixed(2)}s">
      ${url ? `<a class="project-media" href="${esc(url)}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">${media}</a>` : `<div class="project-media">${media}</div>`}
      <div class="project-body">
        <span class="kicker accent">${esc(tag)} / ${pad(j + 1)}</span>
        <h3 class="display h3">${esc(p.title)}</h3>
        ${dom ? `<a class="domain" href="${esc(url)}" target="_blank" rel="noopener">${esc(dom)} ${icon.arrowSm}</a>` : ''}
        <p class="text">${esc(p.description)}</p>
        <div class="project-actions">
          ${url
            ? `<a class="btn btn-ghost" href="${esc(url)}" target="_blank" rel="noopener">Visitar página ${icon.arrowSm}</a>`
            : '<span class="btn btn-ghost" aria-disabled="true">Próximamente</span>'}
        </div>
      </div>
    </article>`;
}

export function packageCard(p, i) {
  const features = String(p.features || '').split('\n').map((f) => f.replace(/^\s*[-–•]\s*/, '').trim()).filter(Boolean);
  return `
    <article class="pkg tilt reveal ${p.highlight ? 'is-highlight' : ''}" style="--d:${(i * 0.08).toFixed(2)}s">
      ${p.highlight ? '<span class="badge">Recomendado</span>' : ''}
      <span class="kicker accent">${pad(i + 1)} / ${esc(p.tag)}</span>
      <h3 class="display h3">${esc(p.title)}</h3>
      <p class="price">${esc(p.price_label)}</p>
      ${features.length ? `<div class="pkg-includes"><span>Incluye:</span><ul>${features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></div>` : ''}
      <a class="btn btn-ghost btn-block" href="${contactHref(p.service_id)}">Lo quiero</a>
    </article>`;
}

export function contactCard(c, i) {
  const url = safeUrl(c.url);
  const ext = url.startsWith('http') ? ' target="_blank" rel="noopener"' : '';
  return `
    <article class="contact tilt reveal" style="--d:${(i * 0.07).toFixed(2)}s">
      <span class="kicker accent">${esc(c.label)}</span>
      <span class="display h3 value">${esc(c.value)}</span>
      ${url
        ? `<a class="btn btn-ghost btn-block" href="${esc(url)}"${ext}>Abrir enlace ${icon.arrowSm}</a>`
        : '<span class="btn btn-ghost btn-block" aria-disabled="true">Próximamente</span>'}
    </article>`;
}

export function ctaBand(S) {
  return `
    <section class="section">
      <div class="cta-band reveal">
        <div>
          <h2 class="display h2">${esc(S.cta_title)}</h2>
          <p class="text">${esc(S.cta_text)}</p>
        </div>
        <a class="btn btn-primary" href="/html/contacto.html">Contáctanos ${icon.arrowSm}</a>
      </div>
    </section>`;
}

export function quoteForm(services, selected = '', S = null) {
  return `
    <form class="form-card reveal" style="--d:.1s" id="quote-form" novalidate>
      ${S ? `<div class="form-intro">
        <p class="eyebrow">${esc(S.form_eyebrow)}</p>
        <h2 class="display h3">${esc(S.form_title)}</h2>
        <p class="text">${esc(S.form_text)}</p>
      </div>` : ''}
      <div class="row-2">
        <label class="field"><span>Nombre</span><input name="name" required maxlength="120" autocomplete="name"></label>
        <label class="field"><span>Correo</span><input name="email" type="email" required maxlength="200" autocomplete="email"></label>
      </div>
      <label class="field"><span>Categoría de interés</span>
        <select name="service_id">
          <option value="">Selecciona una categoría</option>
          ${services.map((s) => `<option value="${esc(s.id)}" ${s.id === selected ? 'selected' : ''}>${esc(s.title)}</option>`).join('')}
          <option value="otro">Otro</option>
        </select>
      </label>
      <label class="field"><span>Cuéntanos tu idea</span><textarea name="message" rows="5" maxlength="5000"></textarea></label>
      <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button class="btn btn-primary" type="submit">Enviar solicitud</button>
    </form>`;
}

export function setupQuoteForm(S) {
  const form = $('#quote-form');
  if (!form) return;
  const btn = $('button[type="submit"]', form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    if (fd.get('website')) return; // trampa anti-spam
    const name = String(fd.get('name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const message = String(fd.get('message') || '').trim();
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
      toast('Escribe tu nombre y un correo válido.', 'error');
      (name ? form.email : form.name).focus();
      return;
    }
    const sel = form.service_id;
    const serviceId = sel.value && sel.value !== 'otro' ? sel.value : null;
    const category = sel.value ? sel.options[sel.selectedIndex].text : '';
    btn.disabled = true;
    btn.textContent = 'Enviando…';
    try {
      const res = await submitRequest({ name, email, service_id: serviceId, category, message });
      if (res.demo) toast('Vista demo: conecta Supabase para guardar las solicitudes.');
      else { toast(S.form_success, 'ok'); form.reset(); }
    } catch (err) {
      console.error(err);
      toast('No pudimos enviar tu solicitud. Intenta de nuevo.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Enviar solicitud';
    }
  });
}
