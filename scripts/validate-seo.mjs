import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const browserRoot = path.join(
  root,
  "client/sellerops-web/dist/sellerops-web/browser",
);
const routeDataPath = path.join(
  root,
  "server/SellerOps.Api/Data/seo-routes.json",
);
const siteConfigPath = path.join(
  root,
  "client/sellerops-web/src/app/core/site.config.ts",
);
const appSettingsPath = path.join(
  root,
  "server/SellerOps.Api/appsettings.json",
);

if (!fs.existsSync(browserRoot)) {
  console.error(
    "SEO validation failed: Angular browser output was not found. Run the production build first.",
  );
  process.exit(1);
}

const siteConfig = fs.readFileSync(siteConfigPath, "utf8");
const siteUrl = siteConfig
  .match(/siteUrl:\s*'([^']+)'/)?.[1]
  ?.replace(/\/$/, "");
if (!siteUrl) {
  console.error(
    "SEO validation failed: SITE_CONFIG.siteUrl could not be read.",
  );
  process.exit(1);
}

const routes = JSON.parse(fs.readFileSync(routeDataPath, "utf8"));
const expectedRoutes = new Set([
  ...routes.static.map((value) => (value ? `/${value}` : "/")),
  ...routes.categories.map((value) => `/categories/${value}`),
  ...routes.tools.map((value) => `/tools/${value}`),
  ...routes.guides.map((value) => `/guides/${value}`),
  "/404",
]);

const htmlFiles = [];
const visit = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(fullPath);
    else if (entry.name === "index.html") htmlFiles.push(fullPath);
  }
};
visit(browserRoot);

const attr = (tag, name) =>
  tag
    .match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"))
    ?.slice(1)
    .find((value) => value !== undefined);
const tags = (html, name) =>
  [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map(
    (match) => match[0],
  );
const meta = (html, key) => {
  for (const tag of tags(html, "meta")) {
    if (
      (attr(tag, "name") ?? attr(tag, "property"))?.toLowerCase() ===
      key.toLowerCase()
    )
      return attr(tag, "content") ?? "";
  }
  return "";
};
const canonical = (html) =>
  tags(html, "link").find((tag) =>
    (attr(tag, "rel") ?? "").split(/\s+/).includes("canonical"),
  );
const routeFromFile = (file) => {
  const relative = path
    .relative(browserRoot, file)
    .replaceAll("\\", "/")
    .replace(/^(?:index\.html)$|\/index\.html$/i, "");
  return relative ? `/${relative}` : "/";
};
const routeExists = (route) => route === "/" || expectedRoutes.has(route);

const errors = [];
const appSettings = JSON.parse(fs.readFileSync(appSettingsPath, "utf8"));
if (appSettings.Site?.BaseUrl?.replace(/\/$/, "") !== siteUrl) {
  errors.push(
    "Frontend SITE_CONFIG.siteUrl and backend Site.BaseUrl do not match",
  );
}
const seenTitles = new Map();
const seenDescriptions = new Map();
const actualRoutes = new Set();

for (const file of htmlFiles) {
  const route = routeFromFile(file);
  const html = fs.readFileSync(file, "utf8");
  actualRoutes.add(route);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "";
  const description = meta(html, "description").trim();
  const robots = meta(html, "robots").toLowerCase();
  const canonicalTag = canonical(html);
  const canonicalUrl = canonicalTag ? attr(canonicalTag, "href") : "";
  const expectedCanonical = `${siteUrl}${route === "/" ? "/" : route}`;
  const h1Count = (html.match(/<h1\b/gi) ?? []).length;
  const isNotFound = route === "/404";

  if (!title) errors.push(`${route}: missing title`);
  if (!description) errors.push(`${route}: missing meta description`);
  if (canonicalUrl !== expectedCanonical)
    errors.push(
      `${route}: canonical is ${canonicalUrl || "missing"}, expected ${expectedCanonical}`,
    );
  if (h1Count !== 1) errors.push(`${route}: expected one H1, found ${h1Count}`);
  if (isNotFound ? !robots.includes("noindex") : !robots.includes("index"))
    errors.push(`${route}: incorrect robots directive`);

  if (!isNotFound) {
    for (const key of [
      "og:title",
      "og:description",
      "og:url",
      "og:image",
      "og:image:alt",
      "twitter:card",
      "twitter:title",
      "twitter:description",
      "twitter:image",
    ]) {
      if (!meta(html, key)) errors.push(`${route}: missing ${key}`);
    }
    const jsonLdBlocks = [
      ...html.matchAll(
        /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
      ),
    ];
    if (!jsonLdBlocks.length) errors.push(`${route}: missing JSON-LD`);
    for (const block of jsonLdBlocks) {
      try {
        JSON.parse(block[1]);
      } catch {
        errors.push(`${route}: invalid JSON-LD`);
      }
    }
  }

  if (title) {
    if (seenTitles.has(title))
      errors.push(
        `${route}: duplicate title also used by ${seenTitles.get(title)}`,
      );
    else seenTitles.set(title, route);
  }
  if (description && !isNotFound) {
    if (seenDescriptions.has(description))
      errors.push(
        `${route}: duplicate description also used by ${seenDescriptions.get(description)}`,
      );
    else seenDescriptions.set(description, route);
  }

  for (const anchor of tags(html, "a")) {
    const href = attr(anchor, "href");
    if (!href?.startsWith("/") || href.startsWith("//")) continue;
    const target =
      decodeURI(href.split(/[?#]/, 1)[0]).replace(/\/$/, "") || "/";
    if (!path.extname(target) && !routeExists(target))
      errors.push(`${route}: broken internal link ${href}`);
  }
}

for (const expected of expectedRoutes)
  if (!actualRoutes.has(expected))
    errors.push(`${expected}: prerendered page is missing`);
for (const actual of actualRoutes)
  if (!expectedRoutes.has(actual))
    errors.push(`${actual}: unexpected prerendered page`);

if (errors.length) {
  console.error(`SEO validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `SEO validation passed for ${actualRoutes.size} prerendered routes.`,
);
if (siteUrl === "https://example.com") {
  console.warn(
    "Launch reminder: run configure-site.mjs with the real HTTPS domain and contact email.",
  );
}
