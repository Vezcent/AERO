Set-Location $PSScriptRoot

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "      ASTI Website Launcher          " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is not installed." -ForegroundColor Red
    Write-Host "Please install Node.js (v20+) from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit..."
    exit 1
}

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing project dependencies..." -ForegroundColor Yellow
    npm install
}

if ((-not (Test-Path ".env")) -and (Test-Path ".env.example")) {
    Write-Host "Creating .env configuration file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

$port = 3000
if (Test-Path ".env") {
    $envLines = Get-Content ".env"
    foreach ($line in $envLines) {
        if ($line -match "^PORT=(.*)$") {
            $port = $matches[1].Trim()
        }
    }
}

$url = "http://localhost:$port"
Write-Host "Starting server at $url..." -ForegroundColor Green

Start-Process $url

npm start
