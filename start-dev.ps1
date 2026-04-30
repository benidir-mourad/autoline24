# Demarre le backend Laravel et le frontend Vite dans des fenetres separees
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Demarrage du backend Laravel..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; php artisan serve"

Write-Host "Demarrage du frontend Vite..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; npm run dev"

Write-Host ""
Write-Host "Serveurs demarres :" -ForegroundColor Green
Write-Host "  Backend  -> http://localhost:8000" -ForegroundColor White
Write-Host "  Frontend -> http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Pour exposer via ngrok, lance ensuite : .\start-ngrok.ps1" -ForegroundColor Yellow
