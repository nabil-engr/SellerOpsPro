import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

type PageKey = 'about' | 'privacy' | 'terms' | 'affiliate' | 'editorial';
interface StaticPage {
  title: string;
  eyebrow: string;
  description: string;
  path: string;
  sections: Array<{ heading: string; paragraphs: string[] }>;
}

const PAGES: Record<PageKey, StaticPage> = {
  about: {
    title: 'About SellerOps Toolkit',
    eyebrow: 'Why this site exists',
    description:
      'SellerOps Toolkit gives ecommerce sellers practical calculators, utilities and guides for everyday operating decisions.',
    path: '/about',
    sections: [
      {
        heading: 'Built around seller workflows',
        paragraphs: [
          'Instead of mixing unrelated calculators, SellerOps focuses on the connected decisions online sellers make: pricing, advertising, inventory, fulfillment, returns and store operations.',
          'The tools are designed to show their assumptions and formulas so a result can be checked rather than treated like a black box.',
        ],
      },
      {
        heading: 'Tools plus implementation help',
        paragraphs: [
          'Most calculators are free and do not require an account. Businesses that need a workflow turned into custom software can separately contact the development team.',
          'Affiliate recommendations, when enabled, are disclosed and kept separate from calculator results.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    eyebrow: 'Privacy',
    description:
      'How SellerOps Toolkit handles calculator data, contact enquiries, server audits and future analytics or advertising services.',
    path: '/privacy',
    sections: [
      {
        heading: 'Calculator data',
        paragraphs: [
          'Standard calculator inputs are processed in the browser and are not intentionally stored by the application. The image compressor also processes selected images locally in the browser.',
        ],
      },
      {
        heading: 'Contact enquiries',
        paragraphs: [
          'The contact form prepares a WhatsApp message on your device. Your enquiry is sent only when you choose to send it in WhatsApp. Direct email links open your configured email application.',
          'WhatsApp, Meta and your email provider process messages under their own privacy terms. Do not submit passwords, payment card data or other unnecessary sensitive information.',
        ],
      },
      {
        heading: 'Website audit',
        paragraphs: [
          'The website audit sends the public URL you enter to the backend so it can fetch a limited amount of public HTML and produce technical checks. Private and local network targets are blocked.',
        ],
      },
      {
        heading: 'Analytics, cookies and ads',
        paragraphs: [
          'SellerOps currently does not configure an advertising network or third-party analytics identifier. If those services are introduced, this policy and the consent experience should be updated to match the services and applicable jurisdictions.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of Use',
    eyebrow: 'Terms',
    description:
      'Terms governing the use of SellerOps calculators, guides, audit results and development enquiries.',
    path: '/terms',
    sections: [
      {
        heading: 'Planning tools, not professional advice',
        paragraphs: [
          'Calculator outputs are estimates based on the values entered. Platform fees, taxes, carrier rules, advertising attribution and business costs can differ from the assumptions used here.',
          'Use the tools for planning and verify important financial, legal, tax and operational decisions with the relevant source or qualified professional.',
        ],
      },
      {
        heading: 'Availability',
        paragraphs: [
          'The site may change, add or remove tools and may occasionally be unavailable. No guarantee is made that every external website can be audited or that every browser can process every image format.',
        ],
      },
      {
        heading: 'Development services',
        paragraphs: [
          'Submitting an enquiry does not create a service contract. Scope, price, timing, support windows and deliverables should be agreed separately before paid work begins.',
        ],
      },
    ],
  },
  affiliate: {
    title: 'Affiliate Disclosure',
    eyebrow: 'Transparency',
    description: 'How affiliate recommendations may financially support SellerOps Toolkit.',
    path: '/affiliate-disclosure',
    sections: [
      {
        heading: 'How affiliate links work',
        paragraphs: [
          'Some future links may be affiliate links. If you make an eligible purchase through one of those links, SellerOps may receive a commission without increasing the price you pay.',
          'An affiliate relationship should not change the mathematical output of a calculator. Affiliate placements are labelled and should be used only for products or services that fit the surrounding seller workflow.',
        ],
      },
      {
        heading: 'No fake endorsements',
        paragraphs: [
          'The starter intentionally contains no fabricated reviews, ratings, customer counts or affiliate tracking IDs. Add partner links only after approval and after reviewing the recommendation for relevance.',
        ],
      },
    ],
  },
  editorial: {
    title: 'Editorial & Tool Methodology Policy',
    eyebrow: 'Quality standards',
    description:
      'How SellerOps approaches formulas, examples, corrections, affiliate content and original seller guides.',
    path: '/editorial-policy',
    sections: [
      {
        heading: 'Transparent calculations',
        paragraphs: [
          'Each calculator should state the core formula or method and provide a worked example. Inputs that vary by marketplace, payment provider, courier or country should be entered by the user rather than presented as universal facts.',
        ],
      },
      {
        heading: 'Original and useful content',
        paragraphs: [
          'Guides should explain decisions that genuinely connect to the tools. Pages should not be created only to target minor keyword variations or to repeat the same text at scale.',
        ],
      },
      {
        heading: 'Corrections and updates',
        paragraphs: [
          'When a formula, description or guide is found to be wrong, it should be corrected. Time-sensitive platform fees and policies should be checked against primary sources before publication.',
        ],
      },
      {
        heading: 'Commercial relationships',
        paragraphs: [
          'Affiliate relationships and paid services must be disclosed clearly. Commercial incentives should not be presented as independent evidence that a product is better.',
        ],
      },
    ],
  },
};

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `@if (page) {
      <article>
        <header class="page-hero">
          <div class="container article-width">
            <span class="eyebrow">{{ page.eyebrow }}</span>
            <h1>{{ page.title }}</h1>
            <p>{{ page.description }}</p>
          </div>
        </header>
        <div class="section container article-width prose">
          @for (section of page.sections; track section.heading) {
            <section>
              <h2>{{ section.heading }}</h2>
              @for (p of section.paragraphs; track p) {
                <p>{{ p }}</p>
              }
            </section>
          }
          <p class="microcopy">
            Last reviewed August 25, 2026. <a routerLink="/contact">Contact SellerOps</a> to report
            a correction or ask a question.
          </p>
        </div>
      </article>
    } @else {
      <section class="page-hero">
        <div class="container narrow">
          <h1>Page not found</h1>
          <a routerLink="/">Go home →</a>
        </div>
      </section>
    }`,
})
export class StaticPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  protected readonly page = PAGES[(this.route.snapshot.data['page'] ?? 'about') as PageKey];
  constructor() {
    if (this.page) {
      const title = `${this.page.title} | SellerOps`;
      const type = this.page.path === '/about' ? 'AboutPage' : 'WebPage';
      this.seo.apply({
        title,
        description: this.page.description,
        path: this.page.path,
        jsonLd: [
          this.seo.pageSchema(title, this.page.description, this.page.path, type),
          this.seo.breadcrumbs([
            { name: 'Home', path: '/' },
            { name: this.page.title, path: this.page.path },
          ]),
        ],
      });
    }
  }
}
