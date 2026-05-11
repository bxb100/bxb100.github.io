---
title: Sony NW-A100 系统更新
pubDatetime: 2026-05-11T14:07:21.000Z
modDatetime: 2026-05-11T14:07:33.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/80
tags:
  - uncategorized
---

年少无知的时候, 购入过一个 40 周年纪念版本 NW-A100TPS, 许久未用, 前几天突然更新后发现系统版本变成 4.08, 但是国际版只有 4.06, 尝试降级失败.

所以记录一下, 防止后续国际版本能追上来忘了咋弄.

---

根据少数派文章 [一日一技 | 给国行 NW-A306 Walkman 刷上国际版系统](https://sspai.com/post/79531) , 推断出有以下两个版本的系统更新信息:

- 国内版 https://info.update.sony.net/PA001/NW-A100Series_0003/info/info.xml
- 国际版 https://info.update.sony.net/PA001/NW-A100Series_0000/info/info.xml

获取系统固件:

```bash
curl -s https://info.update.sony.net/PA001/NW-A100Series_0000/info/info.xml | grep -w "<Distribution"
```

然后下载 UPG, 然后使用推送到机子上

```bash
adb push NW-A100_0000_V4_06_00_NW_WM_FW.UPG /sdcard
```

**关闭 wifi** 后直接去更新系统即可
