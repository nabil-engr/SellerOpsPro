import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TOOL_CATEGORIES, TOOLS } from '../../core/data/tools.data';
import { GUIDES } from '../../core/data/guides.data';
import { SeoService } from '../../core/services/seo.service';
import { ToolDirectoryComponent } from '../../shared/tool-directory/tool-directory.component';
import { LeadCtaComponent } from '../../shared/lead-cta/lead-cta.component';

@Component({
  standalone: true,
  imports: [RouterLink, ToolDirectoryComponent, LeadCtaComponent],
  template: ` <section class="hero">
      <div class="container hero-grid">
        <div>
          <span class="eyebrow">47 seller tools • no signup for calculators</span>
          <h1>Run your online store with numbers, not guesses.</h1>
          <p class="hero-copy">
            Free ecommerce calculators and practical utilities for pricing, ads, inventory,
            shipping, returns and store SEO.
          </p>
          <div class="button-row">
            <a class="button" routerLink="/tools">Explore all tools</a
            ><a class="button button-secondary" routerLink="/guides">Read seller guides</a>
          </div>
          <div class="trust-row">
            <span>✓ Fast</span><span>✓ Mobile friendly</span><span>✓ Transparent formulas</span
            ><span>✓ SEO-first architecture</span>
          </div>
        </div>
        <aside class="hero-panel card">
          <span class="eyebrow">SellerOps snapshot</span>
          <div class="stat">
            <strong>{{ tools.length }}</strong
            ><span>free tools</span>
          </div>
          <div class="stat">
            <strong>{{ categories.length }}</strong
            ><span>related categories</span>
          </div>
          <div class="stat">
            <strong>{{ guides.length }}</strong
            ><span>original guides</span>
          </div>
          <p>No fake ratings, no fake affiliate links, no forced account wall.</p>
        </aside>
      </div>
    </section>

    <section class="section container">
      <div class="section-heading">
        <div>
          <span class="eyebrow">One audience, many recurring needs</span>
          <h2>Choose a seller workflow</h2>
        </div>
      </div>
      <div class="category-grid">
        @for (c of categories; track c.slug) {
          <a class="category-card card" [routerLink]="['/categories', c.slug]"
            ><h3>{{ c.name }}</h3>
            <p>{{ c.description }}</p>
            <strong>{{ countFor(c.slug) }} tools →</strong></a
          >
        }
      </div>
    </section>

    <section class="section section-muted">
      <div class="container">
        <div class="section-heading">
          <div>
            <span class="eyebrow">Tool directory</span>
            <h2>Calculate the next decision</h2>
          </div>
          <a class="text-link" routerLink="/tools">View all tools →</a>
        </div>
        <app-tool-directory [tools]="featuredTools" />
      </div>
    </section>

    <section class="section container">
      <div class="section-heading">
        <div>
          <span class="eyebrow">Original content layer</span>
          <h2>Guides that explain the numbers</h2>
        </div>
        <a class="text-link" routerLink="/guides">All guides →</a>
      </div>
      <div class="guide-grid">
        @for (g of guides.slice(0, 6); track g.slug) {
          <article class="guide-card card">
            <span class="tool-category">{{ categoryName(g.category) }}</span>
            <h3>
              <a [routerLink]="['/guides', g.slug]">{{ g.title }}</a>
            </h3>
            <p>{{ g.description }}</p>
            <a class="text-link" [routerLink]="['/guides', g.slug]">Read guide →</a>
          </article>
        }
      </div>
    </section>

    <section class="section container">
      <app-lead-cta
        source="homepage"
        title="Need a store, custom dashboard or software fix?"
        text="SellerOps can also generate leads for your ASP.NET, Angular, MERN and Laravel development services."
      />
    </section>`,
})
export class HomeComponent {
  private readonly seo = inject(SeoService);
  protected readonly tools = TOOLS;
  protected readonly categories = TOOL_CATEGORIES;
  protected readonly guides = GUIDES;
  protected readonly featuredTools = TOOLS.slice(0, 15);
  constructor() {
    const title = 'SellerOps Toolkit — Free Ecommerce Calculators & Seller Tools';
    const description =
      'Free ecommerce calculators for profit, ROAS, pricing, inventory, shipping, COD returns, marketplace fees, SEO and store operations.';
    this.seo.apply({
      title,
      description,
      path: '/',
      jsonLd: [
        this.seo.websiteSchema(),
        this.seo.organizationSchema(),
        this.seo.pageSchema(title, description, '/'),
        this.seo.itemList(
          this.categories.map((c) => ({
            name: c.name,
            path: `/categories/${c.slug}`,
          })),
          'Ecommerce seller workflows',
        ),
        this.seo.itemList(
          this.featuredTools.map((t) => ({
            name: t.name,
            path: `/tools/${t.slug}`,
          })),
          'Featured ecommerce seller tools',
        ),
      ],
    });
  }
  protected countFor(cat: string): number {
    return this.tools.filter((t) => t.category === cat).length;
  }
  protected categoryName(slug: string): string {
    return this.categories.find((c) => c.slug === slug)?.name ?? slug;
  }
}
