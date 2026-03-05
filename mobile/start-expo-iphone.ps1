# Expo Start Script for iPhone Connection
# This script starts Expo with proper settings for iPhone on same WiFi

Write-Host "`n🚀 Starting Expo for iPhone Connection..." -ForegroundColor Green
Write-Host "📱 Make sure your iPhone is on the same WiFi network`n" -ForegroundColor Yellow

# Get local IP address
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -and $_.InterfaceAlias -like "*Wi-Fi*"} | Select-Object -First 1).IPAddress

if ($localIP) {
    Write-Host "✅ Your computer's IP: $localIP" -ForegroundColor Green
    Write-Host "📱 In Expo Go app, use this IP or scan the QR code`n" -ForegroundColor Cyan
} else {
    Write-Host "⚠️ Could not detect IP address automatically`n" -ForegroundColor Yellow
}

# Start Expo with LAN mode (for same WiFi)
Write-Host "Starting Expo server...`n" -ForegroundColor Cyan
npx expo start --lan --clear
