import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: ` <a class="skip-link" href="#main-content">Skip to content</a>
    <header class="site-header">
      <div class="container nav-shell">
        <a routerLink="/" class="brand" aria-label="SellerOps home"
          ><span class="brand-mark">S</span><span>Seller<span>Ops</span></span></a
        >
        <nav class="desktop-nav" aria-label="Primary navigation">
          <a routerLink="/tools" routerLinkActive="active">Tools</a>
          <a routerLink="/guides" routerLinkActive="active">Guides</a>
          <a routerLink="/services" routerLinkActive="active">Services</a>
          <a routerLink="/about" routerLinkActive="active">About</a>
        </nav>
        <div class="nav-actions">
          <a class="button button-sm desktop-help" routerLink="/contact">Get help</a>
          <details #menu class="mobile-menu">
            <summary>Menu</summary>
            <nav aria-label="Mobile navigation">
              <a routerLink="/tools" (click)="menu.open = false">Tools</a
              ><a routerLink="/guides" (click)="menu.open = false">Guides</a
              ><a routerLink="/services" (click)="menu.open = false">Services</a
              ><a routerLink="/about" (click)="menu.open = false">About</a
              ><a routerLink="/contact" (click)="menu.open = false">Get help</a>
            </nav>
          </details>
        </div>
      </div>
    </header>`,
})
export class HeaderComponent {}
