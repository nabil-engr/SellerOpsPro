import { Component, inject } from '@angular/core';
import { TOOLS } from '../../core/data/tools.data';
import { SeoService } from '../../core/services/seo.service';
import { ToolDirectoryComponent } from '../../shared/tool-directory/tool-directory.component';
@Component({
  standalone: true,
  imports: [ToolDirectoryComponent],
  template: `<section class="page-hero">
      <div class="container narrow">
        <span class="eyebrow">Complete directory</span>
        <h1>Free ecommerce seller tools</h1>
        <p>
          Use calculators and utilities for profit, ads, inventory, fulfillment, returns and
          technical store operations.
        </p>
      </div>
    </section>
    <section class="section container">
      <app-tool-directory [tools]="tools" />
    </section>`,
})
export class ToolsComponent {
  private readonly seo = inject(SeoService);
  protected readonly tools = TOOLS;
  constructor() {
    const title = '47 Free Ecommerce Seller Tools — SellerOps Toolkit';
    const description =
      'Browse 47 free ecommerce seller calculators and utilities for profit, ROAS, CPA, inventory, shipping, returns, marketplace fees and SEO.';
    this.seo.apply({
      title,
      description,
      path: '/tools',
      jsonLd: [
        this.seo.pageSchema(title, description, '/tools', 'CollectionPage'),
        this.seo.itemList(
          this.tools.map((tool) => ({
            name: tool.name,
            path: `/tools/${tool.slug}`,
          })),
          'Free ecommerce seller tools',
        ),
        this.seo.breadcrumbs([
          { name: 'Home', path: '/' },
          { name: 'Tools', path: '/tools' },
        ]),
      ],
    });
  }
}
