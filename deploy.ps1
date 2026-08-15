# ============================================
#  Hayasaka Blog 一键部署脚本
#  用法：
#    .\deploy.ps1                 只部署网站（clean + generate + deploy）
#    .\deploy.ps1 -AlsoBackup     部署后顺便把源码备份到 main 分支
# ============================================

param(
    [switch]$AlsoBackup
)

$ErrorActionPreference = "Stop"

# 切到脚本所在目录（博客根目录），保证在任何位置运行都不出错
Set-Location -LiteralPath $PSScriptRoot

Write-Host ""
Write-Host "[1/3] 清理旧文件：hexo clean" -ForegroundColor Cyan
hexo clean
if ($LASTEXITCODE -ne 0) { throw "hexo clean 失败，请检查 hexo 是否已安装" }

Write-Host ""
Write-Host "[2/3] 生成静态文件：hexo generate" -ForegroundColor Cyan
hexo g
if ($LASTEXITCODE -ne 0) { throw "hexo g 失败" }

Write-Host ""
Write-Host "[3/3] 部署到 GitHub Pages：hexo deploy" -ForegroundColor Cyan
hexo d
if ($LASTEXITCODE -ne 0) { throw "hexo d 失败，请检查 HTTPS 与 token 配置" }

if ($AlsoBackup) {
    Write-Host ""
    Write-Host "备份源码到 main 分支..." -ForegroundColor Cyan
    $changes = git status --porcelain
    if ($changes) {
        git add -A
        git commit -m ("backup: " + (Get-Date -Format "yyyy-MM-dd HH:mm")) -q
        if ($LASTEXITCODE -ne 0) { throw "git commit 失败" }
        git push origin main
        if ($LASTEXITCODE -ne 0) { throw "git push 失败" }
    } else {
        Write-Host "源码无改动，跳过备份" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "部署完成：https://hayasaka-naoji.github.io" -ForegroundColor Green
