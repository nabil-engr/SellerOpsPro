import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

interface AuditCheck {
  key: string;
  label: string;
  passed: boolean;
  detail: string;
  weight: number;
}
interface AuditResult {
  url: string;
  httpStatus: number;
  responseTimeMs: number;
  score: number;
  title?: string;
  metaDescription?: string;
  checks: AuditCheck[];
}

@Component({
  selector: 'app-website-audit',
  standalone: true,
  imports: [FormsModule],
  template: `<section class="calculator card">
    <div class="calculator-header">
      <div>
        <span class="eyebrow">Safe public-page audit</span>
        <h2>Audit a website</h2>
      </div>
      <span class="pill">Server assisted</span>
    </div>
    <label class="field"
      ><span>Public website URL</span
      ><input
        type="url"
        inputmode="url"
        autocomplete="url"
        [(ngModel)]="url"
        placeholder="https://yourstore.com"
        (keyup.enter)="run()"
    /></label>
    <button
      class="button top-gap"
      type="button"
      (click)="run()"
      [disabled]="loading || !url.trim()"
    >
      {{ loading ? 'Checking…' : 'Run audit' }}
    </button>
    <p class="microcopy">
      Local/private network addresses are blocked. The audit fetches at most 1 MB of public HTML and
      does not execute page JavaScript.
    </p>
    @if (error) {
      <div class="alert alert-error" role="alert">{{ error }}</div>
    }
    @if (result) {
      <div class="audit-score">
        <div class="score-ring">
          <strong>{{ result.score }}</strong
          ><span>/100</span>
        </div>
        <div>
          <h3>{{ result.url }}</h3>
          <p>HTTP {{ result.httpStatus }} • {{ result.responseTimeMs }} ms</p>
        </div>
      </div>
      <div class="check-list">
        @for (c of result.checks; track c.key) {
          <div class="check-item" [class.pass]="c.passed">
            <span class="check-icon">{{ c.passed ? '✓' : '!' }}</span>
            <div>
              <strong>{{ c.label }}</strong>
              <p>{{ c.detail }}</p>
            </div>
            <span>{{ c.weight }} pts</span>
          </div>
        }
      </div>
    }
  </section>`,
})
export class WebsiteAuditComponent {
  private readonly http = inject(HttpClient);
  protected url = '';
  protected result?: AuditResult;
  protected loading = false;
  protected error = '';
  protected async run(): Promise<void> {
    if (!this.url.trim() || this.loading) return;
    this.loading = true;
    this.error = '';
    this.result = undefined;
    try {
      this.result = await firstValueFrom(
        this.http.post<AuditResult>('/api/site-audit', {
          url: this.url.trim(),
        }),
      );
    } catch (e: unknown) {
      const x = e as { error?: { error?: string }; message?: string };
      this.error = x.error?.error ?? x.message ?? 'Audit failed. Check the URL and try again.';
    } finally {
      this.loading = false;
    }
  }
}
