import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-lead-cta',
  standalone: true,
  imports: [RouterLink],
  template: `<section class="lead-cta">
    <div>
      <span class="eyebrow">Need implementation help?</span>
      <h2>{{ title }}</h2>
      <p>{{ text }}</p>
    </div>
    <a class="button" [routerLink]="['/contact']" [queryParams]="{ source: source }"
      >Talk to our developers</a
    >
  </section>`,
})
export class LeadCtaComponent {
  @Input() source = 'tool';
  @Input() title = 'Turn the calculation into a working ecommerce system.';
  @Input() text =
    'We can build, fix or maintain custom web software, ecommerce workflows and internal business tools.';
}
