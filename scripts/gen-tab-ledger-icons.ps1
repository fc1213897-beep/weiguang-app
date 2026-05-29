Add-Type -AssemblyName System.Drawing

function Draw-LedgerIcon {
  param(
    [string]$Path,
    [bool]$Active
  )

  $size = 81
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

  if ($Active) {
    $bg = [System.Drawing.Color]::FromArgb(255, 255, 237, 213)
    $fg = [System.Drawing.Color]::FromArgb(255, 234, 88, 12)
  } else {
    $bg = [System.Drawing.Color]::FromArgb(255, 250, 250, 249)
    $fg = [System.Drawing.Color]::FromArgb(255, 168, 162, 158)
  }

  $g.Clear($bg)
  $brush = New-Object System.Drawing.SolidBrush $fg
  $pen = New-Object System.Drawing.Pen $fg, 3
  $rect = New-Object System.Drawing.Rectangle 18, 22, 45, 32
  $g.DrawRectangle($pen, $rect)
  $g.FillEllipse($brush, 33, 38, 16, 16)
  $font = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
  $g.DrawString([char]0x00A5, $font, $brush, 36.0, 37.0)

  $g.Dispose()
  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

$root = Split-Path -Parent $PSScriptRoot
$img = Join-Path $root "miniprogram\images"
Draw-LedgerIcon (Join-Path $img "tab-ledger.png") $false
Draw-LedgerIcon (Join-Path $img "tab-ledger-active.png") $true
Write-Host "Generated ledger tab icons in $img"
