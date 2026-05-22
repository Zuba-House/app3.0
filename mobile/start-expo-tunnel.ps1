# Expo tunnel with retries; falls back to LAN if ngrok times out (common on Windows).
param(
    [switch]$DevClient
)

$ErrorActionPreference = "Continue"

Write-Host "`nStarting Expo with tunnel mode..." -ForegroundColor Green
Write-Host "If phone and PC share Wi-Fi, prefer: npm run start:dev-client:lan`n" -ForegroundColor Yellow

# Optional: some Expo CLI versions honor a longer tunnel wait (ms)
$env:EXPO_TUNNEL_TIMEOUT = "120000"

$baseArgs = @("expo", "start", "--tunnel", "--clear")
if ($DevClient) {
    $baseArgs = @("expo", "start", "--dev-client", "--tunnel", "--clear")
}

$maxAttempts = 3
for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
    Write-Host "Tunnel attempt $attempt of $maxAttempts (may take up to 2 min)..." -ForegroundColor Cyan
    & npx @baseArgs
    if ($LASTEXITCODE -eq 0) {
        exit 0
    }
    if ($attempt -lt $maxAttempts) {
        Write-Host "Tunnel failed. Retrying in 8s..." -ForegroundColor Yellow
        Start-Sleep -Seconds 8
    }
}

Write-Host "`nTunnel unavailable (ngrok timeout). Falling back to LAN..." -ForegroundColor Yellow
Write-Host "Use the same Wi-Fi on phone and PC, then open the dev client from the QR / URL shown.`n" -ForegroundColor Cyan

if ($DevClient) {
    & npx expo start --dev-client --lan --clear
} else {
    & npx expo start --lan --clear
}

exit $LASTEXITCODE
