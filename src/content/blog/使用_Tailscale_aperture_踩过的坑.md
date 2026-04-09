---
title: 使用 Tailscale aperture 踩过的坑
pubDatetime: 2026-04-09T19:50:24.000Z
modDatetime: 2026-04-09T20:49:54.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/77
tags:
  - uncategorized
---

> 为什么要写呢, 主要是论坛里面 LLM gateway 都做了 gemini@openai 这种兼容词, 但是国外这些厂商 gateway 基本不做, 和以往的经验冲突, 所以写一下给后来人看下

文档太长不看: https://tailscale.com/docs/aperture

---

- aperture 和 cf 的 gateway 不一样的地方在于, 它的请求没有 provider id, 所以相同的 model name 会根据添加时候的 preference 值来确定, 并且我不知道它有没有 load balance, 我觉得大概率也是没有的

<img width="771" height="578" alt="Image" src="https://github.com/user-attachments/assets/ec0f5a83-4740-4d42-9d48-6ea6f928f24e" />

- 如果添加的时候使用 openai completion 那么请求就得是 `http://ai/v1/chat/completions`, 否则就会报 404[^1]

- 综上所述, opencode 配置[^2]注意使用不同的 `@ai-sdk/`

---

<a id='issuecomment-4217392129'></a>

- opencode 配置 provider 的时候注意一下几点, 否则不会显示出来
  1.  需要配置 apiKey
  2.  需要配置 models

[^1]: https://tailscale.com/docs/aperture#:~:text=The%20following%20table%20lists%20the%20supported%20API%20formats%3A

[^2]: https://tailscale.com/docs/aperture/how-to/set-up-opencode
