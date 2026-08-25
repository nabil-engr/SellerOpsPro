import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
@Component({
  standalone: true,
  imports: [RouterLink],
  template: `<section class="page-hero">
      <div class="container narrow">
        <span class="eyebrow">Development & technical support</span>
        <h1>Build, fix and maintain business software.</h1>
        <p>
          Use SellerOps to attract online sellers, then help the businesses that need
          implementation, integration or ongoing technical support.
        </p>
        <div class="button-row">
          <a class="button" routerLink="/contact">Request a consultation</a>
        </div>
      </div>
    </section>
    <section class="section container">
      <div class="service-grid">
        <div class="card">
          <h2>ASP.NET + Angular</h2>
          <p>Dashboards, internal tools, APIs, ecommerce workflows and line-of-business systems.</p>
        </div>
        <div class="card">
          <h2>MERN Stack</h2>
          <p>Modern web applications, portals, ecommerce experiences and integrations.</p>
        </div>
        <div class="card">
          <h2>Laravel / PHP</h2>
          <p>Business systems, admin panels, APIs, maintenance and legacy improvements.</p>
        </div>
        <div class="card">
          <h2>Technical Support</h2>
          <p>
            Bug fixes, hosting/DNS/SSL help, deployments, performance troubleshooting and
            maintenance.
          </p>
        </div>
      </div>
    </section>
    <section class="section section-muted">
      <div class="container">
        <div class="section-heading">
          <div>
            <span class="eyebrow">Support model</span>
            <h2>From one-time fix to ongoing care</h2>
          </div>
        </div>
        <div class="pricing-grid">
          <div class="pricing-card card">
            <span class="pill">Entry</span>
            <h3>Essential Care</h3>
            <strong>From ৳3,000/mo</strong>
            <p>Small sites, health checks and tightly scoped minor support.</p>
          </div>
          <div class="pricing-card card featured">
            <span class="pill">Popular</span>
            <h3>Business Care</h3>
            <strong>From ৳5,000/mo</strong>
            <p>Backups, troubleshooting and business-site support.</p>
          </div>
          <div class="pricing-card card">
            <span class="pill">Growth</span>
            <h3>Professional Care</h3>
            <strong>From ৳7,000/mo</strong>
            <p>Ecommerce and growing sites with prioritized support.</p>
          </div>
          <div class="pricing-card card">
            <span class="pill">Priority</span>
            <h3>Custom Care</h3>
            <strong>From ৳9,000/mo</strong>
            <p>Complex applications, APIs and deeper operational support.</p>
          </div>
        </div>
        <p class="microcopy">
          Maintenance excludes major new features unless separately quoted. Requests can be
          submitted anytime; response windows depend on the agreed plan and support hours.
        </p>
      </div>
    </section>`,
})
export class ServicesComponent {
  private readonly seo = inject(SeoService);
  constructor() {
    const title = 'Web & Software Development Services | SellerOps';
    const description =
      'Custom ASP.NET and Angular development, MERN and Laravel software, bug fixing, website maintenance and technical support for online businesses.';
    this.seo.apply({
      title,
      description,
      path: '/services',
      jsonLd: [
        this.seo.pageSchema(title, description, '/services'),
        this.seo.breadcrumbs([
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
        ]),
      ],
    });
  }
}
