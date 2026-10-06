-- =====================================================================
--  hikaru2025 · Contenido inicial (ejecuta después de schema.sql)
--  Todo se puede editar después desde /admin
-- =====================================================================

insert into public.settings (key, value) values
  ('brand',            'hikaru2025'),
  ('hero_eyebrow',     'Estudio digital / 2026'),
  ('hero_title',       'Hikaru 2025'),
  ('hero_subtitle',    'Soluciones digitales que trabajan por ti'),
  ('index_eyebrow',    'Servicios / Lo que hacemos'),
  ('index_title',      'Tres formas de hacer que tu negocio fluya.'),
  ('index_text',       'Explora cada servicio, revisa paquetes y encuentra el medio más cómodo para iniciar una conversación.'),
  ('projects_eyebrow', 'Páginas web / Ejemplos'),
  ('projects_title',   'Proyectos que convierten una visita en una conversación.'),
  ('projects_text',    'Haz clic en cualquier proyecto para visitar la página en vivo.'),
  ('packages_eyebrow', 'Catálogo / Paquetes y precios'),
  ('packages_title',   'Paquetes y precios'),
  ('packages_text',    'Precios de referencia: cada propuesta se ajusta a las necesidades de tu proyecto.'),
  ('contact_eyebrow',  'Contacto / Hablemos'),
  ('contact_title',    'Hablemos de tu proyecto'),
  ('contact_text',     'Escríbenos por el canal que prefieras o déjanos tus datos y te respondemos pronto.'),
  ('form_eyebrow',     'Hablemos / Siguiente paso'),
  ('form_title',       '¿Qué quieres añadir a tu negocio?'),
  ('form_text',        'Cuéntanos qué proceso quieres simplificar. Revisaremos tu solicitud y prepararemos una propuesta a tu medida.'),
  ('form_success',     '¡Gracias! Recibimos tu solicitud y te contactaremos pronto.'),
  ('about_eyebrow',    'Sobre nosotros'),
  ('about_title',      'Diseñamos y automatizamos para que tu negocio avance.'),
  ('about_intro',      'Somos un estudio digital que combina diseño web y automatización para que los negocios vendan más y trabajen menos.'),
  ('about_story',      E'Empezamos creando páginas para negocios locales y descubrimos que el sitio era solo el primer paso: después venían los mensajes sin responder, los pedidos anotados a mano y las tareas que se repetían todos los días.\nPor eso unimos diseño y automatización en un mismo lugar. Cada proyecto parte de cómo trabaja tu negocio hoy y termina con herramientas que lo hacen más fácil mañana.'),
  ('about_values',     E'Claridad | Explicamos cada paso sin tecnicismos.\nA tu medida | Cada proyecto parte de cómo trabaja tu negocio.\nAcompañamiento | Seguimos contigo después del lanzamiento.'),
  ('process_title',    'Cómo trabajamos'),
  ('process_steps',    E'Diagnóstico | Conocemos tu negocio y lo que quieres lograr.\nPropuesta | Te enviamos alcance, tiempos y precio.\nConstrucción | Diseñamos, conectamos y probamos todo.\nLanzamiento | Publicamos y te enseñamos a usarlo.'),
  ('cta_title',        '¿Listo para que tu negocio fluya?'),
  ('cta_text',         'Cuéntanos tu idea y te enviamos una propuesta a tu medida.')
on conflict (key) do nothing;

insert into public.services
  (slug, title, short_tag, eyebrow, description, projects_heading, image_caption, illustration, highlight, sort_order)
values
  ('paginas-web', 'Páginas web', 'Web', 'Presencia digital',
   'Sitios con identidad, ritmo editorial y estructura clara. Cada pantalla se diseña para que tu marca se vea, se entienda y se recuerde.',
   'Proyectos que convierten una visita en una conversación.',
   'Página para Talay México', 'browser', false, 1),
  ('automatizacion-tareas', 'Automatización de tareas', 'Flujos', 'Flujos conectados',
   'Diseñamos flujos útiles para reducir tareas repetitivas, mantener procesos en movimiento y responder justo a tiempo.',
   'Flujos que trabajan mientras tú te enfocas en lo importante.',
   'Ciclo de automatización usando n8n.', 'flow', false, 2),
  ('automatizacion-whatsapp', 'Automatización de WhatsApp', 'Mensajes', 'Conversaciones automáticas',
   'Respuestas inmediatas, seguimiento de clientes y mensajes programados desde el canal que tus clientes ya usan.',
   'Conversaciones que no se quedan sin respuesta.',
   'Respuestas automáticas las 24 horas.', 'chat', true, 3)
on conflict (slug) do nothing;

insert into public.projects (service_id, title, description, url, sort_order)
select s.id, v.title, v.description, v.url, v.ord
from (values
  ('Café Lumbre', 'Una página de campaña clara, directa y preparada para transformar interés en acción.', null::text, 1),
  ('Talay México', 'Productos, servicios y colecciones organizados para navegar con claridad y carácter.', null::text, 2),
  ('Zona Huella', 'Un escaparate editorial para proyectos, procesos y casos que merece la pena recordar.', null::text, 3)
) as v(title, description, url, ord)
join public.services s on s.slug = 'paginas-web'
where not exists (select 1 from public.projects);

insert into public.packages (service_id, tag, title, price_label, features, highlight, sort_order)
select s.id, v.tag, v.title, v.price, v.features, v.hl, v.ord
from (values
  ('paginas-web', 'Digital', 'Página web', '$1,000',
   E'Dominio personalizado\nHosting\nPágina responsiva\nEstructura optimizada para móvil', true, 1),
  ('automatizacion-tareas', 'Flujos', 'Automatización de tareas', 'Cotización personalizada',
   E'Diagnóstico de tu proceso\nFlujo a la medida (n8n)\nConexión con tus apps\nPruebas y ajustes', false, 2),
  ('automatizacion-whatsapp', 'Mensajes', 'Automatización de WhatsApp', 'Cotización personalizada',
   E'Respuestas automáticas\nMenú de opciones\nSeguimiento de clientes\nIntegración con tu negocio', false, 3)
) as v(slug, tag, title, price, features, hl, ord)
join public.services s on s.slug = v.slug
where not exists (select 1 from public.packages);

insert into public.contacts (label, value, url, sort_order)
select * from (values
  ('Correo', 'Agregar correo', null::text, 1),
  ('Instagram', 'hikaru2025_', 'https://www.instagram.com/hikaru2025_/', 2),
  ('Número', 'Agregar número', null::text, 3),
  ('TikTok', 'Agregar TikTok', null::text, 4)
) as v(label, value, url, sort_order)
where not exists (select 1 from public.contacts);
