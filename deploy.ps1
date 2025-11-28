# PowerShell Deployment Scripts for WMealPlan
# For Windows environments

function Deploy-Production {
    Write-Host "🚀 Starting production deployment..." -ForegroundColor Green
    
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
    
    Write-Host "📦 Installing client dependencies..." -ForegroundColor Yellow
    Set-Location client
    npm install
    if ($LASTEXITCODE -ne 0) { throw "client npm install failed" }
    
    Write-Host "🏗️  Building client..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "client build failed" }
    
    Set-Location ..
    
    Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow
    vercel --prod
    if ($LASTEXITCODE -ne 0) { throw "Vercel deployment failed" }
    
    Write-Host "✅ Deployment complete!" -ForegroundColor Green
}

function Deploy-Preview {
    Write-Host "🔍 Starting preview deployment..." -ForegroundColor Cyan
    
    npm install
    Set-Location client
    npm install
    npm run build
    Set-Location ..
    vercel
    
    Write-Host "✅ Preview deployment complete!" -ForegroundColor Green
}

function Build-Local {
    Write-Host "🏗️  Building project locally..." -ForegroundColor Yellow
    
    npm install
    Set-Location client
    npm install
    npm run build
    Set-Location ..
    
    Write-Host "✅ Build complete! Check client/build/" -ForegroundColor Green
}

function Clean-Build {
    Write-Host "🧹 Cleaning build artifacts..." -ForegroundColor Yellow
    
    if (Test-Path "client\build") { Remove-Item -Recurse -Force "client\build" }
    if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
    if (Test-Path "client\node_modules") { Remove-Item -Recurse -Force "client\node_modules" }
    if (Test-Path ".vercel") { Remove-Item -Recurse -Force ".vercel" }
    
    Write-Host "✅ Clean complete!" -ForegroundColor Green
}

function Install-Dependencies {
    Write-Host "📦 Installing all dependencies..." -ForegroundColor Yellow
    
    npm install
    Set-Location client
    npm install
    Set-Location ..
    
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
}

function Test-Security {
    Write-Host "🔒 Running security audit..." -ForegroundColor Yellow
    
    npm audit
    Set-Location client
    npm audit
    Set-Location ..
    
    Write-Host "✅ Audit complete!" -ForegroundColor Green
}

function Update-Dependencies {
    Write-Host "⬆️  Updating dependencies..." -ForegroundColor Yellow
    
    npm update
    Set-Location client
    npm update
    Set-Location ..
    
    Write-Host "✅ Dependencies updated!" -ForegroundColor Green
}

function Check-Environment {
    Write-Host "🔍 Checking environment variables..." -ForegroundColor Yellow
    
    if (-not (Test-Path ".env")) {
        Write-Host "❌ .env file not found! Copy from .env.example" -ForegroundColor Red
        return $false
    }
    
    if (-not (Test-Path "client\.env.local")) {
        Write-Host "⚠️  client\.env.local not found (optional)" -ForegroundColor Yellow
    }
    
    Write-Host "✅ Environment files present" -ForegroundColor Green
    return $true
}

function Test-Health {
    Write-Host "🏥 Running health check..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Server is healthy!" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Server not running or unhealthy" -ForegroundColor Red
    }
}

function Get-VercelLogs {
    Write-Host "📜 Fetching Vercel logs..." -ForegroundColor Yellow
    vercel logs
}

# Export functions for use
Export-ModuleMember -Function Deploy-Production, Deploy-Preview, Build-Local, Clean-Build, Install-Dependencies, Test-Security, Update-Dependencies, Check-Environment, Test-Health, Get-VercelLogs

Write-Host @"

WMealPlan Deployment Scripts Loaded! 🎉

Available Commands:
  Deploy-Production      - Deploy to production
  Deploy-Preview         - Deploy to preview environment
  Build-Local           - Build project locally
  Clean-Build           - Remove build artifacts
  Install-Dependencies  - Install all dependencies
  Test-Security         - Run security audit
  Update-Dependencies   - Update all dependencies
  Check-Environment     - Verify environment files
  Test-Health          - Check server health
  Get-VercelLogs       - Fetch deployment logs

Example: Deploy-Production

"@ -ForegroundColor Cyan
