import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SITE_CONFIG } from '../../core/site.config';
import { SeoService } from '../../core/services/seo.service';
@Component({
  standalone: true,
  imports: [FormsModule],
  template: `<section class="page-hero">
      <div class="container narrow">
        <span class="eyebrow">Project & support enquiry</span>
        <h1>Tell us what is slowing your business down.</h1>
        <p>
          Share the website, software problem or new project. Submitting the form opens WhatsApp
          with your enquiry ready to send.
        </p>
      </div>
    </section>
    <section class="section container contact-grid">
      <form class="card contact-form" (ngSubmit)="submit(form)" #form="ngForm">
        <label class="hp-field" aria-hidden="true"
          >Leave this field empty<input
            tabindex="-1"
            autocomplete="off"
            name="honeypot"
            [(ngModel)]="model.honeypot"
        /></label>
        <div class="field-grid">
          <label class="field"
            ><span>Name *</span
            ><input
              required
              autocomplete="name"
              maxlength="120"
              name="name"
              [(ngModel)]="model.name"
          /></label>
          <label class="field"
            ><span>Email *</span
            ><input
              required
              type="email"
              autocomplete="email"
              maxlength="200"
              name="email"
              [(ngModel)]="model.email"
          /></label>
          <label class="field"
            ><span>Phone / WhatsApp</span
            ><input
              type="tel"
              autocomplete="tel"
              maxlength="50"
              name="phone"
              [(ngModel)]="model.phone"
          /></label>
          <label class="field"
            ><span>Website / app URL</span
            ><input
              type="url"
              inputmode="url"
              autocomplete="url"
              maxlength="500"
              name="website"
              [(ngModel)]="model.website"
          /></label>
        </div>
        <label class="field"
          ><span>What do you need? *</span
          ><textarea
            required
            minlength="10"
            maxlength="2000"
            name="message"
            rows="7"
            [(ngModel)]="model.message"
          ></textarea>
        </label>
        <button class="button" type="submit" [disabled]="form.invalid">
          Continue on WhatsApp
        </button>
      </form>
      <aside class="card contact-aside">
        <div class="contact-direct">
          <span class="eyebrow">Contact directly</span>
          <h2>WhatsApp or email</h2>
          <p class="contact-detail">WhatsApp: {{ site.whatsappDisplay }}</p>
          <p class="contact-detail">Email: {{ site.email }}</p>
          <div class="button-row">
            <a
              class="button"
              [href]="directWhatsappUrl"
              target="_blank"
              rel="noopener noreferrer"
              >Chat on WhatsApp</a
            >
            <a class="button button-secondary" [href]="emailUrl">Send email</a>
          </div>
        </div>
        <span class="eyebrow">Good enquiry details</span>
        <h2>Include these if possible</h2>
        <ul class="check-list-simple">
          <li>Website/software link</li>
          <li>What is broken or missing</li>
          <li>What users or staff need to do</li>
          <li>Deadline or urgency</li>
          <li>Existing technology if known</li>
        </ul>
      </aside>
    </section>`,
})
export class ContactComponent {
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  protected readonly site = SITE_CONFIG;
  protected readonly directWhatsappUrl = `${SITE_CONFIG.whatsappUrl}?text=${encodeURIComponent(
    'Hello SellerOps, I would like to discuss a project or support request.',
  )}`;
  protected readonly emailUrl = `mailto:${SITE_CONFIG.email}`;
  protected model = {
    name: '',
    email: '',
    phone: '',
    website: '',
    message: '',
    source: this.route.snapshot.queryParamMap.get('source') ?? 'contact-page',
    honeypot: '',
  };
  constructor() {
    this.seo.apply({
      title: 'Contact SellerOps — Website & Software Help',
      description:
        'Contact SellerOps for ASP.NET, Angular, MERN or Laravel development, website fixes, software troubleshooting and ongoing technical support.',
      path: '/contact',
      jsonLd: [
        this.seo.pageSchema(
          'Contact SellerOps — Website & Software Help',
          'Contact SellerOps for ASP.NET, Angular, MERN or Laravel development, website fixes, software troubleshooting and ongoing technical support.',
          '/contact',
          'ContactPage',
        ),
        this.seo.breadcrumbs([
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ]),
      ],
    });
  }
  protected submit(form: NgForm): void {
    if (form.invalid || this.model.honeypot) return;

    const message = [
      'Hello SellerOps, I have a project or support enquiry.',
      `Name: ${this.model.name}`,
      `Email: ${this.model.email}`,
      this.model.phone ? `Phone / WhatsApp: ${this.model.phone}` : '',
      this.model.website ? `Website / app: ${this.model.website}` : '',
      `Details: ${this.model.message}`,
      `Source: ${this.model.source}`,
    ]
      .filter(Boolean)
      .join('\n');

    window.location.assign(`${SITE_CONFIG.whatsappUrl}?text=${encodeURIComponent(message)}`);
  }
}
