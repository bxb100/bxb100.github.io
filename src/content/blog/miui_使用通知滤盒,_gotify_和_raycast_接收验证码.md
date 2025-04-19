---
title: miui 使用通知滤盒, gotify 和 raycast 接收验证码
pubDatetime: 2025-04-18T19:14:52.000Z
modDatetime: 2025-04-19T06:59:12.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/65
tags:
  - 就是玩
---

## 通知滤盒 webhook 配置

安装 https://play.google.com/store/apps/details?id=com.catchingnow.np

### WEBHOOK 配置

- 高级匹配(JSON)

```json
{
  "match": "ALL",
  "node": [
    {
      "field": "miui.focus.param",
      "regex": "验证码"
    },
    {
      "field": "verify_code",
      "regex": ".+"
    }
  ]
}
```

- URL: `https://gotify-domain/message?token=xxxx`
- Method: `POST`

```json
{
  "extras": {
    "metadata::type": "2fa"
  },
  "message": "{verify_code}",
  "priority": 0,
  "title": "{android.title}"
}
```

## Raycast gotify

安装 https://github.com/bxb100/raycast-gotify

<img width="774" alt="Image" src="https://github.com/user-attachments/assets/01f91112-929d-40f7-a2a3-9d12ee5b39b7" />
