import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GUIDE_MAP, GUIDES } from '../../core/data/guides.data';
import { GuideDefinition } from '../../core/models/guide.model';
import { CATEGORY_MAP, TOOL_MAP } from '../../core/data/tools.data';
import { ToolDefinition } from '../../core/models/tool.model';
import { SeoService } from '../../core/services/seo.service';
import { BreadcrumbsComponent } from '../../shared/breadcrumbs/breadcrumbs.component';
import { LeadCtaComponent } from '../../shared/lead-cta/lead-cta.component';

@Component({
  standalone: true,
  imports: [RouterLink, BreadcrumbsComponent, LeadCtaComponent],
  template: `@if (guide) {
      <article>
        <header class="page-hero">
          <div class="container article-width">
            <app-breadcrumbs
              [items]="[
                { label: 'Home', path: '/' },
                { label: 'Guides', path: '/guides' },
                { label: guide.title },
              ]"
            /><span class="eyebrow">{{ categoryName }}</span>
            <h1>{{ guide.title }}</h1>
            <p>{{ guide.description }}</p>
            <p class="article-meta">Published August 23, 2026 · {{ wordCount }} words</p>
          </div>
        </header>
        <div class="section container article-width prose">
          @for (s of guide.sections; track s.heading) {
            <section>
              <h2>{{ s.heading }}</h2>
              @for (p of s.paragraphs; track p) {
                <p>{{ p }}</p>
              }
            </section>
          }
          <section class="related-box card">
            <span class="eyebrow">Use the tools</span>
            <h2>Related calculators and utilities</h2>
            @for (t of relatedTools; track t.slug) {
              <a [routerLink]="['/tools', t.slug]">{{ t.name }} →</a>
            }
          </section>
          @if (relatedGuides.length) {
            <section class="related-box card">
              <span class="eyebrow">Continue learning</span>
              <h2>Related ecommerce guides</h2>
              @for (related of relatedGuides; track related.slug) {
                <a [routerLink]="['/guides', related.slug]">{{ related.title }} →</a>
              }
            </section>
          }
          <app-lead-cta [source]="'guide-' + guide.slug" />
        </div>
      </article>
    } @else {
      <section class="page-hero">
        <div class="container narrow">
          <h1>Guide not found</h1>
          <a routerLink="/guides">Browse guides →</a>
        </div>
      </section>
    }`,
})
export class GuideComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  protected guide?: GuideDefinition;
  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe((params) => this.loadGuide(params.get('slug') ?? ''));
  }
  private loadGuide(slug: string): void {
    this.guide = GUIDE_MAP.get(slug);
    if (!this.guide) {
      this.seo.apply({
        title: 'Guide Not Found | SellerOps',
        description: 'The requested ecommerce guide could not be found.',
        path: `/guides/${slug}`,
        noindex: true,
      });
      return;
    }
    const path = `/guides/${this.guide.slug}`;
    const title = `${this.guide.title} | SellerOps`;
    const article = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${this.seo.absolute(path)}#article`,
      headline: this.guide.title,
      description: this.guide.description,
      image: this.seo.absolute('/assets/og-default.png'),
      datePublished: '2026-08-23',
      dateModified: '2026-08-23',
      wordCount: this.wordCount,
      inLanguage: 'en',
      mainEntityOfPage: { '@id': `${this.seo.absolute(path)}#webpage` },
      author: { '@id': `${this.seo.absolute('/')}#organization` },
      publisher: { '@id': `${this.seo.absolute('/')}#organization` },
    };
    this.seo.apply({
      title,
      description: this.guide.description,
      path,
      type: 'article',
      imageAlt: this.guide.title,
      jsonLd: [
        article,
        this.seo.pageSchema(title, this.guide.description, path),
        this.seo.breadcrumbs([
          { name: 'Home', path: '/' },
          { name: 'Guides', path: '/guides' },
          { name: this.guide.title, path },
        ]),
      ],
    });
  }
  protected get categoryName(): string {
    return CATEGORY_MAP.get(this.guide?.category ?? '')?.name ?? 'Seller guide';
  }
  protected get relatedTools(): ToolDefinition[] {
    return (
      this.guide?.related.map((s) => TOOL_MAP.get(s)).filter((t): t is ToolDefinition => !!t) ?? []
    );
  }
  protected get relatedGuides(): GuideDefinition[] {
    return this.guide
      ? GUIDES.filter(
          (guide) => guide.category === this.guide!.category && guide.slug !== this.guide!.slug,
        ).slice(0, 3)
      : [];
  }
  protected get wordCount(): number {
    if (!this.guide) return 0;
    return [
      this.guide.title,
      this.guide.description,
      ...this.guide.sections.flatMap((section) => [section.heading, ...section.paragraphs]),
    ]
      .join(' ')
      .trim()
      .split(/\s+/).length;
  }
}
