import fs from "node:fs";
import path from "node:path";

const [rawUrl, email, rawName] = process.argv.slice(2);
if (!rawUrl || !email) {
  console.error(
    'Usage: node scripts/configure-site.mjs https://yourdomain.com hello@yourdomain.com ["Site Name"]',
  );
  process.exit(1);
}
let parsedUrl;
try {
  parsedUrl = new URL(rawUrl);
} catch {
  console.error("Enter a valid absolute production URL.");
  process.exit(1);
}
if (
  parsedUrl.protocol !== "https:" ||
  parsedUrl.pathname !== "/" ||
  parsedUrl.search ||
  parsedUrl.hash
) {
  console.error(
    "Production site URL must be an HTTPS origin without a path, query or fragment.",
  );
  process.exit(1);
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Enter a valid contact email address.");
  process.exit(1);
}
const siteUrl = parsedUrl.origin;
const name = rawName || "SellerOps Toolkit";
const root = path.resolve(import.meta.dirname, "..");
const siteConfigPath = path.join(
  root,
  "client/sellerops-web/src/app/core/site.config.ts",
);
const indexPath = path.join(root, "client/sellerops-web/src/index.html");
const appSettingsPath = path.join(
  root,
  "server/SellerOps.Api/appsettings.json",
);

let cfg = fs.readFileSync(siteConfigPath, "utf8");
cfg = cfg
  .replace(/name: '[^']*'/, `name: '${name.replaceAll("'", "\\'")}'`)
  .replace(/siteUrl: '[^']*'/, `siteUrl: '${siteUrl}'`)
  .replace(/email: '[^']*'/, `email: '${email.replaceAll("'", "\\'")}'`);
fs.writeFileSync(siteConfigPath, cfg);

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
let index = fs.readFileSync(indexPath, "utf8");
index = index
  .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(name)}</title>`)
  .replace(
    /<link rel="canonical" href="[^"]*">/,
    `<link rel="canonical" href="${siteUrl}/">`,
  );
fs.writeFileSync(indexPath, index);

const settings = JSON.parse(fs.readFileSync(appSettingsPath, "utf8"));
settings.Site.Name = name;
settings.Site.BaseUrl = siteUrl;
settings.Site.ContactEmail = email;
fs.writeFileSync(appSettingsPath, JSON.stringify(settings, null, 2) + "\n");
console.log(`Configured ${name} for ${siteUrl}`);
