# Expo Start Script with Tunnel Mode
# Use this if LAN mode doesn't work (works across different networks)

Write-Host "`n🚀 Starting Expo with Tunnel Mode..." -ForegroundColor Green
Write-Host "📱 This works even if devices are on different networks`n" -ForegroundColor Yellow
Write-Host "⏳ Tunnel setup may take 30-60 seconds...`n" -ForegroundColor Cyan

# Start Expo with tunnel mode
npx expo start --tunnel --clear
