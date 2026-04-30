# Expose l'appli en local via ngrok (2 tunnels : backend + frontend)
# Prerequis : ngrok installe et authentifie (ngrok config add-authtoken TON_TOKEN)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$ngrokConfig = "$root\ngrok.yml"

# Ecrire la config ngrok temporaire
@"
version: "3"
tunnels:
  backend:
    addr: 8000
    proto: http
  frontend:
    addr: 5173
    proto: http
"@ | Set-Content -Path $ngrokConfig -Encoding utf8

Write-Host "Lancement de ngrok (2 tunnels)..." -ForegroundColor Cyan
Write-Host "Les URLs s'afficheront dans la fenetre ngrok." -ForegroundColor Yellow
Write-Host ""
Write-Host "Apres avoir recupere les URLs ngrok :" -ForegroundColor White
Write-Host "  1. Cree frontend\.env.local avec : VITE_API_URL=https://BACKEND.ngrok-free.app/api"
Write-Host "  2. Mets a jour backend\.env :"
Write-Host "       FRONTEND_URL=https://FRONTEND.ngrok-free.app"
Write-Host "       CORS_ALLOWED_ORIGINS=https://FRONTEND.ngrok-free.app"
Write-Host "  3. Relance php artisan serve et npm run dev"
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok start --all --config '$ngrokConfig'"
