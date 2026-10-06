// Datos de ejemplo: solo se usan cuando Supabase no está configurado en Vercel.
export const DEMO = {
  settings: {},
  services: [
    {
      id: 'demo-web', slug: 'paginas-web', title: 'Páginas web', short_tag: 'Web',
      eyebrow: 'Presencia digital',
      description: 'Sitios con identidad, ritmo editorial y estructura clara. Cada pantalla se diseña para que tu marca se vea, se entienda y se recuerde.',
      projects_heading: 'Proyectos que convierten una visita en una conversación.',
      image_url: null, image_caption: 'Página para Talay México', illustration: 'browser', highlight: false,
    },
    {
      id: 'demo-flujos', slug: 'automatizacion-tareas', title: 'Automatización de tareas', short_tag: 'Flujos',
      eyebrow: 'Flujos conectados',
      description: 'Diseñamos flujos útiles para reducir tareas repetitivas, mantener procesos en movimiento y responder justo a tiempo.',
      projects_heading: 'Flujos que trabajan mientras tú te enfocas en lo importante.',
      image_url: null, image_caption: 'Ciclo de automatización usando n8n.', illustration: 'flow', highlight: false,
    },
    {
      id: 'demo-wa', slug: 'automatizacion-whatsapp', title: 'Automatización de WhatsApp', short_tag: 'Mensajes',
      eyebrow: 'Conversaciones automáticas',
      description: 'Respuestas inmediatas, seguimiento de clientes y mensajes programados desde el canal que tus clientes ya usan.',
      projects_heading: 'Conversaciones que no se quedan sin respuesta.',
      image_url: null, image_caption: 'Respuestas automáticas las 24 horas.', illustration: 'chat', highlight: true,
    },
  ],
  projects: [
    { id: 'p1', service_id: 'demo-web', title: 'Café Lumbre', url: '', image_url: null,
      description: 'Una página de campaña clara, directa y preparada para transformar interés en acción.' },
    { id: 'p2', service_id: 'demo-web', title: 'Talay México', url: '', image_url: null,
      description: 'Productos, servicios y colecciones organizados para navegar con claridad y carácter.' },
    { id: 'p3', service_id: 'demo-web', title: 'Zona Huella', url: '', image_url: null,
      description: 'Un escaparate editorial para proyectos, procesos y casos que merece la pena recordar.' },
  ],
  packages: [
    { id: 'k1', service_id: 'demo-web', tag: 'Digital', title: 'Página web', price_label: '$1,000', highlight: true,
      features: 'Dominio personalizado\nHosting\nPágina responsiva\nEstructura optimizada para móvil' },
    { id: 'k2', service_id: 'demo-flujos', tag: 'Flujos', title: 'Automatización de tareas', price_label: 'Cotización personalizada', highlight: false,
      features: 'Diagnóstico de tu proceso\nFlujo a la medida (n8n)\nConexión con tus apps\nPruebas y ajustes' },
    { id: 'k3', service_id: 'demo-wa', tag: 'Mensajes', title: 'Automatización de WhatsApp', price_label: 'Cotización personalizada', highlight: false,
      features: 'Respuestas automáticas\nMenú de opciones\nSeguimiento de clientes\nIntegración con tu negocio' },
  ],
  contacts: [
    { id: 'c1', label: 'Correo', value: 'Agregar correo', url: '' },
    { id: 'c2', label: 'Instagram', value: 'hikaru2025_', url: 'https://www.instagram.com/hikaru2025_/' },
    { id: 'c3', label: 'Número', value: 'Agregar número', url: '' },
    { id: 'c4', label: 'TikTok', value: 'Agregar TikTok', url: '' },
  ],
};
