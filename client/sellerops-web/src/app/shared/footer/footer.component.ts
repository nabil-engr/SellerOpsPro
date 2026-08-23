import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TOOL_CATEGORIES } from '../../core/data/tools.data';
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: ` <footer class="site-footer">
    <div class="container footer-grid">
      <div>
        <a routerLink="/" class="brand"
          ><span class="brand-mark">S</span><span>Seller<span>Ops</span></span></a
        >
        <p>Free ecommerce calculators, operating tools and practical guides for online sellers.</p>
      </div>
      <div>
        <h2>Tool categories</h2>
        @for (c of categories; track c.slug) {
          <a [routerLink]="['/categories', c.slug]">{{ c.name }}</a>
        }
      </div>
      <div>
        <h2>Company</h2>
        <a routerLink="/services">Development services</a><a routerLink="/about">About</a
        ><a routerLink="/contact">Contact</a><a routerLink="/editorial-policy">Editorial policy</a>
      </div>
      <div>
        <h2>Legal</h2>
        <a routerLink="/privacy">Privacy</a><a routerLink="/terms">Terms</a
        ><a routerLink="/affiliate-disclosure">Affiliate disclosure</a>
      </div>
    </div>
    <div class="container footer-bottom">
      <span>© {{ year }} SellerOps Toolkit.</span
      ><span>Planning tools are estimates, not tax, legal or financial advice.</span>
    </div>
  </footer>`,
})
export class FooterComponent {
  protected readonly categories = TOOL_CATEGORIES;
  protected readonly year = new Date().getFullYear();
}
