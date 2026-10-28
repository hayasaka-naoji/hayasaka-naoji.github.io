---
title: 菱形、缺失的 DLL，和 37 个字符
date: 2026-10-28 22:10:00
weather: 阴 21°C
categories: [开发]
tags: [开发, Windows, 编码, FlyMcu]
---

FlyMcu 是我烧 STM32 的老工具——2014 年的 Delphi 程序，昨天刚逆过它的协议。今晚打开，满屏菱形：标题成了 `FlyMcu V0.188--◆◆◆◆◆◆◆◆◆◆--www.mcuisp.com`，按钮、菜单、下拉框一个都不认识，但 `bps:115200`、`STMISP`、`.hex` 这些 ASCII 一个都没坏。

ASCII 正常、非 ASCII 全坏，这不是字体缺失，也不是程序损坏，是编码。

## 病灶在系统，不在程序

先看系统区域：

```powershell
Get-WinSystemLocale | Select-Object Name, DisplayName
# Name: zh-CN   DisplayName: Chinese (Simplified, PRC)
```

区域是中国没错，再看代码页：

```
ACP   = 65001
OEMCP = 65001
MACCP = 65001
```

中文系统的 ANSI 代码页应该是 **936**（GBK）。65001 是 UTF-8——这台机器开了「Beta: 使用 Unicode UTF-8 提供全球语言支持」。FlyMcu 的界面字符串是 GBK 字节，程序请 Windows 按 ACP 解码，结果被当成 UTF-8，几乎全部非法，替换成 U+FFFD，渲染出来就是一排菱形。

两条路：关掉那个 Beta 开关（ACP 回到 936，但要重启），或者按进程模拟区域。选后者。

## 第一站：Locale Emulator，被一个缺失的 DLL 拦下

按进程模拟区域的老牌工具是 Locale Emulator（LE），从 GitHub 拿 2.5.0.1 的包。

解压，`LEProc.exe` 一跑就退，应用日志里 .NET 运行时抛 `System.IO.FileNotFoundException`，堆栈只有一行 `LEProc.Program.Main`，连异常消息都打印不出来（ToString 自己失败了）。

用 32 位 PowerShell 反射调它的 `Main`，把真实异常挖出来：

```powershell
$asm = [Reflection.Assembly]::LoadFile('LEProc.exe')
$m = $asm.GetType('LEProc.Program').GetMethod('Main')
try { $m.Invoke($null, @(,[string[]]@('-leversion'))) }
catch { ($_.Exception.GetBaseException()).Message }
# Could not load file or assembly 'LECommonLibrary, Version=0.0.0.0,
# Culture=neutral, PublicKeyToken=a5ce8326c28d7c91' or one of its dependencies.
```

`LECommonLibrary.dll` 不在包里。我又去核对了 GitHub 上 2.4.0.0、2.4.1.0、2.5.0.1 三个版本的 zip 中央目录——**都没有这个文件**。不是下载坏了，是上游打包就缺（下载量三百万，只能说大部分人用的是别处的整合包）。从第三方补一个来路不明的 DLL 不可控，放弃。

## 第二站：Locale Remulator

换代用品：Locale Remulator（LR），基于 Detours 的同类工具，x86/x64 都管，1.6.0 还在维护。

首次运行 `LRProc.exe` 会在自己目录下生成 `LRConfig.xml`，预置日文、韩文、繁体中文，**没有简体中文**。照着格式加一条：

```xml
<Profile Name="中文(简体)" Guid="0a7d3e14-6b2f-4c85-9a41-2e5d8f7b1c93">
  <Location>zh-CN</Location>
  <CodePage>936</CodePage>
  <LCID>2052</LCID>
  <TimeZone>China Standard Time</TimeZone>
  <Bias>480</Bias>
  <RunAsAdmin>false</RunAsAdmin>
  <HookIME>false</HookIME>
  <HookLCID>false</HookLCID>
</Profile>
```

用法就一句：`LRProc.exe GUID "目标.exe"`。

第一次跑起来，界面干净了——但变成英文，`MCU In System Programmer`。

## 坑一：HookLCID 一开，中文变英文

LR 的 `HookLCID` 决定要不要连 LCID 一起模拟。照默认开着，FlyMcu 直接切英文资源；改成 `false`（只钩代码页），FlyMcu 按真实系统 LCID 判断出中文、加载中文资源，再交给 936 解码——满屏正常中文。

判据记下来：**只管代码页，别动 LCID**。语言选择交给程序自己判断，区域工具只负责让它"解对码"。

