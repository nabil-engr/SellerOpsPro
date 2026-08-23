import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToolDefinition } from '../../core/models/tool.model';
import { CATEGORY_MAP } from '../../core/data/tools.data';

@Component({
  selector: 'app-tool-directory',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: ` <div class="directory-toolbar">
      <label class="search-field"
        ><span>Search tools</span
        ><input
          type="search"
          [(ngModel)]="query"
          (ngModelChange)="filter()"
          placeholder="Try profit, ROAS, shipping, SEO..."
      /></label>
      <span class="result-count">{{ filtered.length }} tools</span>
    </div>
    <div class="tool-grid">
      @for (tool of filtered; track tool.slug) {
        <a class="tool-card card" [routerLink]="['/tools', tool.slug]">
          <span class="tool-category">{{ categoryLabel(tool.category) }}</span>
          <h3>{{ tool.name }}</h3>
          <p>{{ tool.description }}</p>
          <span class="text-link">Open tool <span aria-hidden="true">→</span></span>
        </a>
      } @empty {
        <div class="empty-state card">
          <h3>No tools match that search.</h3>
          <p>Try profit, inventory or SEO.</p>
        </div>
      }
    </div>`,
})
export class ToolDirectoryComponent implements OnChanges {
  @Input({ required: true }) tools: ToolDefinition[] = [];
  protected query = '';
  protected filtered: ToolDefinition[] = [];
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tools']) this.filter();
  }
  protected filter(): void {
    const needle = this.query.trim().toLowerCase();
    this.filtered = !needle
      ? [...this.tools]
      : this.tools.filter((t) =>
          `${t.name} ${t.description} ${t.category}`.toLowerCase().includes(needle),
        );
  }
  protected categoryLabel(slug: string): string {
    return CATEGORY_MAP.get(slug)?.name ?? slug;
  }
}
