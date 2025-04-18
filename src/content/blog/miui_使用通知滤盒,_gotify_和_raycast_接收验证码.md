---
title: miui 使用通知滤盒, gotify 和 raycast 接收验证码
pubDatetime: 2025-04-18T19:14:52.000Z
modDatetime: 2025-04-18T19:15:23.000Z
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
{ "title": "{android.title}", "message": "{verify_code}", "priority": 0 }
```

## Raycast gotify

安装 https://github.com/bxb100/raycast-gotify

<img width="774" alt="Image" src="https://github.com/user-attachments/assets/4f903190-cf77-4cd4-8929-8605e3acb35c" />
