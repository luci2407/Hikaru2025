import { getClient, isConfigured, SETTINGS_FIELDS, DEFAULT_SETTINGS } from './data.js';
import { $, $$, esc, safeUrl, slugify, toast } from './utils.js';

const app = $('#app');
const modal = $('#modal');
let sb = null;
let user = null;
let services = [];
let currentTab = 'requests';

/* =====================================================================
   Configuración de las tablas editables
   ===================================================================== */
const ILLUSTRATIONS = [['browser', 'Navegador'], ['flow', 'Flujo'], ['chat', 'Chat'], ['none', 'Solo degradado']];

const TABLES = {
  services: {
    label: 'Servicios', singular: 'servicio', eyebrow: 'Contenido / Categorías',
    help: 'Cada servicio crea su propia sección en el sitio, su tarjeta en el índice y una opción en el formulario.',
    cols: [
      { k: 'image_url', l: '', t: 'thumb' },
      { k: 'title', l: 'Título', t: 'strong' },
      { k: 'short_tag', l: 'Etiqueta' },
      { k: 'sort_order', l: 'Orden' },
      { k: 'active', l: 'Visible', t: 'bool' },
    ],
    defaults: { active: true, illustration: 'browser', sort_order: 0 },
    fields: [
      { k: 'title', l: 'Título', req: true },
      { k: 'slug', l: 'Slug (dirección)', req: true, help: 'Solo minúsculas y guiones. Ej: paginas-web' },
      { k: 'short_tag', l: 'Etiqueta corta', help: 'Aparece en la portada y en los ejemplos. Ej: Web' },
      { k: 'eyebrow', l: 'Subcategoría', help: 'Ej: Presencia digital' },
      { k: 'description', l: 'Descripción', t: 'textarea' },
      { k: 'projects_heading', l: 'Título de la sección de ejemplos' },
      { k: 'image_url', l: 'Imagen', t: 'image', nullable: true },
      { k: 'image_caption', l: 'Texto sobre la imagen' },
      { k: 'illustration', l: 'Ilustración animada (si no hay imagen)', t: 'select', options: ILLUSTRATIONS },
      { k: 'sort_order', l: 'Orden', t: 'number' },
      { k: 'highlight', l: 'Destacar en el índice', t: 'checkbox' },
      { k: 'active', l: 'Visible en el sitio', t: 'checkbox' },
    ],
  },
  projects: {
    label: 'Páginas y proyectos', singular: 'proyecto', eyebrow: 'Contenido / Ejemplos',
    help: 'Agrega el enlace de cada página: el sitio mostrará un botón “Visitar página” que abre el sitio real.',
    cols: [
      { k: 'image_url', l: '', t: 'thumb' },
      { k: 'title', l: 'Proyecto', t: 'strong' },
      { k: 'service_id', l: 'Servicio', t: 'service' },
      { k: 'url', l: 'Enlace', t: 'url' },
      { k: 'sort_order', l: 'Orden' },
      { k: 'active', l: 'Visible', t: 'bool' },
    ],
    defaults: { active: true, sort_order: 0 },
    fields: [
      { k: 'title', l: 'Nombre del proyecto', req: true },
      { k: 'url', l: 'Enlace directo a la página', t: 'url', nullable: true, placeholder: 'https://…', help: 'Debe empezar con https://' },
      { k: 'service_id', l: 'Servicio', t: 'service' },
      { k: 'description', l: 'Descripción', t: 'textarea' },
      { k: 'image_url', l: 'Captura o imagen', t: 'image', nullable: true },
      { k: 'sort_order', l: 'Orden', t: 'number' },
      { k: 'active', l: 'Visible en el sitio', t: 'checkbox' },
    ],
  },
  packages: {
    label: 'Paquetes y precios', singular: 'paquete', eyebrow: 'Contenido / Catálogo',
    cols: [
      { k: 'title', l: 'Paquete', t: 'strong' },
      { k: 'price_label', l: 'Precio' },
      { k: 'service_id', l: 'Servicio', t: 'service' },
      { k: 'sort_order', l: 'Orden' },
      { k: 'active', l: 'Visible', t: 'bool' },
    ],
    defaults: { active: true, sort_order: 0 },
    fields: [
      { k: 'title', l: 'Nombre del paquete', req: true },
      { k: 'tag', l: 'Etiqueta', help: 'Ej: Digital' },
      { k: 'price_label', l: 'Precio', help: 'Texto libre. Ej: $1,000 o Cotización personalizada' },
      { k: 'service_id', l: 'Servicio relacionado', t: 'service', help: 'Se preselecciona en el formulario al pulsar “Lo quiero”.' },
      { k: 'features', l: 'Qué incluye', t: 'textarea', help: 'Un elemento por línea.' },
      { k: 'sort_order', l: 'Orden', t: 'number' },
      { k: 'highlight', l: 'Marcar como recomendado', t: 'checkbox' },
      { k: 'active', l: 'Visible en el sitio', t: 'checkbox' },
    ],
  },
  contacts: {
    label: 'Medios de contacto', singular: 'medio de contacto', eyebrow: 'Contenido / Contacto',
    cols: [
      { k: 'label', l: 'Medio', t: 'strong' },
      { k: 'value', l: 'Texto' },
      { k: 'url', l: 'Enlace', t: 'url' },
      { k: 'sort_order', l: 'Orden' },
      { k: 'active', l: 'Visible', t: 'bool' },
    ],
    defaults: { active: true, sort_order: 0 },
    fields: [
      { k: 'label', l: 'Medio', req: true, help: 'Ej: Correo, Instagram, WhatsApp' },
      { k: 'value', l: 'Texto que se muestra', help: 'Ej: hola@tudominio.com' },
      { k: 'url', l: 'Enlace', t: 'url', nullable: true, help: 'mailto:correo@…, tel:+52…, https://wa.me/52…, https://instagram.com/…' },
      { k: 'sort_order', l: 'Orden', t: 'number' },
      { k: 'active', l: 'Visible en el sitio', t: 'checkbox' },
    ],
  },
};

