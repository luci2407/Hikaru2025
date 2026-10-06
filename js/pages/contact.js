import { boot } from '../layout.js';
import { esc } from '../utils.js';
import { contactCard, quoteForm, setupQuoteForm } from '../components.js';

const preselect = new URLSearchParams(location.search).get('s') || '';

boot('contact', ({ settings: S, services, contacts }, main) => {
  document.title = `Contacto · ${S.brand}`;
  main.innerHTML = `
    <section class="section page-hero contact-page">
      <div class="contact-intro">
        <p class="eyebrow reveal">${esc(S.contact_eyebrow)}</p>
        <h1 class="display h1 h1-page reveal" style="--d:.08s">${esc(S.contact_title)}</h1>
        <p class="lead reveal" style="--d:.16s">${esc(S.contact_text)}</p>
        ${contacts.length ? `<div class="contact-grid compact">${contacts.map(contactCard).join('')}</div>` : ''}
      </div>
      ${quoteForm(services, preselect, S)}
    </section>`;
  setupQuoteForm(S);
});
