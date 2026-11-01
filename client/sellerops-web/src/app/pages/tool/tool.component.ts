import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CATEGORY_MAP, TOOL_MAP, TOOLS } from '../../core/data/tools.data';
import { GUIDES } from '../../core/data/guides.data';
import { GuideDefinition } from '../../core/models/guide.model';
import { CalculatorResult, ToolDefinition } from '../../core/models/tool.model';
import { CalculationService } from '../../core/services/calculation.service';
import { SeoService } from '../../core/services/seo.service';
import { BreadcrumbsComponent } from '../../shared/breadcrumbs/breadcrumbs.component';
import { AffiliateCardComponent } from '../../shared/affiliate-card/affiliate-card.component';
import { LeadCtaComponent } from '../../shared/lead-cta/lead-cta.component';
import { WebsiteAuditComponent } from '../../features/website-audit/website-audit.component';
import { ImageCompressorComponent } from '../../features/image-compressor/image-compressor.component';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    BreadcrumbsComponent,
    AffiliateCardComponent,
    LeadCtaComponent,
    WebsiteAuditComponent,
    ImageCompressorComponent,
  ],
  template: `@if (tool) {
      <section class="page-hero tool-hero">
        <div class="container">
          <app-breadcrumbs
            [items]="[
              { label: 'Home', path: '/' },
              { label: 'Tools', path: '/tools' },
              { label: tool.name },
            ]"
          />
          <div class="tool-hero-grid">
            <div class="narrow">
              <span class="eyebrow">{{ categoryName }}</span>
              <h1>{{ tool.name }}</h1>
              <p>{{ tool.description }}</p>
              <div class="trust-row">
                <span>Free</span><span>No calculator signup</span><span>Transparent method</span>
              </div>
            </div>
            <div class="formula-card card">
              <span class="eyebrow">How it works</span>
              <p>{{ tool.formula }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="section container tool-layout">
        <div>
          @if (tool.kind === 'audit') {
            <app-website-audit />
          } @else if (tool.kind === 'image') {
            <app-image-compressor />
          } @else {
            <section class="calculator card">
              <div class="calculator-header">
                <div>
                  <span class="eyebrow">Interactive calculator</span>
                  <h2>Enter your values</h2>
                </div>
                <button class="text-button" type="button" (click)="reset()">Reset</button>
              </div>
              <div class="field-grid">
                @for (field of tool.fields; track field.id) {
                  <label class="field"
                    ><span>{{ field.label }}</span>
                    <div class="input-wrap">
                      @if (field.prefix) {
                        <span>{{ field.prefix }}</span>
                      }
                      <input
                        [type]="field.type"
                        [(ngModel)]="values[field.id]"
                        (ngModelChange)="recalculate()"
                        [attr.inputmode]="field.type === 'number' ? 'decimal' : null"
                        [attr.min]="field.min ?? null"
                        [attr.step]="field.step ?? 'any'"
                      />
                      @if (field.suffix) {
                        <span>{{ field.suffix }}</span>
                      }
                    </div></label
                  >
                }
              </div>
              @if (result) {
                <div class="result-panel" aria-live="polite">
                  <span class="eyebrow">Result</span>
                  <h2>{{ result.headline }}</h2>
                  <div class="metric-grid">
                    @for (metric of result.metrics; track metric.label) {
                      <div class="metric">
                        <span>{{ metric.label }}</span
                        ><strong>{{ metric.value }}</strong>
                      </div>
                    }
                  </div>
                  @if (result.primaryCopy) {
                    <button
                      class="button button-secondary"
                      type="button"
                      (click)="copy(result.primaryCopy)"
                    >
                      Copy result
                    </button>
                  }
                  @if (copyMessage) {
                    <span class="copy-message">{{ copyMessage }}</span>
                  }
                  @if (result.note) {
                    <p class="result-note">{{ result.note }}</p>
                  }
                </div>
              }
            </section>
          }

          <article class="content-card">
            <span class="eyebrow">Seller guide</span>
            <h2>How to use {{ tool.name }}</h2>
            <p>{{ tool.example }}</p>
            <p>{{ tool.formula }}</p>
            <p>
              Use real costs, rates and operating assumptions from your business. Recalculate when
              pricing, platform fees, shipping or campaign economics change.
            </p>
            <h2>Frequently asked questions</h2>
            <div class="faq-list">
              @for (faq of tool.faqs; track faq.question) {
                <details>
                  <summary>{{ faq.question }}</summary>
                  <p>{{ faq.answer }}</p>
                </details>
              }
            </div>
          </article>

          <app-lead-cta
            [source]="'tool-' + tool.slug"
            title="Want this workflow built into your real store or software?"
            text="We can turn seller workflows into custom ASP.NET, Angular, MERN or Laravel systems and provide ongoing technical support."
          />
        </div>
        <aside class="tool-sidebar">
          <app-affiliate-card [context]="tool.affiliate" />
          <div class="card sidebar-card">
            <span class="eyebrow">Related tools</span>
            <h2>Keep calculating</h2>
            @for (related of relatedTools; track related.slug) {
              <a [routerLink]="['/tools', related.slug]">{{ related.name }} →</a>
            }
          </div>
          @if (relatedGuides.length) {
            <div class="card sidebar-card">
              <span class="eyebrow">Learn the workflow</span>
              <h2>Related seller guides</h2>
              @for (guide of relatedGuides; track guide.slug) {
                <a [routerLink]="['/guides', guide.slug]">{{ guide.title }} →</a>
              }
            </div>
          }
        </aside>
      </section>
    } @else {
      <section class="page-hero">
        <div class="container narrow">
          <h1>Tool not found</h1>
          <a routerLink="/tools">Browse all tools →</a>
        </div>
      </section>
    }`,
})
export class ToolComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly calculator = inject(CalculationService);
  private readonly seo = inject(SeoService);
  private readonly destroyRef = inject(DestroyRef);
  private copyTimer?: ReturnType<typeof setTimeout>;
  protected tool?: ToolDefinition;
  protected values: Record<string, number | string> = {};
  protected result?: CalculatorResult;
  protected copyMessage = '';

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.copyTimer) clearTimeout(this.copyTimer);
    });
    this.route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe((params) => this.loadTool(params.get('slug') ?? ''));
  }
  private loadTool(slug: string): void {
    const tool = TOOL_MAP.get(slug);
    this.tool = tool;
    this.result = undefined;
    this.values = {};
    this.copyMessage = '';
    if (!tool) {
      this.seo.apply({
        title: 'Tool Not Found — SellerOps Toolkit',
        description: 'The requested seller tool could not be found.',
        path: `/tools/${slug}`,
        noindex: true,
      });
      return;
    }
    this.reset();
    const path = `/tools/${tool.slug}`;
    const title = `${tool.name} — Free Seller Tool | SellerOps`;
    const category = CATEGORY_MAP.get(tool.category);
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${this.seo.absolute(path)}#faq`,
      mainEntity: tool.faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    };
    const appSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      '@id': `${this.seo.absolute(path)}#application`,
      name: tool.name,
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'Ecommerce seller tool',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript in a modern web browser',
      description: tool.description,
      url: this.seo.absolute(path),
      isAccessibleForFree: true,
      creator: { '@id': `${this.seo.absolute('/')}#organization` },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    };
    this.seo.apply({
      title,
      description: tool.description,
      path,
      keywords: tool.keywords,
      imageAlt: `${tool.name} calculator and ecommerce seller tool`,
      jsonLd: [
        appSchema,
        faqSchema,
        this.seo.pageSchema(title, tool.description, path),
        this.seo.breadcrumbs([
          { name: 'Home', path: '/' },
          { name: 'Tools', path: '/tools' },
          {
            name: category?.name ?? 'Category',
            path: `/categories/${tool.category}`,
          },
          { name: tool.name, path },
        ]),
      ],
    });
  }
  protected get categoryName(): string {
    return CATEGORY_MAP.get(this.tool?.category ?? '')?.name ?? 'Seller tool';
  }
  protected get relatedTools(): ToolDefinition[] {
    return this.tool
      ? TOOLS.filter((t) => t.category === this.tool!.category && t.slug !== this.tool!.slug).slice(
          0,
          6,
        )
      : [];
  }
  protected get relatedGuides(): GuideDefinition[] {
    return this.tool
      ? GUIDES.filter((guide) => guide.category === this.tool!.category).slice(0, 3)
      : [];
  }
  protected reset(): void {
    if (!this.tool) return;
    this.values = Object.fromEntries(this.tool.fields.map((f) => [f.id, f.defaultValue]));
    this.recalculate();
  }
  protected recalculate(): void {
    if (this.tool?.kind === 'calculator')
      this.result = this.calculator.calculate(this.tool, this.values);
  }
  protected async copy(value: string): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      this.copyMessage = 'Copy is not supported in this browser.';
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      this.copyMessage = 'Copied to clipboard.';
    } catch {
      this.copyMessage = 'Could not copy. Select the result and copy it manually.';
    }
    if (this.copyTimer) clearTimeout(this.copyTimer);
    this.copyTimer = setTimeout(() => (this.copyMessage = ''), 2500);
  }
}
