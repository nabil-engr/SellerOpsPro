import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
@Component({
  standalone: true,
  imports: [RouterLink],
  template: `<section class="page-hero">
    <div class="container narrow center">
      <span class="error-code">404</span>
      <h1>That page is not in the toolkit.</h1>
      <p>The URL may have changed, or the tool may not exist.</p>
      <div class="button-row centered">
        <a class="button" routerLink="/tools">Browse tools</a
        ><a class="button button-secondary" routerLink="/">Go home</a>
      </div>
    </div>
  </section>`,
})
export class NotFoundComponent {
  private readonly seo = inject(SeoService);
  constructor() {
    this.seo.apply({
      title: 'Page Not Found | SellerOps Toolkit',
      description: 'The requested page could not be found.',
      path: '/404',
      noindex: true,
    });
  }
}
