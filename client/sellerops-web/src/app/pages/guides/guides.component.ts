import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GUIDES } from '../../core/data/guides.data';
import { CATEGORY_MAP } from '../../core/data/tools.data';
import { SeoService } from '../../core/services/seo.service';
@Component({
  standalone: true,
  imports: [RouterLink],
  template: `<section class="page-hero">
      <div class="container narrow">
        <span class="eyebrow">Original seller education</span>
        <h1>Ecommerce operating guides</h1>
        <p>
          Short, practical explanations that connect calculator outputs with real seller decisions.
        </p>
      </div>
    </section>
    <section class="section container">
      <div class="guide-grid">
        @for (g of guides; track g.slug) {
          <article class="guide-card card">
            <span class="tool-category">{{ categoryName(g.category) }}</span>
            <h2>
              <a [routerLink]="['/guides', g.slug]">{{ g.title }}</a>
            </h2>
            <p>{{ g.description }}</p>
            <a class="text-link" [routerLink]="['/guides', g.slug]">Read guide →</a>
          </article>
        }
      </div>
    </section>`,
})
export class GuidesComponent {
  private readonly seo = inject(SeoService);
  protected readonly guides = GUIDES;
  constructor() {
    const title = 'Ecommerce Seller Guides — Profit, Ads, Inventory & SEO | SellerOps';
    const description =
      'Practical ecommerce guides covering profit margin, break-even ROAS, reorder points, COD losses, dimensional weight, UTM tracking and technical SEO.';
    this.seo.apply({
      title,
      description,
      path: '/guides',
      jsonLd: [
        this.seo.pageSchema(title, description, '/guides', 'CollectionPage'),
        this.seo.itemList(
          this.guides.map((guide) => ({
            name: guide.title,
            path: `/guides/${guide.slug}`,
          })),
          'Ecommerce operating guides',
        ),
        this.seo.breadcrumbs([
          { name: 'Home', path: '/' },
          { name: 'Guides', path: '/guides' },
        ]),
      ],
    });
  }
  protected categoryName(slug: string): string {
    return CATEGORY_MAP.get(slug)?.name ?? slug;
  }
}
