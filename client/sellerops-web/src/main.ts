import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { inject } from '@vercel/analytics';

if (typeof window !== 'undefined') {
  inject();
}

bootstrapApplication(AppComponent, appConfig).catch((error) => console.error(error));