## 坑二：快捷方式双击没反应

给桌面做个快捷方式指向 `LRProc.exe`，双击——没有窗口、没有报错、进程列表里空无一物。

排查过程比较笨但有效：

- notepad 快捷方式正常 → `.lnk` 机制没坏
- `.bat` 里同步调 `LRProc.exe` 并接上日志，它 **0.1 秒 exit 0** → 不是没启动，是启动完自己退了
- 同样的命令从 PowerShell `Start-Process` 直接调，完全正常

差别只剩一个：**参数里 GUID 有没有引号**。对照实验：

```powershell
# 不带引号 —— 正常拉起 FlyMcu
Start-Process LRProc.exe -ArgumentList '0a7d3e14-6b2f-4c85-9a41-2e5d8f7b1c93', '"D:\...\FlyMcu.exe"'
# GUID 带引号 —— 静默失败
Start-Process LRProc.exe -ArgumentList '"0a7d3e14-6b2f-4c85-9a41-2e5d8f7b1c93"', '"D:\...\FlyMcu.exe"'
```

把 `LRProc.cpp` 拉下来看源码，问题写在第 20、54、55 行：

```cpp
const int GuidLength = 37;
// ...
lpCmdLine = wcsstr(lpCmdLine, __wargv[1]);
LPWSTR CommandLine = lpCmdLine + GuidLength;
```

它找到 GUID 在原始命令行里的位置，**硬编码跳过 37 个字符**，把剩下的一段当成要启动的命令行交给 `DetourCreateProcessWithDllExW`。

GUID 是 36 个字符，加一个空格正好 37。不写引号时，跳过 GUID 和它后面的空格，剩下的命令行以 `"` 开头，CreateProcess 解析正常。一旦写成 `"GUID"`，`wcsstr` 找到的位置在左引号之后，多出来的右引号把偏移整体推后一位——跳过 37 个字符落在空格上，剩下的命令行变成**前导空格 + 路径**，这条路就走不通了。而 `DetourCreateProcessWithDllExW` 的返回值**根本没人检查**，函数直接 `return 0`。

于是所有症状都成立：exit 0、无输出、无进程、无窗口。不是环境问题，是"魔数偏移 + 忽略返回值"的经典组合。

修法：快捷方式参数里 GUID 不加引号。

```
C:\...\LRProc.exe 0a7d3e14-6b2f-4c85-9a41-2e5d8f7b1c93 "D:\Serial Port Tool\FlyMcu\FlyMcu.exe"
```

中间还有一段弯路值得一提：我一度顺着"LRProc 是 x64、hook DLL 分 x86/x64，那它可能根本注入不了 32 位程序"往下查，因为 `Get-Process` 给出的模块列表里看不到任何 hook DLL——后来发现这个进程模块枚举本身就不完整（一个 GUI 进程只列出 7 个模块），差点误判。**工具给出的"没有"，要先验证它测得准不准。**

## 验收

验证窗口文字有个小技巧：控制台自己的编码也可能是坏的（这台机器 ACP=65001），直接打印中文会二次失真。改成打印 UTF-8 的 base64：

```powershell
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($title))
# Rmx5TWN1IFYwLjE4OC0t5Y2V54mH5py65Zyo57q/57yW56iL5LiT5a62LS13d3cubWN1aXNwLmNvbQ==
# → FlyMcu V0.188--单片机在线编程专家--www.mcuisp.com
```

现在桌面「FlyMcu 中文」快捷方式双击即用，另留了一个 `launch_flymcu_cn.bat` 备用；之前失败的 LE 目录和调试脚本全部清掉。

## 三条可复用的

1. **判断乱码先看分层**：ASCII 正常、非 ASCII 全坏 → 是编码，不是字体。查 `HKLM\SYSTEM\CurrentControlSet\Control\Nls\CodePage` 的 `ACP`，中文系统应为 936；65001 就是 UTF-8 Beta 开了。
2. **上游的包可能真的是坏的**：LE 缺 `LECommonLibrary.dll`，三个版本都缺。核对 zip 中央目录，比反复重装快得多。
3. **静默 exit 0 优先怀疑"忽略返回值"**：这次是 37 字符偏移加未检查的 Detours 返回值，把失败伪装成了成功。能读源码就读；读不到就做参数对照实验，一次只变一个变量。

昨天那篇 Rust 重写还停在握手，原版程序暂时退不了休。但至少今天，先把它的中文界面还回来了。
