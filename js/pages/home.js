import { boot, startTicker } from '../layout.js';
import { esc, pad, icon } from '../utils.js';
import { sectionHead, serviceCard, packageCard, contactCard } from '../components.js';

boot('home', ({ settings: S, services, projects, packages, contacts }, main) => {
  const tags = services.map((s) => s.short_tag).filter(Boolean).join(' / ');

  main.innerHTML = `
    <section class="section hero" id="inicio">
      <div class="hero-copy">
        <p class="eyebrow reveal">${esc(S.hero_eyebrow)}</p>
        <h1 class="display h1 reveal" style="--d:.08s">${esc(S.hero_title)}</h1>
        <p class="lead reveal" style="--d:.16s">${esc(S.hero_subtitle)}</p>
        ${services.length ? `<p class="ticker reveal" style="--d:.24s"><span class="ticker-dot"></span><span data-ticker>${esc(services[0].title)}</span></p>` : ''}
        <div class="hero-actions reveal" style="--d:.32s">
          <a class="btn btn-primary" href="#servicios">Ver servicios ${icon.down}</a>
          <a class="btn btn-ghost" href="/html/contacto.html">Contacto</a>
        </div>
      </div>
      <div class="hero-visual reveal" style="--d:.15s" data-parallax aria-hidden="true">
        <div class="blob blob-a" data-depth="22"></div>
        <div class="blob blob-b" data-depth="-14"></div>
        <div class="blob blob-c" data-depth="34"></div>
        <div class="hero-card" data-depth="8">
          <span class="range">01—${pad(services.length)}</span>
          <span class="tags">${esc(tags)}</span>
        </div>
      </div>
    </section>

    ${services.length ? `
    <section class="section" id="servicios">
      ${sectionHead({ eyebrow: S.index_eyebrow, title: S.index_title, text: S.index_text })}
      <div class="service-grid">${services.map(serviceCard).join('')}</div>
    </section>` : ''}

    ${packages.length ? `
    <section class="section" id="paquetes">
      ${sectionHead({ eyebrow: S.packages_eyebrow, title: S.packages_title, text: S.packages_text })}
      <div class="pkg-grid">${packages.map(packageCard).join('')}</div>
    </section>` : ''}

    <section class="section" id="contacto">
      <div class="contact-band theme-dark">
        ${sectionHead({
          eyebrow: S.contact_eyebrow, title: S.contact_title, text: S.contact_text,
          action: `<a class="btn btn-primary" href="/html/contacto.html">Enviar solicitud ${icon.arrowSm}</a>`,
        })}
        ${contacts.length ? `<div class="contact-grid">${contacts.map(contactCard).join('')}</div>` : ''}
      </div>
    </section>`;

  startTicker(services.map((s) => s.title));
});
