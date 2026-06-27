param(
  [string]$RepoName = "zellij-site"
)

$ErrorActionPreference = "Stop"
$Git = "C:\Users\KHAMIR\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe"

if (-not (Test-Path -LiteralPath $Git)) {
  $Git = "git"
}

gh auth status | Out-Host

$Owner = gh api user --jq ".login"
$Repo = "$Owner/$RepoName"
$RemoteUrl = "https://github.com/$Repo.git"

gh repo view $Repo *> $null
if ($LASTEXITCODE -ne 0) {
  gh repo create $RepoName --public --description "ZELLIJ storefront" --homepage "https://$Owner.github.io/$RepoName/"
}

$Origin = & $Git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
  & $Git remote add origin $RemoteUrl
} else {
  & $Git remote set-url origin $RemoteUrl
}

& $Git push -u origin main

try {
  gh api -X POST "repos/$Repo/pages" -f "source[branch]=main" -f "source[path]=/" | Out-Null
} catch {
  gh api -X PATCH "repos/$Repo/pages" -f "source[branch]=main" -f "source[path]=/" | Out-Null
}

$SiteUrl = "https://$Owner.github.io/$RepoName/"
gh repo edit $Repo --homepage $SiteUrl

Write-Host ""
Write-Host "Site public: $SiteUrl"
