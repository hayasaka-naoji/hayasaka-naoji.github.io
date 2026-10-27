---
title: 从 80 KB/s 到 3 MB/s
date: 2026-10-27 22:00:00
weather: 阴 21°C
categories: [开发]
tags: [开发, PlatformIO, ESP32, STM32, 工具链]
---

新开一个 ESP32-S3 项目，点下创建，等来的不是编译按钮，是一行 `MissingPackageManifestError: Could not find one of 'package.json' manifest files in the package`。

先修这个错。`framework-arduinoespressif32-esp32s3-libs` 这个包只解压了一半，目录在，清单文件不在。PIO 解析依赖时找不到 `package.json`，于是把整个项目判死。删掉这一个包重装，顺带补上 `tool-esptool` 和 `tool-scons`，再把创建中断留下的空 `src/main.cpp` 补上，编译过了：RAM 6.6%，Flash 8.1%。

项目能编译，编辑器还在报红。`c_cpp_properties.json` 的 `includePath` 指向 `esp_system/port/soc` 和 `esp_matter/.../bluedroid`，这两个目录在预编译库里根本不存在。GCC 对不存在的 `-I` 是静默忽略的，所以编译没事；只是 C/C++ 插件认真，逐条检查存在性。删掉这四条，再把平台 `flags/includes` 里的两条 `-iwithprefixbefore` 也删掉，否则下次“更新项目配置”又会长回来。

比报错更隐蔽的是两个核心。终端里的 `pio` 是 scoop 装的 6.1.19，VSCode 插件自带的是 `~/.platformio/penv` 里的 6.2.0。两者共用一个包缓存，但要的 `tool-scons` 版本不同，于是每次交叉使用都触发一次装卸。最开始那个缺 `package.json` 的坏包，很可能就是这种并发或中断安装留下的。把 scoop 里那份卸掉，只留 6.2.0，警告消失。

还有包锁。PIO Home 里连点了两次 STM32 平台安装，19:15 和 19:20 各一个任务，都持有 `~/.platformio/packages.lock`。后一个只能排队，界面看起来像卡死。更糟的是它们都在直连，ARM 工具链下到 104MB / 120MB 时速度只有 50 KB/s。

于是测速。同一个文件：

| 下载路径 | 实测速度 |
|---|---:|
| 直连 PlatformIO 德国服务器 | 约 82 KB/s |
| 走本机 xray 的 HTTP 代理 | 约 3.2 MB/s |
| 走 SOCKS5 | 约 4.0 MB/s |
| PIO 自己的下载组件 | 约 4.9 MB/s |

差了四十倍。

包也确实大。ESP32 Arduino 环境这次实际下了约 1.5GB 压缩包：Xtensa 工具链压缩 401MB、解压 1.42GB；RISC-V 工具链解压 2.4GB；ESP32-S3 的 Arduino 预编译库 324MB；再加两个 GDB、Arduino 核心、esptool。`~/.platformio/packages` 现在 4.3GB，下载缓存 1.5GB。按 60~80 KB/s 算，1.5GB 正好六到七个小时，和 11:51 开始、18:50 装完的时间线对得上。

慢不是错觉，是 1.5GB 走了一条 80 KB/s 的路。

系统代理是开着的，PIO 的 Python 进程也读到了 `127.0.0.1:10808`，但安装那段时间实际速率和直连一样。代理只在建立连接时生效，已经开始的下载不会中途切换；要它走代理，只能取消重来，并在启动前把 `HTTP_PROXY` / `HTTPS_PROXY` 显式放进环境变量。

用代理重装：STM32 平台 20.0.0（297 个板型）从 20:39:17 到 20:41:28，两分钟；ESP8266 平台 4.2.1（45 个板型）从 20:49 到 20:51，也是两分钟，实测 0.9 MB/s。ESP32 平台 8.0.0 共 314 个板型。`tool-esptool` 1.413.0 装在单独的 `tool-esptool@1.413.0` 目录，ESP32 用的 2.50400.0 原样保留，两个版本并存不打架。

把这套流程写成了一个技能和一份说明：读系统代理、检查端口、设环境变量、装平台、看连接是不是 `127.0.0.1:10808`、估速度，以及包锁排队、坏包、多核心这些坑。以后新机器上再装，不用重新踩一遍。

今天学到的几条，和嵌入式里那些规矩其实是一套：

- **一个核心。** 两个 PIO Core 共用一个包缓存，工具版本会来回装卸。
- **一次一个安装。** 包锁是全局的，重复点击只会排队。
- **代理要显式。** 系统代理不一定生效，`HTTP_PROXY` / `HTTPS_PROXY` 最可靠。
- **缓存不要删。** `packages` 和 `.cache/downloads` 会被复用；只有 `.cache/tmp` 里的中断残留可以清。
- **全局安装只装必需包。** Arduino 框架这类可选包，等项目第一次构建时再按需下。

工具链的问题最后都能归到两个问题：谁在干活，走哪条路。把两个司机减成一个，把 80 KB/s 换成 3 MB/s，一天就回来了。
