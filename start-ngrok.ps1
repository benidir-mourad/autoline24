# Expose l'app via ngrok (un seul tunnel sur le backend Laravel)
# Prerequis : ngrok installe et authentifie (ngrok config add-authtoken TON_TOKEN)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== Autoline24 - Partage via ngrok ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Etape 1 : Build du frontend..." -ForegroundColor Yellow
Set-Location "$root\frontend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Echec du build frontend." -ForegroundColor Red
    exit 1
}
Set-Location $root

Write-Host ""
Write-Host "Etape 2 : Demarrage de Laravel..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; php artisan serve"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Etape 3 : Lancement du tunnel ngrok..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Une URL publique va s'afficher (ex: https://abc123.ngrok-free.app)" -ForegroundColor Green
Write-Host "Copie-la et mets a jour backend\.env :" -ForegroundColor White
Write-Host "  APP_URL=https://abc123.ngrok-free.app" -ForegroundColor Gray
Write-Host "  FRONTEND_URL=https://abc123.ngrok-free.app" -ForegroundColor Gray
Write-Host "  CORS_ALLOWED_ORIGINS=https://abc123.ngrok-free.app" -ForegroundColor Gray
Write-Host ""
Write-Host "Puis cree frontend\.env.local :" -ForegroundColor White
Write-Host "  VITE_API_URL=https://abc123.ngrok-free.app/api" -ForegroundColor Gray
Write-Host "  Relance : npm run build dans le dossier frontend" -ForegroundColor Gray
Write-Host ""

ngrok http 8000