const TABS = [
  { id: 'requests', label: 'Solicitudes' },
  { id: 'services', label: 'Servicios' },
  { id: 'projects', label: 'Páginas' },
  { id: 'packages', label: 'Paquetes' },
  { id: 'contacts', label: 'Contacto' },
  { id: 'settings', label: 'Textos del sitio' },
];

const STATUS = [['nueva', 'Nueva'], ['en_proceso', 'En proceso'], ['cerrada', 'Cerrada']];

/* =====================================================================
   Autenticación
   ===================================================================== */
async function init() {
  if (!(await isConfigured())) {
    app.innerHTML = `<main class="auth"><div class="auth-card notice">
      <span class="brand">hikaru2025</span>
      <p class="eyebrow">Panel de administración</p>
      <h1 class="display h3">Conecta Supabase para usar el panel</h1>
      <p class="text">En Vercel, ve a <strong>Settings → Environment Variables</strong> y agrega <strong>SUPABASE_URL</strong> y <strong>SUPABASE_ANON_KEY</strong> (la anon / publishable key). Después vuelve a desplegar el sitio.</p>
      <a class="btn btn-ghost" href="/">Volver al sitio</a>
    </div></main>`;
    return;
  }
  sb = await getClient();
  sb.auth.onAuthStateChange((_event, session) => {
    // se difiere para no bloquear el cliente de Supabase dentro del callback
    setTimeout(() => route(session), 0);
  });
}

let routedUserId;
async function route(session) {
  const id = session?.user?.id || null;
  if (id === routedUserId && app.dataset.ready) return;
  routedUserId = id;
  app.dataset.ready = '1';
  user = session?.user || null;
  if (!user) return renderLogin();

  const { data: ok, error } = await sb.rpc('is_admin');
  if (error || !ok) return renderNotAdmin();
  await loadServices();
  renderShell();
}

