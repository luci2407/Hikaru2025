import { boot } from '../layout.js';
import { esc, pad, icon } from '../utils.js';
import {
  sectionHead, mediaStage, projectCard, packageCard, serviceCard, ctaBand, contactHref, pairs,
} from '../components.js';

const slug = new URLSearchParams(location.search).get('s') || '';

boot(`s:${slug}`, ({ settings: S, services, projects, packages }, main) => {
  const index = services.findIndex((x) => x.slug === slug);
  const s = services[index];

  if (!s) {
    document.title = `Servicio no encontrado · ${S.brand}`;
    main.innerHTML = `
      <section class="section page-hero">
        <div class="hero-copy">
          <p class="eyebrow reveal">Error 404</p>
          <h1 class="display h2 reveal">Este servicio no existe o ya no está disponible.</h1>
          <a class="btn btn-primary reveal" href="/#servicios">Ver todos los servicios</a>
        </div>
      </section>`;
    return;
  }

  document.title = `${s.title} · ${S.brand}`;
  const list = projects.filter((p) => p.service_id === s.id);
  const pkgs = packages.filter((p) => p.service_id === s.id);
  const others = services.filter((x) => x.id !== s.id);
  const steps = pairs(S.process_steps);

  main.innerHTML = `
    <section class="section page-hero split">
      <div class="hero-copy">
        <p class="eyebrow reveal">Categoría / ${esc(s.eyebrow)}</p>
        <span class="num reveal" style="--d:.05s">${pad(index + 1)}</span>
        <h1 class="display h1 h1-page reveal" style="--d:.1s">${esc(s.title)}</h1>
        <p class="lead reveal" style="--d:.16s">${esc(s.description)}</p>
        <div class="hero-actions reveal" style="--d:.24s">
          <a class="btn btn-primary" href="${contactHref(s.id)}">Cotizar ${icon.arrowSm}</a>
          ${list.length ? `<a class="btn btn-ghost" href="#ejemplos">Ver ejemplos ${icon.down}</a>` : ''}
        </div>
      </div>
      ${mediaStage(s)}
    </section>

    ${list.length ? `
    <section class="section" id="ejemplos">
      ${sectionHead({ eyebrow: `${s.title} / Ejemplos`, title: s.projects_heading || 'Ejemplos', text: S.projects_text })}
      <div class="projects-grid">${list.map((p, j) => projectCard(p, j, s.short_tag || 'Proyecto')).join('')}</div>
    </section>` : ''}

    ${steps.length ? `
    <section class="section">
      ${sectionHead({ eyebrow: `${s.title} / Proceso`, title: S.process_title })}
      <ol class="steps">
        ${steps.map(([t, d], i) => `
          <li class="step tilt reveal" style="--d:${(i * 0.08).toFixed(2)}s">
            <span class="step-n">${pad(i + 1)}</span>
            <h3 class="display h3">${esc(t)}</h3>
            ${d ? `<p class="text">${esc(d)}</p>` : ''}
          </li>`).join('')}
      </ol>
    </section>` : ''}

    ${pkgs.length ? `
    <section class="section">
      ${sectionHead({ eyebrow: S.packages_eyebrow, title: S.packages_title, text: S.packages_text })}
      <div class="pkg-grid">${pkgs.map(packageCard).join('')}</div>
    </section>` : ''}

    ${others.length ? `
    <section class="section">
      ${sectionHead({ eyebrow: 'Más servicios', title: 'También te puede interesar' })}
      <div class="service-grid">${others.map((o) => serviceCard(o, services.indexOf(o))).join('')}</div>
    </section>` : ''}

    ${ctaBand(S)}`;
});
