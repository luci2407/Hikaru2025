import { DEMO } from './demo-data.js';

/*
 * Las credenciales NO están en el código: se piden a /api/config,
 * que las lee de las variables de entorno de Vercel.
 * Si no hay credenciales (o se abre con un servidor local simple), el sitio usa datos de demo.
 */
let configPromise = null;
function loadConfig() {
  if (!configPromise) {
    configPromise = fetch('/api/config', { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({}))
      .then((c) => ({ url: c.url || '', anonKey: c.anonKey || '' }));
  }
  return configPromise;
}

export async function isConfigured() {
  const c = await loadConfig();
  return Boolean(c.url && c.anonKey);
}

let client = null;
export async function getClient() {
  const c = await loadConfig();
  if (!c.url || !c.anonKey) return null;
  if (!client) {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    client = createClient(c.url, c.anonKey);
  }
  return client;
}

/** Textos por defecto (se usan si una clave no existe en la tabla settings). */
export const DEFAULT_SETTINGS = {
  brand: 'hikaru2025',
  hero_eyebrow: 'Estudio digital / 2026',
  hero_title: 'Hikaru 2025',
  hero_subtitle: 'Soluciones digitales que trabajan por ti',
  index_eyebrow: 'Servicios / Lo que hacemos',
  index_title: 'Tres formas de hacer que tu negocio fluya.',
  index_text: 'Explora cada servicio, revisa paquetes y encuentra el medio más cómodo para iniciar una conversación.',
  projects_eyebrow: 'Páginas web / Ejemplos',
  projects_title: 'Proyectos que convierten una visita en una conversación.',
  projects_text: 'Haz clic en cualquier proyecto para visitar la página en vivo.',
  packages_eyebrow: 'Catálogo / Paquetes y precios',
  packages_title: 'Paquetes y precios',
  packages_text: 'Precios de referencia: cada propuesta se ajusta a las necesidades de tu proyecto.',
  contact_eyebrow: 'Contacto / Hablemos',
  contact_title: 'Hablemos de tu proyecto',
  contact_text: 'Escríbenos por el canal que prefieras o déjanos tus datos y te respondemos pronto.',
  form_eyebrow: 'Hablemos / Siguiente paso',
  form_title: '¿Qué quieres añadir a tu negocio?',
  form_text: 'Cuéntanos qué proceso quieres simplificar. Revisaremos tu solicitud y prepararemos una propuesta a tu medida.',
  form_success: '¡Gracias! Recibimos tu solicitud y te contactaremos pronto.',
  about_eyebrow: 'Sobre nosotros',
  about_title: 'Diseñamos y automatizamos para que tu negocio avance.',
  about_intro: 'Somos un estudio digital que combina diseño web y automatización para que los negocios vendan más y trabajen menos.',
  about_story: 'Empezamos creando páginas para negocios locales y descubrimos que el sitio era solo el primer paso: después venían los mensajes sin responder, los pedidos anotados a mano y las tareas que se repetían todos los días.\nPor eso unimos diseño y automatización en un mismo lugar. Cada proyecto parte de cómo trabaja tu negocio hoy y termina con herramientas que lo hacen más fácil mañana.',
  about_values: 'Claridad | Explicamos cada paso sin tecnicismos.\nA tu medida | Cada proyecto parte de cómo trabaja tu negocio.\nAcompañamiento | Seguimos contigo después del lanzamiento.',
  process_title: 'Cómo trabajamos',
  process_steps: 'Diagnóstico | Conocemos tu negocio y lo que quieres lograr.\nPropuesta | Te enviamos alcance, tiempos y precio.\nConstrucción | Diseñamos, conectamos y probamos todo.\nLanzamiento | Publicamos y te enseñamos a usarlo.',
  cta_title: '¿Listo para que tu negocio fluya?',
  cta_text: 'Cuéntanos tu idea y te enviamos una propuesta a tu medida.',
};

/** Campos editables en Admin > Textos del sitio. */
export const SETTINGS_FIELDS = [
  { group: 'General', fields: [['brand', 'Nombre de la marca']] },
  { group: 'Inicio · Portada', fields: [['hero_eyebrow', 'Texto superior'], ['hero_title', 'Título'], ['hero_subtitle', 'Subtítulo']] },
  { group: 'Inicio · Servicios', fields: [['index_eyebrow', 'Texto superior'], ['index_title', 'Título'], ['index_text', 'Descripción', 'textarea']] },
  { group: 'Paquetes', fields: [['packages_eyebrow', 'Texto superior'], ['packages_title', 'Título'], ['packages_text', 'Descripción', 'textarea']] },
  { group: 'Contacto', fields: [['contact_eyebrow', 'Texto superior'], ['contact_title', 'Título'], ['contact_text', 'Descripción', 'textarea']] },
  { group: 'Formulario', fields: [['form_eyebrow', 'Texto superior'], ['form_title', 'Título'], ['form_text', 'Descripción', 'textarea'], ['form_success', 'Mensaje al enviar', 'textarea']] },
  { group: 'Sobre nosotros', fields: [['about_eyebrow', 'Texto superior'], ['about_title', 'Título'], ['about_intro', 'Introducción', 'textarea'], ['about_story', 'Historia (un párrafo por línea)', 'textarea'], ['about_values', 'Valores (Título | descripción, uno por línea)', 'textarea']] },
  { group: 'Páginas de servicio', fields: [['projects_text', 'Texto junto a los ejemplos', 'textarea'], ['process_title', 'Título del proceso'], ['process_steps', 'Pasos (Título | descripción, uno por línea)', 'textarea']] },
  { group: 'Llamado a la acción', fields: [['cta_title', 'Título'], ['cta_text', 'Texto', 'textarea']] },
];

function normalize(d) {
  const custom = Object.fromEntries(
    Object.entries(d.settings || {}).filter(([, v]) => v !== '' && v != null),
  );
  return {
    settings: { ...DEFAULT_SETTINGS, ...custom },
    services: d.services || [],
    projects: d.projects || [],
    packages: d.packages || [],
    contacts: d.contacts || [],
  };
}

export async function loadSiteData() {
  const sb = await getClient();
  if (!sb) return normalize(DEMO);
  const q = (t) => sb.from(t).select('*').eq('active', true).order('sort_order').order('created_at');
  const [st, sv, pr, pk, ct] = await Promise.all([
    sb.from('settings').select('key,value'),
    q('services'), q('projects'), q('packages'), q('contacts'),
  ]);
  const failed = [st, sv, pr, pk, ct].find((r) => r.error);
  if (failed) throw failed.error;
  return normalize({
    settings: Object.fromEntries(st.data.map((r) => [r.key, r.value])),
    services: sv.data, projects: pr.data, packages: pk.data, contacts: ct.data,
  });
}

export async function submitRequest(payload) {
  const sb = await getClient();
  if (!sb) return { demo: true };
  const { error } = await sb.from('requests').insert(payload);
  if (error) throw error;
  return {};
}