function renderLogin() {
  app.innerHTML = `<main class="auth">
    <form class="auth-card" id="login">
      <a class="brand" href="/">hikaru2025</a>
      <p class="eyebrow">Panel de administración</p>
      <h1 class="display h2">Inicia sesión</h1>
      <label class="field"><span>Correo</span><input type="email" name="email" required autocomplete="username"></label>
      <label class="field"><span>Contraseña</span><input type="password" name="password" required autocomplete="current-password"></label>
      <button class="btn btn-primary" type="submit">Entrar</button>
      <p class="form-msg" data-msg></p>
    </form>
  </main>`;
  const form = $('#login');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('button', form);
    btn.disabled = true;
    $('[data-msg]', form).textContent = '';
    const { error } = await sb.auth.signInWithPassword({
      email: form.email.value.trim(),
      password: form.password.value,
    });
    btn.disabled = false;
    if (error) $('[data-msg]', form).textContent = 'Correo o contraseña incorrectos.';
  });
}

function renderNotAdmin() {
  app.innerHTML = `<main class="auth"><div class="auth-card notice">
    <span class="brand">hikaru2025</span>
    <h1 class="display h3">Tu usuario aún no es administrador</h1>
    <p class="text">Ejecuta esto en Supabase &gt; SQL Editor y recarga la página:</p>
    <code>insert into public.admins (user_id) values ('${esc(user.id)}');</code>
    <button class="btn btn-ghost" type="button" data-logout>Cerrar sesión</button>
  </div></main>`;
  $('[data-logout]').addEventListener('click', () => sb.auth.signOut());
}

/* =====================================================================
   Estructura del panel
   ===================================================================== */
async function loadServices() {
  const { data } = await sb.from('services').select('id,title').order('sort_order');
  services = data || [];
}

function renderShell() {
  app.innerHTML = `<div class="admin-shell">
    <aside class="admin-side">
      <a class="brand" href="/" target="_blank" rel="noopener">hikaru2025</a>
      <p class="eyebrow">Admin</p>
      <nav class="admin-nav">
        ${TABS.map((t) => `<button type="button" data-tab="${t.id}">${t.label}<span class="count" data-count="${t.id}"></span></button>`).join('')}
      </nav>
      <div class="side-foot">
        <a class="btn btn-ghost sm" href="/" target="_blank" rel="noopener">Ver sitio ↗</a>
        <button class="link-btn" type="button" data-logout>Cerrar sesión</button>
        <small>${esc(user.email)}</small>
      </div>
    </aside>
    <main class="admin-main" id="view"></main>
  </div>`;

  $('.admin-nav').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]');
    if (b) openTab(b.dataset.tab);
  });
  $('[data-logout]').addEventListener('click', () => sb.auth.signOut());
  $('#view').addEventListener('click', onViewClick);
  $('#view').addEventListener('change', onViewChange);

  const fromHash = location.hash.slice(1);
  openTab(TABS.some((t) => t.id === fromHash) ? fromHash : 'requests');
  refreshNewCount();
}

function openTab(id) {
  currentTab = id;
  history.replaceState(null, '', `#${id}`);
  $$('.admin-nav button').forEach((b) => b.classList.toggle('active', b.dataset.tab === id));
  const view = $('#view');
  view.innerHTML = '<div class="loader"><span></span><span></span><span></span></div>';
  if (id === 'requests') return renderRequests();
  if (id === 'settings') return renderSettings();
  return renderTable(id);
}

async function refreshNewCount() {
  const { count } = await sb.from('requests').select('id', { count: 'exact', head: true }).eq('status', 'nueva');
  const el = $('[data-count="requests"]');
  if (el) el.textContent = count ? String(count) : '';
}

/* =====================================================================
   Tablas (servicios, proyectos, paquetes, contacto)
   ===================================================================== */
