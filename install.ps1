param(
  [string]$RepoRoot = $PSScriptRoot,
  [string]$ProfileRoot = (Join-Path $env:USERPROFILE '.dsh\profiles\desktop')
)

$ErrorActionPreference = 'Stop'
$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
$ProfileRoot = (Resolve-Path -LiteralPath $ProfileRoot).Path
$PackagePath = Join-Path $ProfileRoot 'package.json'
$NodeModules = Join-Path $ProfileRoot 'node_modules'
$LinkPath = Join-Path $NodeModules 'dsh-rsi'

if (-not (Test-Path -LiteralPath $PackagePath -PathType Leaf)) {
  throw "DSH profile not found: $ProfileRoot"
}

New-Item -ItemType Directory -Path $NodeModules -Force | Out-Null
if (Test-Path -LiteralPath $LinkPath) {
  $item = Get-Item -LiteralPath $LinkPath -Force
  $target = [string](@($item.Target)[0])
  $existing = [IO.Path]::GetFullPath($target)
  if ($existing -ne $RepoRoot) {
    throw "dsh-rsi already links to another path: $existing"
  }
} else {
  New-Item -ItemType Junction -Path $LinkPath -Target $RepoRoot | Out-Null
  Write-Output "linked $LinkPath -> $RepoRoot"
}

$raw = Get-Content -LiteralPath $PackagePath -Raw -Encoding utf8
$pkg = $raw | ConvertFrom-Json
$backup = "$PackagePath.bak-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item -LiteralPath $PackagePath -Destination $backup -Force
Write-Output "backup $backup"

$link = 'link:' + ($RepoRoot -replace '\\', '/')
if ($null -eq $pkg.dependencies) {
  $pkg | Add-Member -NotePropertyName dependencies -NotePropertyValue ([pscustomobject]@{}) -Force
}
$pkg.dependencies | Add-Member -NotePropertyName 'dsh-rsi' -NotePropertyValue $link -Force

if ($null -eq $pkg.dsh) {
  $pkg | Add-Member -NotePropertyName dsh -NotePropertyValue ([pscustomobject]@{}) -Force
}
if ($null -eq $pkg.dsh.profile) {
  $pkg.dsh | Add-Member -NotePropertyName profile -NotePropertyValue ([pscustomobject]@{}) -Force
}
$bundles = @($pkg.dsh.profile.bundles | Where-Object { $_ -ne 'dsh-rsi' }) + 'dsh-rsi'
$pkg.dsh.profile | Add-Member -NotePropertyName bundles -NotePropertyValue $bundles -Force

$json = $pkg | ConvertTo-Json -Depth 10
[IO.File]::WriteAllText($PackagePath, $json, (New-Object Text.UTF8Encoding($false)))
Write-Output "updated $PackagePath"
Write-Output 'Restart DeepSeek Harness. The RSI section is at the bottom of Settings.'
