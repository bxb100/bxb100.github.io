---
title: sgcc_electricity 和 tailscale 使用的踩坑
pubDatetime: 2024-08-03T17:15:14.000Z
modDatetime: 2024-08-18T07:30:33.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/58
tags:
  - 就是玩
---

使用 https://github.com/liantianji/sgcc_electricity docker compose 和 tailscale docker 的时候, 想使用 sidecar, 但是尝试过很多遍, 发现只能组 tailscale 的网, 无法 ping 通外网, 看 `/etc/resolv.conf` 只有 `127.0.0.1`

然后想到可以直接在宿主机上直接 `tailscale up` 但是又出现了一个问题, 那就是只要 `up` 后就无法解析 DNS[^1] [^2] [^3]

<details>
  <summary>这里有个概念是 CGNAT, 这里贴一下 Claude 的回复</summary>

---

> CGNAT（Carrier-Grade NAT）是一种大规模网络地址转换技术，通常由互联网服务提供商（ISP）使用。CGNAT 使用的网段通常是私有 IP 地址范围。根据 RFC 1918，私有 IP 地址范围包括：

1. `10.0.0.0` 到 `10.255.255.255` (`10/8` prefix)
2. `172.16.0.0` 到 `172.31.255.255` (`172.16/12` prefix)
3. `192.168.0.0` 到 `192.168.255.255` (`192.168/16` prefix)

> 然而，对于 CGNAT，通常使用的是 `100.64.0.0/10` 网段。这个网段是由 RFC 6598 专门为 CGNAT 定义的，被称为"共享地址空间"或"运营商 NAT 空间"。
>
> 具体来说：

⦁ CGNAT 的网段：`100.64.0.0` 到 `100.127.255.255`
⦁ 子网掩码：`255.192.0.0`
⦁ CIDR 表示法：`100.64.0.0/10`

> 这个地址范围提供了约 400 万个 IP 地址，可以用于 CGNAT 环境。使用这个专用范围可以避免与其他常见的私有 IP 地址范围冲突，从而减少网络配置问题。
>
> 需要注意的是，虽然 `100.64.0.0/10` 是推荐用于 CGNAT 的网段，但一些 ISP 可能会选择使用其他私有 IP 地址范围，具体取决于他们的网络架构和需求

---

</details>

_update: 修改 iptables 的话也可以使用, 但是每次启动 tailscale 都需要重新修改, 所以重复几次后我就决定换 apt 源并开启 tailscale 的 override local DNS_

_update 2: 发现有个 `--netfilter-mode`[^4] 但是俺不知道如何确定这个起作用, openwrt 我完全陌生_

然后 sgcc 的配置问题

1. 我是多账户, 然后根据文档配置的时候, 发现有部分 `entity_id` 没有在 `event_data` 下
2. `最近一天用电量` 的 homeAssistant 的 entity id 不是 `last_electricity_usage_entity_配置的户号` 而是 `sensor.zui_jin_yi_tian_yong_dian_liang` `sensor.zui_jin_yi_tian_yong_dian_liang_2` 这样的形式
3. `states('sensor.electricity_charge_balance_配置的户号')` 是 string 转为 `int()`
4. 有的时候年度价格需要按照 **thousands separator format** 格式化, 参看 `{{ '{0:,.0f}'.format(123456789) }} ` [^5]

![image](https://github.com/user-attachments/assets/b8cb133d-430b-4840-9b38-cd4bac0fd92d)

---

<a id='issuecomment-2267200536'></a>
![cs drawio](https://github.com/user-attachments/assets/06abce43-3f2c-43f7-b558-de4f1a68849e)

<p align="center">上图三个 ISP; 红色 r2s, 蓝色阿里云 ECS, 绿色 laptop</p>

---

r2s 的 tailscale 配置按照 https://chenprime.xyz/blog/tailscale/ 设置 exitNode 是能正常代理上网的

> 论坛里面的讨论 https://s.v2ex.com/t/1040374 感觉也没真正说明白这个问题根源是什么

使用 `tailscale ping` 无法打洞, 参看文章 https://www.xiaotangren.cc/article/176/p2p-udp.html 知道是 NAT 设置有问题, 注意在路由中开启 DMZ 和 UPnP[^6] (当然有安全风险[^7])

_不过我没理解 NAT 连接和 DMZ 有啥关系, 照这么操作确实直接打洞成功, `tailscale ping` 没有 derp 中转_

---

<a id='issuecomment-2267353377'></a>
然后又出现了 tailscale 周期性使用 exit 无法联网的问题, 看了下 r2s 日志出现

_日志丢了, 只记得这一句_

```log
[Daemon.err odhcpd[868]: Failed to send to ff02::1%lan@br-lan
```

然后在 openWrt 论坛上[^8]发现下面的命令, 使用后 tailscale 就又可以使用 exit 翻墙了

```sh
uci -q delete network.@device[0].ipv6
uci commit network
/etc/init.d/network restart
```

~~但是很奇怪的地方是, `/etc/config/network` 没有被修改, 感觉是 `network restart` 起到了作用~~

update: 错误理解了 uci 的命令[^9], 并且论坛有大佬回复指出了这条命令的作用

> This starts odhcp6d and odhcp6d periodically multicasts on ff02::1 to announce itself, but fails because ipv6 is disabled on br-lan.
>
> So yes, `uci -q delete network.@device[0].ipv6` does remove this error.

[^1]: https://github.com/tailscale/tailscale/issues/5287

[^2]: https://muzhun.com/html/3817.html

[^3]: https://juejin.cn/post/7229923818348331045 iptables

[^4]: https://tailscale.com/kb/1241/tailscale-up

[^5]: https://community.home-assistant.io/t/add-a-separator-comma-to-thousands/22031/8

[^6]: https://www.sohu.com/a/525005569_121124375

[^7]: https://superuser.com/questions/17572/whats-dmz-used-for-in-a-home-wireless-router

[^8]: https://forum.openwrt.org/t/daemon-err-odhcpd-868-failed-to-send-to-ff02-1-lan-br-lan-network-unreachable/173060/6

[^9]: https://openwrt.org/docs/guide-user/base-system/uci
