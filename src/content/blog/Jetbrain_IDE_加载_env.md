---
title: Jetbrain IDE  加载 env
pubDatetime: 2026-03-02T20:26:06.000Z
modDatetime: 2026-09-28T00:31:40.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/72
tags:
  - uncategorized
---

慢讯: Jetbrain 支持加载 env 文件了

more: https://youtrack-production.pub.aws.intellij.net/issue/IJPL-1055/Load-interactive-shell-environment-variables-on-Linux

社区版本代码引入在: https://github.com/JetBrains/intellij-community/commit/bd34c24f1c821ea4241677fbed8e4eff13a24c1f

在 JVM 配置: `-Dij.load.shell.env=true` 即可

---

为什么要提及这个, 因为我从 direnv 换到 mise 后发现 mise 插件某些语言不支持自动引入 mise.toml 的 env 配置 (比如 Rust, Just), 然后我想起来早先看到的这个配置还没有记录, 所以水一篇文

话又说回来, 所以 jetbrain 家 IDE 目前来看还是扔不掉 .env 配置文件啊, 我就奇怪为什么不做成 expose service 让插件自己塞值?

---

<a id='issuecomment-4412256690'></a>
然后我发现它是 APP 启动的时候加载, 而不是 project 级别的加载, 所以目前 Rust 还是用不了, 包括 mise[^1]

---

<a id='issuecomment-5861278093'></a>

> [!WARNING]
> `-Dij.load.shell.env.timeout` 设置过小会导致加载失败, 在 idea.log 中可以找到

```
om.intellij.util.ShellEnvironmentReader$EnvironmentReaderException: [/bin/zsh, -l, -i, -c, /usr/bin/env -0 > '/var/folders/vx/xs9f3rcj74d2wlp32sz0t0h80000gn/T/ij-shell-env-data.54370.132872668608125.tmp'], ec=1
```

可以参考 https://intellij-support.jetbrains.com/hc/en-us/articles/15268184143890-Shell-Environment-Loading 优化一下 zsh 配置

[^1]: https://github.com/134130/intellij-mise/issues/173
