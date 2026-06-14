# FinAdvisor - one-command local dev launcher.
# Brings up Postgres (Docker), then runs the .NET API (5050),
# the Python analytics service (8000) and the Next.js web app (3000)
# together with hot-reload. Press Ctrl+C once to stop everything.

# Native commands (docker/npm) write progress to stderr; don't treat that as fatal.
$ErrorActionPreference = "Continue"
$root = $PSScriptRoot
Set-Location $root

function Write-Step($msg, $color = "Cyan") { Write-Host "  $msg" -ForegroundColor $color }
function Test-Docker { docker info *> $null; return ($LASTEXITCODE -eq 0) }

Write-Host ""
Write-Step "FinAdvisor - starting full stack" "Cyan"
Write-Host "  ---------------------------------" -ForegroundColor DarkCyan

# 1. Load a root .env (optional) so secrets like ANTHROPIC_API_KEY reach every service.
$envFile = Join-Path $root ".env"
if (Test-Path $envFile) {
    Write-Step "Loading .env" "DarkGray"
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $idx = $line.IndexOf("=")
            $name = $line.Substring(0, $idx).Trim()
            $value = $line.Substring($idx + 1).Trim().Trim('"')
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

# 2. Install the launcher's only dependency (concurrently) once.
if (-not (Test-Path (Join-Path $root "node_modules\concurrently"))) {
    Write-Step "Installing launcher dependency (one-time)..." "Yellow"
    npm install --silent
}

# 3. Make sure the Docker engine is running; start Docker Desktop if it isn't.
if (-not (Test-Docker)) {
    Write-Step "Docker engine not reachable - starting Docker Desktop..." "Yellow"
    $dockerDesktop = @(
        "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe",
        "$env:LOCALAPPDATA\Docker\Docker Desktop.exe"
    ) | Where-Object { Test-Path $_ } | Select-Object -First 1

    if ($dockerDesktop) {
        Start-Process $dockerDesktop | Out-Null
        $waited = 0
        while (-not (Test-Docker) -and $waited -lt 120) { Start-Sleep -Seconds 3; $waited += 3 }
    }

    if (-not (Test-Docker)) {
        Write-Step "Could not reach Docker. Please start Docker Desktop, then re-run .\dev.cmd" "Red"
        exit 1
    }
}

# 4. Start Postgres and wait until it reports healthy.
Write-Step "Starting Postgres (Docker)..." "DarkGray"
docker compose up -d postgres 2>&1 | Out-Null

Write-Step "Waiting for Postgres..." "DarkGray"
$tries = 0
do {
    Start-Sleep -Seconds 1
    $health = (docker inspect -f "{{.State.Health.Status}}" finadvisor-postgres 2>$null)
    $tries++
} until ($health -eq "healthy" -or $tries -ge 30)

if ($health -eq "healthy") { Write-Step "Postgres ready." "Green" }
else { Write-Step "Postgres not healthy yet - continuing anyway." "Yellow" }

# 5. Run the three app services together. Ctrl+C (or any crash) stops them all.
Write-Host ""
Write-Step "API       -> http://localhost:5050" "Blue"
Write-Step "Analytics -> http://localhost:8000" "Magenta"
Write-Step "Web       -> http://localhost:3000" "Green"
Write-Host ""

try {
    npm run dev
}
finally {
    Write-Host ""
    Write-Step "Stopping Postgres..." "DarkGray"
    docker compose stop postgres 2>&1 | Out-Null
    Write-Step "All services stopped." "Green"
}
