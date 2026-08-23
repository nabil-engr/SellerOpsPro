import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
export interface BreadcrumbItem {
  label: string;
  path?: string;
}
@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [RouterLink],
  template: `<nav class="breadcrumbs" aria-label="Breadcrumb">
    <ol>
      @for (item of items; track item.label; let last = $last) {
        <li>
          @if (!last && item.path) {
            <a [routerLink]="item.path">{{ item.label }}</a
            ><span aria-hidden="true">/</span>
          } @else {
            <span aria-current="page">{{ item.label }}</span>
          }
        </li>
      }
    </ol>
  </nav>`,
})
export class BreadcrumbsComponent {
  @Input({ required: true }) items: BreadcrumbItem[] = [];
}