let rows = [];

function cell(col, row) {
  const v = row[col.k];
  switch (col.t) {
    case 'bool':
      return `<label class="switch" title="Mostrar u ocultar"><input type="checkbox" data-toggle="${col.k}" ${v ? 'checked' : ''} aria-label="Visible"><span></span></label>`;
    case 'url': {
      const u = safeUrl(v);
      return u ? `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(v)}</a>` : '<span class="muted">—</span>';
    }
    case 'service':
      return esc(services.find((s) => s.id === v)?.title || '—');
    case 'thumb': {
      const u = safeUrl(v);
      return u ? `<img class="thumb" src="${esc(u)}" alt="">` : '<span class="thumb" style="display:block"></span>';
    }
    default:
      return esc(v ?? '');
  }
}

async function renderTable(key) {
  const cfg = TABLES[key];
  const { data, error } = await sb.from(key).select('*').order('sort_order').order('created_at');
  if (currentTab !== key) return;
  const view = $('#view');
  if (error) {
    view.innerHTML = `<p class="text">No se pudo cargar: ${esc(error.message)}</p>`;
    return;
  }
  rows = data;
  view.innerHTML = `
    <header class="view-head">
      <div>
        <p class="eyebrow">${cfg.eyebrow}</p>
        <h1 class="display h2">${cfg.label}</h1>
        ${cfg.help ? `<p class="text">${cfg.help}</p>` : ''}
      </div>
      <button class="btn btn-primary" type="button" data-new>+ Nuevo ${cfg.singular}</button>
    </header>
    <div class="panel">
      ${rows.length ? `
      <table class="data">
        <thead><tr>${cfg.cols.map((c) => `<th>${c.l}</th>`).join('')}<th></th></tr></thead>
        <tbody>
          ${rows.map((r) => `<tr data-id="${esc(r.id)}">
            ${cfg.cols.map((c) => `<td data-label="${c.l || 'Imagen'}" class="${c.t === 'strong' ? 'strong' : ''}">${cell(c, r)}</td>`).join('')}
            <td class="row-actions"><button class="icon-btn" type="button" data-edit>Editar</button><button class="icon-btn danger" type="button" data-del>Eliminar</button></td>
          </tr>`).join('')}
        </tbody>
      </table>` : `<p class="empty">Todavía no hay registros. Crea el primero con el botón de arriba.</p>`}
    </div>`;
}

async function onViewClick(e) {
  const key = currentTab;
  const id = e.target.closest('[data-id]')?.dataset.id;

  if (e.target.closest('[data-new]')) return openForm(key, null);
  if (e.target.closest('[data-edit]')) return openForm(key, rows.find((r) => r.id === id));

  if (e.target.closest('[data-del]')) {
    const label = key === 'requests' ? 'esta solicitud' : 'este registro';
    if (!confirm(`¿Eliminar ${label}? Esta acción no se puede deshacer.`)) return;
    const { error } = await sb.from(key).delete().eq('id', id);
    if (error) return toast(error.message, 'error');
    toast('Eliminado', 'ok');
    if (key === 'services') await loadServices();
    if (key === 'requests') refreshNewCount();
    return openTab(key);
  }

  const chip = e.target.closest('[data-filter]');
  if (chip) {
    reqFilter = chip.dataset.filter;
    return paintRequests();
  }
  if (e.target.closest('[data-export]')) return exportCsv();
}

