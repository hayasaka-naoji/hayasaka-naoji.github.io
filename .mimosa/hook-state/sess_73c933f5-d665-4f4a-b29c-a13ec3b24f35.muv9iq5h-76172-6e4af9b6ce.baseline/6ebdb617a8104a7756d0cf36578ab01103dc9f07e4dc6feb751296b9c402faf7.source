# CLAUDE.md — Hayasaka Blog 项目说明

这是一个 Hexo 博客，部署到 GitHub Pages：https://hayasaka-naoji.github.io

## 目录结构
- `source/_posts/` — 所有文章（Markdown），日记、杂谈、开发三类都放这里，用 front matter 的 categories 区分
- `source/about/index.md` — 关于页
- `source/categories/index.md` — 专栏总览页（layout: categories）
- `source/tags/index.md` — 标签总览页（layout: tags）
- `themes/mosby/` — 自建主题（极简现代主义风格，参考 mosbyfiles.com）
- `_config.yml` — Hexo 站点配置
- `themes/mosby/_config.yml` — 主题配置（author / columns / menu / tagline / accent / footer）

## 博客结构约定
- 三个专栏（分类）：日记、杂谈、开发
  - 日记：记录日常，tag 带「日记」
  - 杂谈：漫无边际的想法
  - 开发：代码、工具、折腾笔记，tag 带「开发」或具体技术名
- 首页（index.ejs）是装饰页：hero + 简介 + 专栏卡片 + 统计，不放文章列表
- 侧边栏（桌面端左侧固定）含：首页 / 日记 / 杂谈 / 开发 / 归档 / 标签 / 关于
- 右上角是 GitHub 头像 + 名字「早坂直治」（主题 _config.yml 的 author 段）
- 标签用英文逗号分隔（Hexo 官方格式），categories 用 `[日记]` 数组格式

## 写日记规范
当用户说"写日记""记录一下今天""记个日记"等请求时，按以下流程执行：

1. 在 `source/_posts/` 新建 Markdown 文件，文件名建议带日期，例如 `2026-08-13.md`
2. front matter 使用以下格式：
   ---
   title: 自由起名（可用日期或自定义标题）
   date: YYYY-MM-DD HH:mm:ss
   categories: [日记]
   tags: [日记]
   ---
3. 正文用中文，语气自然真诚，记录当天的事、想法或学习内容
4. 写完直接发布（不存草稿），除非用户特别说明要存草稿

## 发布流程
部署命令只能在用户自己的 PowerShell 里执行（沙盒 git 有文件锁问题）。
已提供一键脚本 `deploy.ps1`（UTF-8 BOM，含中文，支持 -AlsoBackup 参数）：

cd D:\Hayasaka_Blog\blog
.\deploy.ps1              # 只部署网站
.\deploy.ps1 -AlsoBackup  # 部署后顺便备份源码到 main 分支

（等价的手动命令：hexo clean && hexo g && hexo d）

## 重要提醒
- 用 Write/Edit 工具写文件会随机截断，务必改用 bash heredoc 写文件，写完后用 `cat -A` 或 `tail` 验证内容完整
- deploy 走 HTTPS + Personal Access Token 认证，部署分支是 master
- 沙盒里跑 `hexo g` 前需先删掉 db.json（EPERM 文件锁），可用 `rm -f db.json`（已授权删除）
- 主题 _config.yml 新增了 author（头像/名字）和 columns（专栏卡片）配置，menu 里有分类入口
