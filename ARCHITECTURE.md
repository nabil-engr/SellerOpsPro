# SellerOps architecture

## Request flow

1. Angular prerenders every public tool, category, guide and static page during the production build.
2. `build.ps1` or `build.sh` copies the generated browser files into the ASP.NET `wwwroot` directory.
3. ASP.NET serves hashed assets with long cache lifetimes and prerendered HTML with a short cache lifetime.
4. API requests remain server-side and receive rate limiting, validation, security headers and noindex headers.
5. Unknown website routes return the prerendered 404 page with an HTTP 404 status.

## Important directories

- `client/sellerops-web/src/app/core`: site configuration, data, models and reusable services.
- `client/sellerops-web/src/app/pages`: route-level Angular components.
- `client/sellerops-web/src/app/features`: specialized interactive tools.
- `server/SellerOps.Api/Services`: lead storage, sitemap generation and safe website auditing.
- `server/SellerOps.Api/Data/seo-routes.json`: canonical routes used by the sitemap.
- `scripts`: site configuration and build-output SEO validation.

## Add a calculator

1. Add a unique definition to `tools.data.ts`.
2. Add the calculation case to `CalculationService`.
3. Add the slug to `seo-routes.json`.
4. Run `npm run build:prod`; route and SEO mismatches fail the build.

The website-audit and image-compressor routes are specialized tools and do not use `CalculationService`.

## Add a guide

1. Add the guide content and valid related-tool slugs to `guides.data.ts`.
2. Add the guide slug to `seo-routes.json`.
3. Run the production build and SEO validator.

## SEO model

- Every indexable route has a unique title, description and canonical URL.
- Public pages are prerendered and contain crawlable anchor links.
- Page-specific JSON-LD describes visible content using WebPage, CollectionPage, ItemList, WebApplication, Article, Organization, WebSite and BreadcrumbList types where appropriate.
- Sitemap URLs and HTML canonicals share the same configured HTTPS origin.
- Duplicate trailing-slash and `index.html` URLs permanently redirect to their canonical form.
- API and error responses are explicitly marked noindex.
- `scripts/validate-seo.mjs` prevents common SEO regressions from reaching production.

## Configuration and release

Run the site configurator before the first production build:

```bash
node scripts/configure-site.mjs https://yourdomain.com hello@yourdomain.com "Your Brand"
```

Then run `build.ps1` on Windows or `build.sh` on Linux/macOS. Publish the generated `publish` directory from its own working directory, configure a real HTTPS endpoint or trusted reverse proxy, and provide persistent storage for `App_Data`.
