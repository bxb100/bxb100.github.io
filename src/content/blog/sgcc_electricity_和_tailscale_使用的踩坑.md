---
title: sgcc_electricity 和 tailscale 使用的踩坑
pubDatetime: 2024-08-03T17:15:14.000Z
modDatetime: 2024-08-03T23:53:15.000Z
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
4. 有的时候年度价格需要按照 **thousands separator format** 格式化, 参看 `{{ '{0:,.0f}'.format(123456789) }} ` [^2]

![image](https://github.com/user-attachments/assets/b8cb133d-430b-4840-9b38-cd4bac0fd92d)

---

<a id='issuecomment-2267200536'></a>
![cs drawio](https://github.com/user-attachments/assets/06abce43-3f2c-43f7-b558-de4f1a68849e)

<p align="center">上图三个 ISP; 红色 r2s, 蓝色阿里云 ECS, 绿色 laptop</p>

---

r2s 的 tailscale 配置按照 https://chenprime.xyz/blog/tailscale/ 设置 exitNode 是能正常代理上网的

> 论坛里面的讨论 https://s.v2ex.com/t/1040374 感觉也没真正说明白这个问题根源是什么

使用 `tailscale ping` 无法打洞, 参看文章 https://www.xiaotangren.cc/article/176/p2p-udp.html 知道是 NAT 设置有问题, 注意在路由中开启 DMZ 和 UPnP[^3] (当然有安全风险[^4])

_不过我没理解 NAT 连接和 DMZ 有啥关系, 照这么操作确实直接打洞成功, `tailscale ping` 没有 derp 中转_

[^1]: https://github.com/tailscale/tailscale/issues/5287

[^2]: https://community.home-assistant.io/t/add-a-separator-comma-to-thousands/22031/8

[^3]: https://www.sohu.com/a/525005569_121124375

[^4]: https://superuser.com/questions/17572/whats-dmz-used-for-in-a-home-wireless-router
