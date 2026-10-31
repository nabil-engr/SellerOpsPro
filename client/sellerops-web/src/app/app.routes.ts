import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'tools',
    loadComponent: () => import('./pages/tools/tools.component').then((m) => m.ToolsComponent),
  },
  {
    path: 'tools/:slug',
    loadComponent: () => import('./pages/tool/tool.component').then((m) => m.ToolComponent),
  },
  {
    path: 'categories/:slug',
    loadComponent: () =>
      import('./pages/category/category.component').then((m) => m.CategoryComponent),
  },
  {
    path: 'guides',
    loadComponent: () => import('./pages/guides/guides.component').then((m) => m.GuidesComponent),
  },
  {
    path: 'guides/:slug',
    loadComponent: () => import('./pages/guide/guide.component').then((m) => m.GuideComponent),
  },
  {
    path: 'services',
    loadComponent: () =>
      import('./pages/services/services.component').then((m) => m.ServicesComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact.component').then((m) => m.ContactComponent),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/legal/static-page.component').then((m) => m.StaticPageComponent),
    data: { page: 'about' },
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./pages/legal/static-page.component').then((m) => m.StaticPageComponent),
    data: { page: 'privacy' },
  },
  {
    path: 'terms',
    loadComponent: () =>
      import('./pages/legal/static-page.component').then((m) => m.StaticPageComponent),
    data: { page: 'terms' },
  },
  {
    path: 'affiliate-disclosure',
    loadComponent: () =>
      import('./pages/legal/static-page.component').then((m) => m.StaticPageComponent),
    data: { page: 'affiliate' },
  },
  {
    path: 'editorial-policy',
    loadComponent: () =>
      import('./pages/legal/static-page.component').then((m) => m.StaticPageComponent),
    data: { page: 'editorial' },
  },
  {
    path: '404',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