async function onViewChange(e) {
  const id = e.target.closest('[data-id]')?.dataset.id;
  const toggle = e.target.closest('[data-toggle]');
  if (toggle) {
    const { error } = await sb.from(currentTab).update({ [toggle.dataset.toggle]: toggle.checked }).eq('id', id);
    if (error) { toggle.checked = !toggle.checked; return toast(error.message, 'error'); }
    const r = rows.find((x) => x.id === id);
    if (r) r[toggle.dataset.toggle] = toggle.checked;
    return toast(toggle.checked ? 'Visible en el sitio' : 'Oculto del sitio', 'ok');
  }
  const status = e.target.closest('[data-status-select]');
  if (status) {
    const { error } = await sb.from('requests').update({ status: status.value }).eq('id', id);
    if (error) return toast(error.message, 'error');
    const r = requests.find((x) => x.id === id);
    if (r) r.status = status.value;
    status.closest('.req').dataset.status = status.value;
    refreshNewCount();
    toast('Estado actualizado', 'ok');
  }
}

/* ---------- Formulario modal ---------- */
function fieldHTML(f, value) {
  const v = value ?? '';
  const help = f.help ? `<span class="help">${esc(f.help)}</span>` : '';
  const req = f.req ? ' required' : '';
  switch (f.t) {
    case 'textarea':
      return `<label class="field"><span>${f.l}</span><textarea name="${f.k}" rows="4"${req}>${esc(v)}</textarea>${help}</label>`;
    case 'number':
      return `<label class="field"><span>${f.l}</span><input type="number" name="${f.k}" value="${esc(v)}" step="1"></label>`;
    case 'checkbox':
      return `<label class="check"><span class="switch"><input type="checkbox" name="${f.k}" ${value ? 'checked' : ''}><span></span></span>${f.l}</label>`;
    case 'select':
      return `<label class="field"><span>${f.l}</span><select name="${f.k}">${f.options.map(([val, lab]) => `<option value="${val}" ${val === v ? 'selected' : ''}>${lab}</option>`).join('')}</select></label>`;
    case 'service':
      return `<label class="field"><span>${f.l}</span><select name="${f.k}"><option value="">Sin servicio</option>${services.map((s) => `<option value="${esc(s.id)}" ${s.id === v ? 'selected' : ''}>${esc(s.title)}</option>`).join('')}</select>${help}</label>`;
    case 'image': {
      const u = safeUrl(v);
      return `<div class="field"><span>${f.l}</span>
        <div class="img-field">
          ${u ? `<img src="${esc(u)}" alt="" data-preview="${f.k}">` : `<span class="ph" data-preview="${f.k}"></span>`}
          <div>
            <input type="text" name="${f.k}" value="${esc(v)}" placeholder="https://… o sube un archivo">
            <span class="btn btn-ghost sm file-btn">Subir imagen<input type="file" accept="image/*" data-upload="${f.k}"></span>
          </div>
        </div></div>`;
    }
    default:
      return `<label class="field"><span>${f.l}</span><input type="${f.t === 'url' ? 'url' : 'text'}" inputmode="${f.t === 'url' ? 'url' : 'text'}" name="${f.k}" value="${esc(v)}" placeholder="${esc(f.placeholder || '')}"${req}>${help}</label>`;
  }
}

