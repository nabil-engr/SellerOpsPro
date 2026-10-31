import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { CATEGORY_SLUGS, TOOL_SLUGS } from './core/data/tools.data';
import { GUIDE_SLUGS } from './core/data/guides.data';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'tools/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    async getPrerenderParams() {
      return TOOL_SLUGS.map((slug) => ({ slug }));
    },
  },
  {
    path: 'categories/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    async getPrerenderParams() {
      return CATEGORY_SLUGS.map((slug) => ({ slug }));
    },
  },
  {
    path: 'guides/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    async getPrerenderParams() {
      return GUIDE_SLUGS.map((slug) => ({ slug }));
    },
  },
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'tools', renderMode: RenderMode.Prerender },
  { path: 'guides', renderMode: RenderMode.Prerender },
  { path: 'services', renderMode: RenderMode.Prerender },
  { path: 'contact', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: 'privacy', renderMode: RenderMode.Prerender },
  { path: 'terms', renderMode: RenderMode.Prerender },
  { path: 'affiliate-disclosure', renderMode: RenderMode.Prerender },
  { path: 'editorial-policy', renderMode: RenderMode.Prerender },
  { path: '404', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];
