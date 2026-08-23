# SellerOps Toolkit

A production-oriented ecommerce micro-tools platform built with **ASP.NET Core 8 Web API + Angular 21 LTS**. The site is designed around one audience—online sellers—so calculators, guides, affiliate placements and development-service lead generation reinforce the same topical niche.

## What is included

- 47 seller calculators and utilities across profit/pricing, ads/growth, inventory/operations, shipping/returns, and store/SEO.
- 10 original seller guides with internal links to related tools.
- Angular build-time prerendering (SSG) for indexable HTML routes.
- Unique title, meta description, canonical URL, Open Graph, Twitter Card and JSON-LD per important route.
- WebSite, Organization, BreadcrumbList, WebApplication, FAQPage and Article structured data where the visible page content supports it.
- Dynamic `/sitemap.xml` and `/robots.txt` from ASP.NET Core.
- Public website audit with SSRF defenses, redirect validation, DNS/IP validation at connection time, request timeout, standard-port restriction and 1 MB body limit.
- Browser-only product image compressor (WebP/JPEG) so selected images are not uploaded by the compressor.
- Contact/lead API with DataAnnotations validation, fixed-window rate limiting and honeypot spam filtering.
- Security headers, CSP, HSTS/HTTPS in production, long-lived cache headers for hashed/static assets and short cache for HTML.
- Responsive custom UI with no external font or UI-framework dependency.
- Affiliate-ready components that stay inactive until approved partner URLs are configured.
- Service pages for ASP.NET/Angular, MERN, Laravel and ongoing technical support.

## Technology

- Backend: ASP.NET Core 8 Minimal API (`net8.0`)
- Frontend: Angular 21.2.x, standalone components
- Rendering: Angular prerender/static output
- Styling: custom responsive CSS
- Storage in this starter: NDJSON lead file under `App_Data`

> .NET 8 is used because this project was specifically requested on .NET 8. For a long-lived production deployment, plan an upgrade to .NET 10 because .NET 8 reaches end of support in November 2026.

## Tool catalog

### Profit & Pricing
Profit & Margin, Markup Price, Break-even Price, Ecommerce Profit, Discount & Sale Price, Bundle Pricing, Wholesale Pricing, Free Shipping Threshold, Commission, Sales Tax arithmetic, Print-on-Demand Profit, Dropshipping Profit.

### Ads & Growth
Break-even ROAS, ROAS, CPA, CPC, Conversion Rate, Average Order Value, Customer LTV, Ad Profit, Sales Goal, Email ROI.

### Inventory & Operations
Reorder Point, Safety Stock, Inventory Days, Inventory Turnover, Stockout Cost, SKU Generator, Order Capacity.

### Shipping & Returns
Dimensional Weight, Shipping Profit, COD Return Loss, Return Rate, Refund Loss, Fulfillment Cost, Shipping Surcharge.

### Store & SEO
Marketplace Fee, Payment Fee, UTM Builder, URL Slug Generator, Meta Title Checker, Meta Description Checker, SERP Preview, Safe Website Audit, Image Compressor, Word Counter, Aspect Ratio.

## Local development

### Prerequisites

- .NET 8 SDK
- Node.js compatible with Angular 21 (Node 20.19+, 22.12+, or a supported 24.x release)
- npm

### 1. Configure the site identity

Before production, replace the placeholder domain and email:

```bash
node scripts/configure-site.mjs https://yourdomain.com hello@yourdomain.com "Your Brand Name"
```

This updates the frontend canonical/OG base URL and ASP.NET sitemap/robots base URL.

### 2. Run the API

```bash
cd server/SellerOps.Api
dotnet restore
dotnet run --launch-profile https
```

Development API: `https://localhost:7174`

### 3. Run Angular

In a second terminal:

```bash
cd client/sellerops-web
npm install
npm start
```

The Angular dev server proxies `/api`, `/sitemap.xml` and `/robots.txt` to ASP.NET.

## Production build

Windows PowerShell:

```powershell
./build.ps1
```

Linux/macOS:

```bash
./build.sh
```

The scripts:

1. install Angular dependencies,
2. build and prerender all known static routes,
3. validate canonical tags, metadata, structured data, route coverage and internal links,
4. copy the Angular browser output into ASP.NET `wwwroot`,
5. publish ASP.NET into `/publish`.

Run the published application with a production `ASPNETCORE_ENVIRONMENT`, HTTPS/reverse proxy, writable `App_Data` location, and your final site settings.

## SEO implementation

The codebase includes the major technical foundations rather than promising rankings:

- one stable URL per calculator, category and guide;
- build-time rendered HTML for search crawlers;
- descriptive per-page titles and descriptions;
- canonical links generated from a single site URL;
- crawlable Angular router links;
- dynamic sitemap containing only canonical indexable routes;
- robots file that allows public pages and blocks `/api/`;
- breadcrumbs in UI and structured data;
- JSON-LD only when it matches visible content;
- original tool examples, formulas and FAQs;
- guide-to-tool and tool-to-tool internal linking;
- mobile responsive semantic pages;
- no fake reviews, ratings, testimonials, partner IDs or keyword-variant doorway pages;
- optimized default social-share image and web manifest.

### Important SEO launch actions

Technical SEO cannot guarantee Google ranking or AdSense approval. Before launch:

1. Run `configure-site.mjs` with the real HTTPS domain.
2. Create Google Search Console and submit `/sitemap.xml`.
3. Test important prerendered URLs with URL Inspection after deployment.
4. Add more genuinely useful examples/screenshots/data to pages that receive impressions but low engagement.
5. Keep marketplace/carrier/platform fee information current and source time-sensitive facts from primary sources.
6. Add analytics and ad code only after updating privacy/consent implementation for the countries you serve.
7. Use real affiliate links only after partner approval and retain clear disclosure.

## Affiliate setup

Edit:

`client/sellerops-web/src/app/core/site.config.ts`

and insert only approved URLs into:

- `ecommercePlatform`
- `hosting`
- `printOnDemand`
- `emailMarketing`

Empty values intentionally render an inactive affiliate slot.

## Lead storage

The starter stores validated enquiries in:

`server/SellerOps.Api/App_Data/leads.ndjson`

This is intentionally dependency-free. For multi-instance/cloud production, replace `LeadStore` with PostgreSQL/SQL Server/CRM/email delivery because local filesystem persistence may not be durable on every host.

## Website audit security

The audit endpoint is deliberately conservative. It:

- accepts only HTTP/HTTPS;
- restricts targets to ports 80/443;
- rejects URLs containing credentials;
- resolves and rejects private, loopback, link-local, multicast and reserved IPs;
- revalidates redirect destinations;
- validates DNS/IP again inside `SocketsHttpHandler.ConnectCallback` before opening the socket;
- limits redirects, connection time, total request time and response size;
- does not execute target JavaScript.

Do not remove these controls simply to make more URLs pass the audit.

## Production checklist

- Replace `example.com` and `hello@example.com`.
- Review legal/privacy text for your company and jurisdictions.
- Configure forwarded-header trusted proxies/networks for your hosting topology if behind a reverse proxy.
- Use persistent storage or a database for leads.
- Back up lead/customer data and restrict filesystem access.
- Add monitoring/log aggregation and an error-reporting solution.
- Run `dotnet build -c Release` and `npm run build:prod` in CI on every change.
- Run `npm run format:check` in CI to keep frontend source consistent.
- Run accessibility, Lighthouse/Core Web Vitals and browser tests against the deployed site.
- Upgrade .NET before its support deadline.
