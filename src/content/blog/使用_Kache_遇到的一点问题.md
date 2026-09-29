---
title: 使用 Kache 遇到的一点问题
pubDatetime: 2026-09-29T23:13:01.000Z
modDatetime: 2026-09-29T23:13:09.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/82
tags:
  - uncategorized
---

- 配置中的 `local_max_size` 使用 [bytesize](https://docs.rs/bytesize/latest/bytesize/) 解析, 所以不写单位默认是 `bytes`, 这点可以使用 `kache config` tui 来配置
- kache 使用 `--remap-path-prefix`[^1] 来共享缓存, 可以使用如下命令来查看

```
dwarfdump --debug-info target/debug/*.dSYM | grep -m5 comp_dir
```

这时候就会发现, 有两种占位符 `/kache/workspace` 和 `/kache/.cargo`, 这就会导致在 IDE debug 的时候无法正确处理断点

在 zed 中, 可以使用配置 `.zed/debug.json`

```json
[
  {
    "label": "Build & Debug native binary",
    "build": {
      "command": "cargo",
      "args": ["build"]
    },
    "program": "$ZED_WORKTREE_ROOT/target/debug/bin-name",
    "sourceLanguages": ["rust"],
    "request": "launch",
    "adapter": "CodeLLDB",
    "sourceMap": {
      "/kache/workspace": "$ZED_WORKTREE_ROOT",
      "/kache/.cargo": "/your/home/path/.cargo"
    }
  }
]
```

但是 JetBrains 的 Rustrover 来说就没办法了, 它既不支持 `.lldbinit` 也不支持 `initCommands`, 所以想在其中 debug 的唯一方式就是关闭 `RUST_WARRPER`, 或者设置 `KACHE_RUSTC_PATH_NORMALIZE=0`

前者不适合, 毕竟目的就是用 kache, 后者会导致缓存不一致

[^1]: https://github.com/kunobi-ninja/kache/blob/main/src/compile.rs
