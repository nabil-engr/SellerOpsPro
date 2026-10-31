import { Component, Input } from '@angular/core';
import { SITE_CONFIG } from '../../core/site.config';
@Component({
  selector: 'app-affiliate-card',
  standalone: true,
  template: `<aside class="affiliate-card card" aria-label="Recommended seller resource">
    <span class="eyebrow">Recommended resource</span>
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    @if (url) {
      <a
        class="button button-secondary"
        [href]="url"
        target="_blank"
        rel="sponsored nofollow noopener"
        >View resource</a
      >
      <p class="microcopy">
        Affiliate link. We may earn a commission if you purchase through this link.
      </p>
    } @else {
      <span class="muted"
        >Affiliate slot is inactive until an approved partner link is configured.</span
      >
    }
  </aside>`,
})
export class AffiliateCardComponent {
  @Input() context: 'ecommerce' | 'hosting' | 'pod' | 'email' = 'ecommerce';
  protected get url(): string {
    switch (this.context) {
      case 'hosting':
        return SITE_CONFIG.affiliateLinks.hosting;
      case 'pod':
        return SITE_CONFIG.affiliateLinks.printOnDemand;
      case 'email':
        return SITE_CONFIG.affiliateLinks.emailMarketing;
      default:
        return SITE_CONFIG.affiliateLinks.ecommercePlatform;
    }
  }
  protected get title(): string {
    switch (this.context) {
      case 'hosting':
        return 'Need a fast store or hosting setup?';
      case 'pod':
        return 'Comparing print-on-demand providers?';
      case 'email':
        return 'Building an email growth stack?';
      default:
        return 'Building or upgrading your online store?';
    }
  }
  protected get description(): string {
    switch (this.context) {
      case 'hosting':
        return 'Add an approved hosting or performance partner here later.';
      case 'pod':
        return 'Use a POD partner you have genuinely reviewed.';
      case 'email':
        return 'Use an email platform recommendation that matches this workflow.';
      default:
        return 'Use an ecommerce platform recommendation that genuinely fits the seller workflow.';
    }
  }
}
