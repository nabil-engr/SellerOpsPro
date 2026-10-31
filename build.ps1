$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Client = Join-Path $Root "client/sellerops-web"
$Api = Join-Path $Root "server/SellerOps.Api"

Write-Host "[1/4] Installing locked Angular dependencies"
Push-Location $Client
npm ci
Write-Host "[2/4] Building, prerendering and validating Angular"
npm run build:prod
Pop-Location

Write-Host "[3/4] Copying static Angular output into ASP.NET wwwroot"
$Www = Join-Path $Api "wwwroot"
if (Test-Path $Www) { Get-ChildItem $Www -Force | Remove-Item -Recurse -Force }
New-Item -ItemType Directory -Path $Www -Force | Out-Null
Copy-Item (Join-Path $Client "dist/sellerops-web/browser/*") $Www -Recurse -Force

Write-Host "[4/4] Publishing ASP.NET 8"
dotnet publish (Join-Path $Api "SellerOps.Api.csproj") -c Release -o (Join-Path $Root "publish")
Write-Host "Production output: $(Join-Path $Root 'publish')"
