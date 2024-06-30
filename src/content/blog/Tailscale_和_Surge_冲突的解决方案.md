---
title: Tailscale 和 Surge 冲突的解决方案
pubDatetime: 2024-06-28T08:24:31.000Z
modDatetime: 2024-06-30T08:38:54.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/55
tags:
  - 就是玩
---

参考: https://community.nssurge.com/d/1094-tailscale/39

---

- 首先获得 tailscale 的虚拟网卡, 使用 `ifconfig` 获取 ipv4 地址是 100.x.x.x[^1], 我这里是 `utun5`
- 然后再 Surge 的配置中添加如下 (目前看起来, 这个也支持 tailscale DNS)

```conf
[Proxy]
tailscale=direct, interface=utun5

[Rule]
IP-CIDR,100.64.0.0/10, tailscale, no-resolve
```

- 如果包含自定义的 Proxy, 无法使用 `#! Root.conf`, 需要手动添加, 其它托管的代理的话, 直接 `#! Root.conf, xx.conf` 即可

---

<a id='issuecomment-2196467119'></a>

## 出现的问题

- tailscale 需要在 Surge 启动后再启动
  - 或者关闭**增强模式**然后等待 tailscale 连接上后再启动, 目前稳定这个方式稳定运行, 目前不知道如何解决这个虚拟网卡冲突的问题
- 如果非常慢, 需要先关 Surge 让 DNS 重新缓存

[^1]: https://tailscale.com/kb/1015/100.x-addresses
