# Validation status

Last verified: 2026-08-23

## Automated checks

- `npm run build:prod` completes with Angular production optimization and SSR prerendering.
- 73 routes are prerendered: 47 tools, 5 categories, 10 guides, 10 static pages and the 404 page.
- `npm run validate:seo` verifies route coverage, one H1 per page, unique titles and descriptions, canonicals, robots directives, Open Graph, Twitter cards, valid JSON-LD and internal links.
- `npm run format:check` verifies consistent frontend and JavaScript formatting.
- `npm audit` reports zero known vulnerabilities.
- `dotnet build -c Release` completes with warnings treated as errors.
- `build.ps1` completes the full install, frontend build, static-file copy and ASP.NET publish flow.

## Runtime smoke checks

The published ASP.NET application was checked for:

- homepage and prerendered page delivery;
- `/api/health`, `/sitemap.xml` and `/robots.txt` responses;
- correct 400 validation response for an invalid lead request;
- correct 404 response and `X-Robots-Tag` for missing URLs;
- canonical redirects for `/index.html` and trailing-slash duplicates;
- response compression negotiation and API noindex headers.

## Content integrity checks

- Tool, category and guide slugs are unique.
- Every calculator slug maps to a calculation implementation.
- Specialized website-audit and image-compressor tools use dedicated components.
- Guide-related tool references resolve to real tools.
- Sitemap route data matches the prerendered route set.

These checks improve release confidence but do not replace browser/device testing, Search Console validation, legal review or production monitoring.
