---
title: sgcc_electricity 和 tailscale 使用的踩坑
pubDatetime: 2024-08-03T17:15:14.000Z
modDatetime: 2024-08-03T17:15:25.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/58
tags:
  - 就是玩
---

使用 https://github.com/liantianji/sgcc_electricity docker compose 和 tailscale docker 的时候, 想使用 sidecar, 但是尝试过很多遍, 发现只能组 tailscale 的网, 无法 ping 通外网, 看 `/etc/resolv.conf` 只有 `127.0.0.1`

然后想到可以直接在宿主机上直接 `tailscale up` 但是又出现了一个问题, 那就是只要 `up` 后就无法解析 DNS[^1], 只好 override 成 `223.6.6.6`

然后 sgcc 的配置问题

1. 我是多账户, 然后根据文档配置的时候, 发现有部分 `entity_id` 没有在 `event_data` 下
2. `最近一天用电量` 的 homeAssistant 的 entity id 不是 `last_electricity_usage_entity_配置的户号` 而是 `sensor.zui_jin_yi_tian_yong_dian_liang` `sensor.zui_jin_yi_tian_yong_dian_liang_2` 这样的形式
3. `states('sensor.electricity_charge_balance_配置的户号')` 是 string 转为 `int()`

![image](https://github.com/user-attachments/assets/b8cb133d-430b-4840-9b38-cd4bac0fd92d)

[^1]: https://github.com/tailscale/tailscale/issues/5287