function openForm(key, row) {
  const cfg = TABLES[key];
  const isNew = !row;
  const data = row || { ...cfg.defaults };
  const plain = cfg.fields.filter((f) => f.t !== 'checkbox');
  const checks = cfg.fields.filter((f) => f.t === 'checkbox');

  modal.innerHTML = `<form class="modal-card" novalidate>
    <header><h2 class="display h3">${isNew ? 'Nuevo' : 'Editar'} ${cfg.singular}</h2><button class="icon-btn" type="button" data-close aria-label="Cerrar">✕</button></header>
    <div class="modal-body">
      ${plain.map((f) => fieldHTML(f, data[f.k])).join('')}
      ${checks.length ? `<div class="checks">${checks.map((f) => fieldHTML(f, data[f.k])).join('')}</div>` : ''}
    </div>
    <footer><button class="btn btn-ghost" type="button" data-close>Cancelar</button><button class="btn btn-primary" type="submit">Guardar</button></footer>
  </form>`;
  modal.showModal();
  const form = $('form', modal);

  // slug automático al crear un servicio
  if (key === 'services' && isNew) {
    let touched = false;
    form.slug.addEventListener('input', () => (touched = true));
    form.title.addEventListener('input', () => { if (!touched) form.slug.value = slugify(form.title.value); });
  }

  $$('[data-close]', form).forEach((b) => b.addEventListener('click', () => modal.close()));

  $$('[data-upload]', form).forEach((input) => input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    const label = input.parentElement;
    label.firstChild.textContent = 'Subiendo…';
    try {
      const url = await uploadImage(file, key);
      form[input.dataset.upload].value = url;
      const prev = $(`[data-preview="${input.dataset.upload}"]`, form);
      const img = document.createElement('img');
      img.src = url; img.alt = ''; img.dataset.preview = input.dataset.upload;
      prev.replaceWith(img);
      toast('Imagen subida', 'ok');
    } catch (err) {
      toast(err.message || 'No se pudo subir la imagen', 'error');
    } finally {
      label.firstChild.textContent = 'Subir imagen';
      input.value = '';
    }
  }));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {};
    for (const f of cfg.fields) {
      const el = form.elements[f.k];
      if (f.t === 'checkbox') payload[f.k] = el.checked;
      else if (f.t === 'number') payload[f.k] = parseInt(el.value || '0', 10) || 0;
      else if (f.t === 'service') payload[f.k] = el.value || null;
      else {
        const v = el.value.trim();
        payload[f.k] = f.nullable && !v ? null : v;
      }
      if (f.req && !payload[f.k]) { el.focus(); return toast(`Completa “${f.l}”.`, 'error'); }
      if (f.t === 'url' && payload[f.k] && !safeUrl(payload[f.k])) {
        el.focus();
        return toast('El enlace debe empezar con https://, mailto: o tel:', 'error');
      }
    }
    if (key === 'services') payload.slug = slugify(payload.slug);

    const btn = $('button[type="submit"]', form);
    btn.disabled = true;
    const { error } = isNew
      ? await sb.from(key).insert(payload)
      : await sb.from(key).update(payload).eq('id', row.id);
    btn.disabled = false;
    if (error) return toast(error.code === '23505' ? 'Ese slug ya existe, usa otro.' : error.message, 'error');
    modal.close();
    toast('Guardado', 'ok');
    if (key === 'services') await loadServices();
    openTab(key);
  });
}

modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });

async function uploadImage(file, folder) {
  if (file.size > 5 * 1024 * 1024) throw new Error('La imagen pesa más de 5 MB.');
  const clean = file.name.normalize('NFD').replace(/[^\w.-]+/g, '_');
  const path = `${folder}/${Date.now()}-${clean}`;
  const { error } = await sb.storage.from('media').upload(path, file, { cacheControl: '31536000', upsert: false });
  if (error) throw error;
  return sb.storage.from('media').getPublicUrl(path).data.publicUrl;
}

/* =====================================================================
   Solicitudes
   ===================================================================== */
let requests = [];
let reqFilter = 'all';

async function renderRequests() {
  const { data, error } = await sb.from('requests').select('*').order('created_at', { ascending: false });
  if (currentTab !== 'requests') return;
  if (error) { $('#view').innerHTML = `<p class="text">No se pudo cargar: ${esc(error.message)}</p>`; return; }
  requests = data;
  paintRequests();
}

