---
title: telegram api 的一些坑
pubDatetime: 2024-12-04T05:31:39.000Z
modDatetime: 2024-12-04T05:31:47.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/61
tags:
  - DEV
  - 就是玩
---

- `edit_message_text` 的时候会导致原有的 `entities` 或者 `parse_mode` 失效
  - 前提是 `<a href="javascript:;">{}</a>`
  - 解决方案是编辑的时候替换为消息链接 `https://t.me/xxx/xxx`
- https://core.telegram.org/bots/webapps#keyboard-button-mini-apps 的 `sendData` 只会在 `keyboard_button` 下生效
  ![image](https://github.com/user-attachments/assets/ab48cc42-3b42-4305-b8ac-115bea0c3bfb)
- 使用 `webhook` 的时候注意 cf 是否设置 [WAF](https://developers.cloudflare.com/waf/) 保护, 可以通过 website → Security → Events 看 IP 段 `149.154.160.0/20` and `91.108.4.0/22`[^1] 是否被屏蔽了
  - 可以通过 Custom Rules **skip** telegram 请求的 IP 段来解决
      <img width="1077" alt="image 1" src="https://github.com/user-attachments/assets/f0d383be-35f0-4e14-9481-eb59e24276c5">

[^1]: https://core.telegram.org/bots/webhooks#the-short-version
