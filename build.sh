#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
CLIENT="$ROOT/client/sellerops-web"
API="$ROOT/server/SellerOps.Api"

echo "[1/4] Installing locked Angular dependencies"
cd "$CLIENT"
npm ci

echo "[2/4] Building, prerendering and validating Angular"
npm run build:prod

echo "[3/4] Copying static Angular output into ASP.NET wwwroot"
rm -rf "$API/wwwroot"/*
mkdir -p "$API/wwwroot"
cp -R "$CLIENT/dist/sellerops-web/browser"/. "$API/wwwroot/"

echo "[4/4] Publishing ASP.NET 8"
cd "$ROOT"
dotnet publish "$API/SellerOps.Api.csproj" -c Release -o "$ROOT/publish"
echo "Production output: $ROOT/publish"
