# ============================================
#  Hayasaka Blog 源码一键同步脚本
#  作用：把整个博客源码文件夹同步（提交+推送）到 GitHub 仓库的 main 分支
#  用法：双击 sync-main.bat，或在 PowerShell 里运行 .\sync-main.ps1
#  说明：node_modules、public、db.json 等已被 .gitignore 排除，不会上传
# ============================================

$ErrorActionPreference = "Stop"

# 切到脚本所在目录（博客根目录），保证在任何位置双击都能正确运行
Set-Location -LiteralPath $PSScriptRoot

Write-Host ""
Write-Host "====== 同步源码到 main 分支 ======" -ForegroundColor Cyan

# 1. 暂存所有改动（.gitignore 已排除 node_modules / public / db.json 等）
git add -A

# 2. 有改动才提交
$changes = git status --porcelain
if ($changes) {
    Write-Host "检测到改动，正在提交..." -ForegroundColor Cyan
    git commit -m ("sync: " + (Get-Date -Format "yyyy-MM-dd HH:mm")) -q
    if ($LASTEXITCODE -ne 0) { throw "git commit 失败，请检查 git 用户配置" }
} else {
    Write-Host "源码无改动，无需提交" -ForegroundColor DarkGray
}

# 3. 先拉取远端，避免 push 被拒绝
Write-Host "拉取远端最新改动..." -ForegroundColor Cyan
git pull --rebase origin main
if ($LASTEXITCODE -ne 0) {
    throw "git pull 失败。如遇冲突，请手动解决后重试（用 git status 查看详情）"
}

# 4. 推送到 main 分支
Write-Host "推送到 origin/main..." -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) { throw "git push 失败，请检查网络或 GitHub token" }

Write-Host ""
Write-Host "同步完成 ✓" -ForegroundColor Green
Write-Host "查看源码：https://github.com/hayasaka-naoji/hayasaka-naoji.github.io/tree/main"
