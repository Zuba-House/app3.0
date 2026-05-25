# Tunnel-only: npx expo start --tunnel --clear (retries, frees port 8081, kills stale ngrok).
param(
    [switch]$DevClient
)

$ErrorActionPreference = "Continue"

$env:EXPO_TUNNEL_TIMEOUT = "120000"

# Load NGROK_AUTH_TOKEN from mobile/.env if present
$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*NGROK_AUTH_TOKEN\s*=\s*(.+)\s*$') {
            $env:NGROK_AUTH_TOKEN = $matches[1].Trim().Trim('"').Trim("'")
        }
    }
}

$expoSharedToken = "5W1bR67GNbWcXqmxZzBG1_56GezNeaX6sSRvn8npeQ8"
$ngrokYml = Join-Path $env:USERPROFILE ".expo\ngrok.yml"
if (-not $env:NGROK_AUTH_TOKEN -and (Test-Path $ngrokYml)) {
    $yml = Get-Content $ngrokYml -Raw
    if ($yml -match "authtoken:\s*(\S+)") {
        $token = $matches[1]
        if ($token -ne $expoSharedToken) {
            $env:NGROK_AUTH_TOKEN = $token
        }
    }
}

Write-Host "`nTunnel: npx expo start --tunnel --clear" -ForegroundColor Green
if ($env:NGROK_AUTH_TOKEN) {
    Write-Host "Using personal ngrok token from env/config." -ForegroundColor DarkGray
} else {
    Write-Host "WARNING: No personal NGROK_AUTH_TOKEN. Expo shared ngrok often hits session limits." -ForegroundColor Yellow
    Write-Host "  1. https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor Yellow
    Write-Host "  2. Add NGROK_AUTH_TOKEN=... to mobile/.env" -ForegroundColor Yellow
    Write-Host "  3. Stop agents: https://dashboard.ngrok.com/agents`n" -ForegroundColor Yellow
}

# Kill stale ngrok agents (local)
Get-Process -Name ngrok -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Stopping ngrok (PID $($_.Id))..." -ForegroundColor Yellow
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 1

# Free Metro port 8081
$port = 8081
$connections = netstat -ano | Select-String ":$port\s"
if ($connections) {
    $pids = $connections | ForEach-Object {
        if ($_ -match '\s+(\d+)\s*$') { $matches[1] }
    } | Select-Object -Unique
    foreach ($procId in $pids) {
        if ($procId -and $procId -ne $PID) {
            Write-Host "Stopping process on port $port (PID $procId)..." -ForegroundColor Yellow
            taskkill /PID $procId /F 2>$null | Out-Null
        }
    }
    Start-Sleep -Seconds 2
}

node "$PSScriptRoot\scripts\patch-expo-tunnel-timeout.js" | Out-Null

$baseArgs = @("expo", "start", "--tunnel", "--clear", "--port", "$port")
if ($DevClient) {
    $baseArgs = @("expo", "start", "--dev-client", "--tunnel", "--clear", "--port", "$port")
}

$maxAttempts = 5
for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
    Write-Host "Attempt $attempt of $maxAttempts (up to 120s)..." -ForegroundColor Cyan
    & npx @baseArgs
    if ($LASTEXITCODE -eq 0) {
        exit 0
    }
    Get-Process -Name ngrok -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    if ($attempt -lt $maxAttempts) {
        Write-Host "Tunnel failed. Retrying in 12s..." -ForegroundColor Yellow
        Start-Sleep -Seconds 12
    }
}

Write-Host "`nTunnel failed. If you see '5000 simultaneous ngrok agent sessions':" -ForegroundColor Red
Write-Host "  - Open https://dashboard.ngrok.com/agents and stop all sessions" -ForegroundColor Yellow
Write-Host "  - Put your own NGROK_AUTH_TOKEN in mobile/.env (not Expo's shared token)`n" -ForegroundColor Yellow
exit 1
