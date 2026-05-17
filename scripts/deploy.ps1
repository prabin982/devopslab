Write-Host "🚀 Starting Deployment Process..." -ForegroundColor Cyan

# 1. Git Changes
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "📦 Committing changes..."
    git add .
    git commit -m "Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

Write-Host "⬆️ Pushing to origin main..."
git push origin main

# 2. Docker Compose
Write-Host "🔄 Restarting services..." -ForegroundColor Yellow
docker compose down
docker compose up -d --build

# 3. Health Checks
Write-Host "⏳ Waiting for Application Health Check..."
$maxRetries = 10
$count = 0
$appUp = $false

while (-not $appUp -and $count -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method Get -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) { $appUp = $true }
    } catch {
        $count++
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 5
    }
}

if ($appUp) {
    Write-Host "`n✅ App is healthy!" -ForegroundColor Green
} else {
    Write-Host "`n❌ App health check failed!" -ForegroundColor Red
    exit 1
}

Write-Host "⏳ Waiting for Elasticsearch..."
$esUp = $false
while (-not $esUp) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:9200" -Method Get -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) { $esUp = $true }
    } catch {
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 5
    }
}
Write-Host "`n✅ Elasticsearch is ready!" -ForegroundColor Green

Write-Host "------------------------------------------------"
Write-Host "🎉 Deployment Complete!" -ForegroundColor Cyan
Write-Host "🔗 Frontend: http://localhost:5000"
Write-Host "📊 Kibana:   http://localhost:5601"
Write-Host "------------------------------------------------"
