---
title: android 使用通知滤盒, gotify 和 raycast 接收验证码
pubDatetime: 2025-04-18T19:14:52.000Z
modDatetime: 2025-04-21T10:12:54.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/65
tags:
  - 就是玩
---

<details>

<summary>还是使用下面的 regex 比较好</summary>

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

</details>

---

<a id='issuecomment-2818097228'></a>
发现 MIUI 解析国外的验证码短信, 更新迭代了一下

### 通知滤盒配置

```json
{
  "rules": [
    {
      "actions": [
        {
          "delay_time": 0,
          "dismissed_notify": false,
          "force_mute": false,
          "include_ongoing": false,
          "later_time": 0,
          "notify_action": {
            "notify_screen_off": 0,
            "notify_screen_on": 0
          },
          "tts_action": {
            "bypass_dnd": true,
            "distinct_duration": 5000
          },
          "type": -1001,
          "webhook": {
            "body": "{\n\t\"title\": \"{android.title}\",\n\t\"message\": \"{android.text}\",\n\t\"priority\": 100,\n\t\"extras\": {\n\t  \"metadata::type\": \"2fa\",\n\t  \"metadata::extract::regex\": \"(?<=([^\\\\d\\\\*a-z]|^))(\\\\d{6}|\\\\d{5}|\\\\d{4}|\\\\d{3} \\\\d{3})(?=([^年円元\\\\/\\\\da-z-?\\\\.:]|(\\\\.($|[^\\\\da-z]))|$))\"\n\t}\n  }",
            "distinct": true,
            "headers": "Content-Type: application/json; charset=utf-8",
            "method": 0,
            "url": "https://gotify-domain/message?token=xxxx"
          }
        }
      ],
      "appCondition": {
        "appUIDs": [
          {
            "packageName": "com.android.mms",
            "stability": 0,
            "user": 0
          }
        ],
        "type": 0
      },
      "chargeCondition": {
        "mask": 15,
        "type": 0
      },
      "description": "短信",
      "disable": false,
      "id": 2636,
      "last_change": 1745229170487,
      "screenCondition": {
        "type": 0
      },
      "textCondition": {
        "ignoreCase": true,
        "regex": "(?<=([^\\d\\*a-z]|^))(\\d{6}|\\d{5}|\\d{4}|\\d{3} \\d{3})(?=([^年円元\\\\/\\da-z-?\\.:]|(\\.($|[^\\da-z]))|$))",
        "strs": [],
        "strs1": [],
        "strs2": [],
        "type": 3
      },
      "timeCondition": {
        "end": 0,
        "start": 0
      },
      "version": 1,
      "weekCondition": {
        "days": [1, 2, 3, 4, 5, 6, 7]
      }
    }
  ],
  "uid": "AEB7B6-6247A7-DDE981"
}
```

---

<p align="center">
<img width="774" alt="Image" src="https://github.com/user-attachments/assets/f837607a-c831-41d4-8720-d69bcd37d1ee" />
</p>