function paintRequests() {
  const list = reqFilter === 'all' ? requests : requests.filter((r) => r.status === reqFilter);
  const fmt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
  const counts = Object.fromEntries(STATUS.map(([s]) => [s, requests.filter((r) => r.status === s).length]));
  $('#view').innerHTML = `
    <header class="view-head">
      <div>
        <p class="eyebrow">Formulario / Bandeja</p>
        <h1 class="display h2">Solicitudes</h1>
        <p class="text">Mensajes enviados desde “¿Qué quieres añadir a tu negocio?”.</p>
      </div>
      <button class="btn btn-ghost" type="button" data-export ${requests.length ? '' : 'disabled'}>Exportar CSV</button>
    </header>
    <div class="chips">
      <button class="chip ${reqFilter === 'all' ? 'active' : ''}" type="button" data-filter="all">Todas · ${requests.length}</button>
      ${STATUS.map(([s, l]) => `<button class="chip ${reqFilter === s ? 'active' : ''}" type="button" data-filter="${s}">${l} · ${counts[s]}</button>`).join('')}
    </div>
    <div class="req-list">
      ${list.length ? list.map((r) => `
        <article class="req" data-id="${esc(r.id)}" data-status="${esc(r.status)}">
          <header>
            <div><strong>${esc(r.name)}</strong><a href="mailto:${esc(r.email)}">${esc(r.email)}</a></div>
            <time datetime="${esc(r.created_at)}">${fmt.format(new Date(r.created_at))}</time>
          </header>
          <span class="tag">${esc(r.category || 'Sin categoría')}</span>
          ${r.message ? `<p>${esc(r.message)}</p>` : ''}
          <footer>
            <select data-status-select aria-label="Estado">${STATUS.map(([s, l]) => `<option value="${s}" ${r.status === s ? 'selected' : ''}>${l}</option>`).join('')}</select>
            <a class="btn btn-ghost sm" href="mailto:${esc(r.email)}?subject=${encodeURIComponent('Tu solicitud en hikaru2025')}">Responder</a>
            <button class="icon-btn danger" type="button" data-del>Eliminar</button>
          </footer>
        </article>`).join('') : '<div class="panel"><p class="empty">No hay solicitudes en esta vista.</p></div>'}
    </div>`;
}

function exportCsv() {
  const head = ['Fecha', 'Nombre', 'Correo', 'Categoría', 'Mensaje', 'Estado'];
  const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [head.map(q).join(',')].concat(
    requests.map((r) => [r.created_at, r.name, r.email, r.category, r.message, r.status].map(q).join(',')),
  );
  const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'solicitudes.csv' });
  a.click();
  URL.revokeObjectURL(a.href);
}

/* =====================================================================
   Textos del sitio
   ===================================================================== */
async function renderSettings() {
  const { data, error } = await sb.from('settings').select('key,value');
  if (currentTab !== 'settings') return;
  if (error) { $('#view').innerHTML = `<p class="text">No se pudo cargar: ${esc(error.message)}</p>`; return; }
  const values = { ...DEFAULT_SETTINGS, ...Object.fromEntries(data.map((r) => [r.key, r.value])) };
  $('#view').innerHTML = `
    <header class="view-head"><div>
      <p class="eyebrow">Sitio / Textos</p>
      <h1 class="display h2">Textos del sitio</h1>
      <p class="text">Títulos y descripciones de cada sección.</p>
    </div></header>
    <form class="settings-form" id="settings-form">
      ${SETTINGS_FIELDS.map((g) => `
        <section class="settings-group">
          <h2>${g.group}</h2>
          <div class="grid">
            ${g.fields.map(([k, l, t]) => t === 'textarea'
              ? `<label class="field"><span>${l}</span><textarea name="${k}" rows="3">${esc(values[k])}</textarea></label>`
              : `<label class="field"><span>${l}</span><input name="${k}" value="${esc(values[k])}"></label>`).join('')}
          </div>
        </section>`).join('')}
      <button class="btn btn-primary sticky-save" type="submit">Guardar cambios</button>
    </form>`;

  $('#settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const now = new Date().toISOString();
    const payload = SETTINGS_FIELDS.flatMap((g) => g.fields.map(([k]) => ({ key: k, value: form.elements[k].value.trim(), updated_at: now })));
    const btn = $('button[type="submit"]', form);
    btn.disabled = true;
    const { error: err } = await sb.from('settings').upsert(payload);
    btn.disabled = false;
    if (err) return toast(err.message, 'error');
    toast('Textos guardados', 'ok');
  });
}

init();
