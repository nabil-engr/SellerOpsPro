import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LeadService } from '../../core/services/lead.service';
import { SeoService } from '../../core/services/seo.service';
@Component({
  standalone: true,
  imports: [FormsModule],
  template: `<section class="page-hero">
      <div class="container narrow">
        <span class="eyebrow">Project & support enquiry</span>
        <h1>Tell us what is slowing your business down.</h1>
        <p>
          Share the website, software problem or new project. The ASP.NET backend stores the enquiry
          so you can later connect email, CRM or ticketing.
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
        <button class="button" type="submit" [disabled]="sending || form.invalid">
          {{ sending ? 'Sending…' : 'Send enquiry' }}
        </button>
        @if (status) {
          <div
            class="alert"
            [class.alert-error]="hasError"
            [attr.role]="hasError ? 'alert' : 'status'"
          >
            {{ status }}
          </div>
        }
      </form>
      <aside class="card contact-aside">
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
  private readonly leads = inject(LeadService);
  private readonly route = inject(ActivatedRoute);
  protected model = {
    name: '',
    email: '',
    phone: '',
    website: '',
    message: '',
    source: this.route.snapshot.queryParamMap.get('source') ?? 'contact-page',
    honeypot: '',
  };
  protected sending = false;
  protected status = '';
  protected hasError = false;
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
  protected async submit(form: NgForm): Promise<void> {
    if (this.sending || form.invalid) return;
    this.sending = true;
    this.status = '';
    this.hasError = false;
    try {
      const r = await firstValueFrom(this.leads.submit(this.model));
      this.status = `Thanks — your enquiry was received. Reference: ${r.reference}`;
      form.resetForm({
        name: '',
        email: '',
        phone: '',
        website: '',
        message: '',
        source: this.model.source,
        honeypot: '',
      });
    } catch {
      this.hasError = true;
      this.status = 'The enquiry could not be sent. Please try again.';
    } finally {
      this.sending = false;
    }
  }
}
