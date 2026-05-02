# Report top-level folder sizes. Run: npm run folder-sizes   (from repo root)
# Uses this file path so $ variables are not stripped (unlike nested powershell -Command).
$ErrorActionPreference = 'SilentlyContinue'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

Get-ChildItem -LiteralPath $root -Directory -Force | ForEach-Object {
  $sum = (
    Get-ChildItem -LiteralPath $_.FullName -Recurse -File -Force -ErrorAction SilentlyContinue |
      Measure-Object -Property Length -Sum
  ).Sum
  [PSCustomObject]@{
    Name   = $_.Name
    SizeMB = [math]::Round(($sum / 1MB), 2)
  }
} | Sort-Object SizeMB -Descending | Format-Table -AutoSize
