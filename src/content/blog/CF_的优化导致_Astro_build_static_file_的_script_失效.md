
---
title: CF 的优化导致 Astro build static file 的 script 失效
pubDatetime: 2024-02-12T09:03:42.000Z
modDatetime: 2024-02-12T09:09:22.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/45
tags:
  - DEV

---

Astro build 后上传到 GitHub page 总是出现 script 被注释，然后刷新又好了的问题

1. post 页面的 script 从主页进入后发现 script scope 被注释掉
2. 查看原码有 script 但是被 cf 包裹，意识到可能是 cf 导致的问题
3. 进入 CF 的 `Configuration Rules` 关闭 `Auto Minify`, `Hotlink Protection`, `Email Obfuscation` `Security Level Essentially off`
4. 刷新生效

错误的尝试：
- 更新 node 版本 18 -> 20 -> 21
- 更新 astro 版本

教训：
凡事都得先从出错的最近一层的源码查找原因，本地测试成功后不要怀疑代码问题
