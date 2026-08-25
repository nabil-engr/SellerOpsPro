import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const browserRoot = path.join(
  root,
  "client/sellerops-web/dist/sellerops-web/browser",
);
const nestedNotFound = path.join(browserRoot, "404", "index.html");
const topLevelNotFound = path.join(browserRoot, "404.html");

if (!fs.existsSync(nestedNotFound)) {
  throw new Error("Prerendered 404 page was not found.");
}

fs.copyFileSync(nestedNotFound, topLevelNotFound);
console.log("Created top-level 404.html for the static host.");
