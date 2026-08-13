# CLAUDE.md — Hayasaka Blog 项目说明

这是一个 Hexo 博客，部署到 GitHub Pages：https://hayasaka-naoji.github.io

## 目录结构
- `source/_posts/` — 所有文章（Markdown），日记也放在这里
- `themes/mosby/` — 自建主题（极简现代主义风格，参考 mosbyfiles.com）
- `_config.yml` — Hexo 站点配置
- `themes/mosby/_config.yml` — 主题配置（menu / tagline / accent / footer）

## 写日记规范
当用户说"写日记""记录一下今天""记个日记"等请求时，按以下流程执行：

1. 在 `source/_posts/` 新建 Markdown 文件，文件名建议带日期，例如 `2026-08-13.md`
2. front matter 使用以下格式：
   ---
   title: 自由起名（可用日期或自定义标题）
   date: YYYY-MM-DD HH:mm:ss
   tags: [日记]
   ---
3. 正文用中文，语气自然真诚，记录当天的事、想法或学习内容
4. 写完直接发布（不存草稿），除非用户特别说明要存草稿

## 发布流程
部署命令只能在用户自己的 PowerShell 里执行（沙盒 git 有文件锁问题）：

cd D:\Hayasaka_Blog\blog
hexo clean && hexo g && hexo d

## 重要提醒
- 用 Write/Edit 工具写文件会随机截断，务必改用 bash heredoc 写文件，写完后用 `cat -A` 或 `tail` 验证内容完整
- deploy 走 HTTPS + Personal Access Token 认证，部署分支是 master
