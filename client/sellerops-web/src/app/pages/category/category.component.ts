import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CATEGORY_MAP, TOOLS } from '../../core/data/tools.data';
import { GUIDES } from '../../core/data/guides.data';
import { GuideDefinition } from '../../core/models/guide.model';
import { ToolCategory, ToolDefinition } from '../../core/models/tool.model';
import { SeoService } from '../../core/services/seo.service';
import { ToolDirectoryComponent } from '../../shared/tool-directory/tool-directory.component';
import { BreadcrumbsComponent } from '../../shared/breadcrumbs/breadcrumbs.component';

@Component({
  standalone: true,
  imports: [RouterLink, ToolDirectoryComponent, BreadcrumbsComponent],
  template: `@if (category) {
      <section class="page-hero">
        <div class="container narrow">
          <app-breadcrumbs
            [items]="[
              { label: 'Home', path: '/' },
              { label: 'Tools', path: '/tools' },
              { label: category.name },
            ]"
          />
          <span class="eyebrow">Seller workflow</span>
          <h1>{{ category.name }}</h1>
          <p>{{ category.description }}</p>
        </div>
      </section>
      <section class="section container">
        <app-tool-directory [tools]="tools" />
      </section>
      @if (guides.length) {
        <section class="section section-muted">
          <div class="container">
            <div class="section-heading">
              <div>
                <span class="eyebrow">Learn the decisions</span>
                <h2>{{ category.name }} guides</h2>
              </div>
              <a class="text-link" routerLink="/guides">All guides →</a>
            </div>
            <div class="guide-grid">
              @for (guide of guides; track guide.slug) {
                <article class="guide-card card">
                  <h3>
                    <a [routerLink]="['/guides', guide.slug]">{{ guide.title }}</a>
                  </h3>
                  <p>{{ guide.description }}</p>
                  <a class="text-link" [routerLink]="['/guides', guide.slug]">Read guide →</a>
                </article>
              }
            </div>
          </div>
        </section>
      }
    } @else {
      <section class="page-hero">
        <div class="container narrow">
          <h1>Category not found</h1>
          <a routerLink="/tools">Browse tools →</a>
        </div>
      </section>
    }`,
})
export class CategoryComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  protected category?: ToolCategory;
  protected tools: ToolDefinition[] = [];
  protected guides: GuideDefinition[] = [];

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe((params) => this.loadCategory(params.get('slug') ?? ''));
  }

  private loadCategory(slug: string): void {
    this.category = CATEGORY_MAP.get(slug);
    this.tools = this.category ? TOOLS.filter((tool) => tool.category === this.category!.slug) : [];
    this.guides = this.category
      ? GUIDES.filter((guide) => guide.category === this.category!.slug)
      : [];
    if (!this.category) {
      this.seo.apply({
        title: 'Category Not Found | SellerOps',
        description: 'The requested seller tool category could not be found.',
        path: `/categories/${slug}`,
        noindex: true,
      });
      return;
    }
    const title = `${this.category.name} Tools for Ecommerce Sellers | SellerOps`;
    const description = `${this.category.description} Browse ${this.tools.length} free tools in this seller workflow.`;
    this.seo.apply({
      title,
      description,
      path: `/categories/${this.category.slug}`,
      jsonLd: [
        this.seo.pageSchema(
          title,
          description,
          `/categories/${this.category.slug}`,
          'CollectionPage',
        ),
        this.seo.itemList(
          this.tools.map((tool) => ({
            name: tool.name,
            path: `/tools/${tool.slug}`,
          })),
          `${this.category.name} tools`,
        ),
        this.seo.breadcrumbs([
          { name: 'Home', path: '/' },
          { name: 'Tools', path: '/tools' },
          {
            name: this.category.name,
            path: `/categories/${this.category.slug}`,
          },
        ]),
      ],
    });
  }
}
