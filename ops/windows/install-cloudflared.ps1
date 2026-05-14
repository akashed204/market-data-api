$ErrorActionPreference = "Stop"

if (Get-Command cloudflared -ErrorAction SilentlyContinue) {
  cloudflared --version
  exit 0
}

if (Get-Command winget -ErrorAction SilentlyContinue) {
  winget install --id Cloudflare.cloudflared --source winget --accept-package-agreements --accept-source-agreements
  cloudflared --version
  exit 0
}

$installDir = "$env:ProgramFiles\cloudflared"
$exePath = Join-Path $installDir "cloudflared.exe"
New-Item -ItemType Directory -Force -Path $installDir | Out-Null

$url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
Invoke-WebRequest -Uri $url -OutFile $exePath

$machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
if ($machinePath -notlike "*$installDir*") {
  [Environment]::SetEnvironmentVariable("Path", "$machinePath;$installDir", "Machine")
}

& $exePath --version
