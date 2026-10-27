---
title: 51 个测试，和一个没过的握手
date: 2026-10-27 22:30:00
weather: 阴 21°C
categories: [开发]
tags: [开发, Rust, 逆向, STM32, FlyMcu]
---

FlyMcu 是我烧 STM32 用的老工具。程序编译于 2014 年，串口、DTR/RTS、Hex 文件、擦除、写选项字节，一套都在。用久了会想知道它到底怎么和芯片说话。今天顺着这个念头，把它拆开看了一遍，又用 Rust 重写了一遍。

## 先逆向

目标 `FlyMcu.exe`，PE32 / i386，2,652,672 字节，2014-09-02 编译。`inspect_managed_artifact` 判定不是 .NET，`.text` 熵 6.49，导入表 12 个 DLL / 468 个函数，没加壳。资源里有 `DVCLAL`、`CHARTABLE`、`TABOUTBOX`，字符串里有 Borland、CodeGear、Embarcadero——Delphi/VCL 写的。导出表把单元名漏了出来：`Unit1/2/6/7/8/11/13`、`Unit_MSP430_Setting`、`Unit_STM32FOptionBytes`、`Unit_STM32F2_F4OptionBytes`、`Cppfunc`。十二个内嵌窗口，主窗 `TeagleispForm` 是六页 PageControl，默认停在 STM32 ISP 页。

REA 自己不带反编译引擎，得接 Ghidra。装 Ghidra 12.1.4，设 `GHIDRA_INSTALL_DIR`，headless 导入分析 57 秒。之后写几个小脚本：按地址反编译函数、按常量找引用、按字符串找代码、查调用者和参数。串口是原生 Win32：`DCB` 的 `ByteSize=8`、`Parity=0`、`StopBits=0`，也就是 8N1；DTR/RTS 用 `EscapeCommFunction`。原版的事实一条条对出来：

- 传统擦除命令 `0x43` 的数据段是 `FF 00`，没有校验字节；扩展擦除是 `FF FF 00`
- `GET`（0x00）在 `GET ID`（0x02）之前
- `GET ID` 接受 2 字节或 4 字节 PID
- 复位后等 100ms，命令前 20ms 静默加 `PurgeComm`

## 再重写

Rust workspace，三个 crate：

- `flymcu-core`：协议和镜像处理，不依赖串口。`Transport` 是一个字节管道 trait，`Traced<T>` 记录十六进制收发，`cancel` 在帧边界协作取消；`isp/stm32.rs` 是 AN3155 命令集，`isp/probe.rs` 做容错识别，`isp/device.rs` 存 PID 表、页布局和 Flash 窗口；`reset.rs` 是 13 种 DTR/RTS 策略；`image.rs` / `hexfile.rs` 处理分段镜像和 Intel HEX / S-record / BIN；`session.rs` 是两个前端共用的操作层。
- `flymcu-cli`：clap，16 个子命令，包括 `probe` 和 `raw`。
- `flymcu-gui`：eframe/egui 0.37，双语，六个标签页，其中三个真的能用；任务跑在后台线程，日志和进度实时回传。

镜像按 4 字节对齐、最多 256 字节一块往外发，XOR 校验；13 种复位策略对应原版下拉框的 13 个组合。测试用模拟 bootloader 解析线格式，51 项全过，clippy 零警告。release 开 LTO、单 codegen unit、strip，图标和 VERSIONINFO 由 `build.rs` 用 `winresource` 打进去。没实现的分支——NXP LPC、STM8、MSP430、Option Bytes 编辑器——在 GUI 里禁用并写明，不做假按钮。

## 上板

软件全绿，上板就翻车。原版能读到：

```
BootLoader Version:2.2
PID:00000414  STM32F10xxx_High-density
FLASH ROM size:256KB
```

我的程序同步得上，之后每条命令都不认。

先把握手拆到字节。发一个 `7F`，回 `79`；发第二个 `7F`，设备把它当成命令，等它的反码，沉默；发第三个 `7F`，设备把这个字节当成刚才那条命令的反码，不匹配，回 `1F`。所以 `Received:79 1F` 不是“设备回了两个字节”，是“一个 ACK，加一次错位后的 NACK”。奇数个 `7F` 才让设备回到等命令的状态。0.2.0 发十个（偶数），卡在等反码；0.2.1 发一个，状态干净但初始化没完成；0.2.3 发三个，字节流和原版一致。

但同步对了，命令还是“第一次沉默、重试 NACK”。这个模式不像芯片拒绝命令——不支持的命令会立刻 NACK——更像同步后还剩一个字节的错位。原版反编译又给了一个反直觉的细节：它调同步的参数是 `param_2 = 1000000`，不是“发三个就停”，而是连续发 `7F`，直到连续五次 200ms 读空才结束；`79 1F` 只是那一轮碰巧收到的两个字节。

中间做了一轮 17 项代码审查，抓到两个真问题：`program()` 把扩展擦除 `0x44` 硬编码成 true，没有回退到传统 `0x43`；GUI 上那个“传统擦除命令 0x43”复选框只对“擦除整片”生效，对“烧写”根本没接上。还有一个：`Detect` 把 `GET`（0x00）当成必需步骤，但识别芯片靠的是 `GET ID`（0x02），有些 clone 或老 bootloader 对 0x00 直接沉默。都改了。

## 归档

最后还是没把这块板子烧进去。0.2.4 的 trace 停在：

```
TX 7F     RX 79
TX 7F     RX <timeout>
TX 7F     RX 1F
TX 01 FE  RX <timeout 2000>
TX 01 FE  RX 1F
TX 00 FF  RX <timeout 2000>
TX 00 FF  RX 1F
TX 02 FD  RX 1F
```

同步的形状和原版逐字节一致，后面每条命令都是先沉默、重试立刻 NACK。我留了一个 `raw` 子命令，可以复位、同步，然后原样发一串十六进制，原样打印收到的一切。三条命令、两分钟，就能判断是不是差一个填充字节：

```
flymcu.exe -p COM22 --reset 3 raw --hex "02 FD"
flymcu.exe -p COM22 --reset 3 raw --hex "7F 02 FD"
flymcu.exe -p COM22 --reset 3 raw --hex "7F 7F 02 FD"
```

结果写进 `ARCHIVE.md`：源码 zip 103KB（不含 target），dist 里 0.2.4 的可执行版和发布包，51 项测试、clippy 干净、构建和打包命令、Ghidra 项目和分析脚本的位置、与原版对照确认过的事实表，以及恢复时的第一步。

今天在这块板子上判断错了三次：先怀疑 clone 芯片，再照抄反编译里的循环引入回归，最后把“发三个字节”当成结论——只对了一半。真正推动进展的不是推理，是两样东西：字节级 trace，和原版程序的对照输出。反编译给的是结构，不是状态；硬件问题最后要靠线上的字节定案。

项目归档了，bug 没解决。这不算圆满，但归档文档把“哪里断了、怎么验证、下一步看哪个函数”写清楚了。四千行代码、51 个测试是真的，那个没过的握手也是真的。以后想接着弄，从 `ARCHIVE.md` 第 7 节进。
