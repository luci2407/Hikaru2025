import { boot } from '../layout.js';
import { $$, esc, icon } from '../utils.js';
import { sectionHead, serviceCard, ctaBand, pairs } from '../components.js';

boot('about', ({ settings: S, services, projects }, main) => {
  document.title = `Sobre nosotros · ${S.brand}`;
  const story = String(S.about_story || '').split('\n').map((p) => p.trim()).filter(Boolean);
  const values = pairs(S.about_values);
  const stats = [
    [services.length, 'Servicios'],
    [projects.length, 'Proyectos'],
    [100, '% a tu medida'],
  ];

  main.innerHTML = `
    <section class="section page-hero split">
      <div class="hero-copy">
        <p class="eyebrow reveal">${esc(S.about_eyebrow)}</p>
        <h1 class="display h1 h1-page reveal" style="--d:.08s">${esc(S.about_title)}</h1>
        <p class="lead reveal" style="--d:.16s">${esc(S.about_intro)}</p>
        <div class="hero-actions reveal" style="--d:.24s">
          <a class="btn btn-primary" href="/html/contacto.html">Contacto ${icon.arrowSm}</a>
          <a class="btn btn-ghost" href="/#servicios">Ver servicios</a>
        </div>
      </div>
      <div class="hero-visual about-visual reveal" style="--d:.15s" data-parallax aria-hidden="true">
        <div class="blob blob-a" data-depth="20"></div>
        <div class="blob blob-c" data-depth="30"></div>
        <div class="blob blob-b" data-depth="-12"></div>
        <div class="hero-card" data-depth="8">
          <span class="range">${esc(S.brand)}</span>
          <span class="tags">Diseño / Flujos / Mensajes</span>
        </div>
      </div>
    </section>

    ${story.length ? `
    <section class="section story">
      <div class="story-grid">
        ${sectionHead({ eyebrow: 'Nuestra historia', title: 'Así empezó todo' })}
        <div class="story-text">${story.map((p, i) => `<p class="text reveal" style="--d:${(i * 0.08).toFixed(2)}s">${esc(p)}</p>`).join('')}</div>
      </div>
      <div class="stats">
        ${stats.map(([n, l], i) => `
          <div class="stat reveal" style="--d:${(i * 0.08).toFixed(2)}s">
            <span class="stat-n" data-count="${n}">0</span>
            <span class="kicker">${esc(l)}</span>
          </div>`).join('')}
      </div>
    </section>` : ''}

    ${values.length ? `
    <section class="section">
      ${sectionHead({ eyebrow: 'Valores', title: 'Lo que nos guía' })}
      <div class="steps">
        ${values.map(([t, d], i) => `
          <article class="step tilt reveal" style="--d:${(i * 0.08).toFixed(2)}s">
            <span class="step-n">0${i + 1}</span>
            <h3 class="display h3">${esc(t)}</h3>
            ${d ? `<p class="text">${esc(d)}</p>` : ''}
          </article>`).join('')}
      </div>
    </section>` : ''}

    ${services.length ? `
    <section class="section">
      ${sectionHead({ eyebrow: 'Lo que hacemos', title: S.index_title })}
      <div class="service-grid">${services.map(serviceCard).join('')}</div>
    </section>` : ''}

    ${ctaBand(S)}`;

  // contador animado de las cifras
  const counters = $$('[data-count]');
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const end = +e.target.dataset.count;
    const t0 = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / 1200);
      e.target.textContent = Math.round(end * (1 - (1 - k) ** 3));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: 0.6 });
  counters.forEach((c) => io.observe(c));
});
