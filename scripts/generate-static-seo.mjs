import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const routeDataPath = path.join(
  root,
  "server/SellerOps.Api/Data/seo-routes.json",
);
const siteConfigPath = path.join(
  root,
  "client/sellerops-web/src/app/core/site.config.ts",
);
const outputRoot = path.join(root, "client/sellerops-web/src");

const siteConfig = fs.readFileSync(siteConfigPath, "utf8");
const siteUrl = siteConfig
  .match(/siteUrl:\s*'([^']+)'/)?.[1]
  ?.replace(/\/$/, "");
if (!siteUrl || !siteUrl.startsWith("https://")) {
  throw new Error("SITE_CONFIG.siteUrl must be an absolute HTTPS origin.");
}

const routeData = JSON.parse(fs.readFileSync(routeDataPath, "utf8"));
const paths = [
  ...routeData.static.map((value) => (value ? `/${value}` : "/")),
  ...routeData.categories.map((value) => `/categories/${value}`),
  ...routeData.tools.map((value) => `/tools/${value}`),
  ...routeData.guides.map((value) => `/guides/${value}`),
];

const escapeXml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const urls = [...new Set(paths)].map((route) =>
  route === "/" ? `${siteUrl}/` : `${siteUrl}${route}`,
);
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
  "</urlset>",
  "",
].join("\n");
const robots = [
  "User-agent: *",
  "Allow: /",
  "Disallow: /api/",
  "",
  `Sitemap: ${siteUrl}/sitemap.xml`,
  "",
].join("\n");

fs.writeFileSync(path.join(outputRoot, "sitemap.xml"), sitemap, "utf8");
fs.writeFileSync(path.join(outputRoot, "robots.txt"), robots, "utf8");
console.log(
  `Generated sitemap.xml with ${urls.length} canonical URLs and robots.txt.`,
);
