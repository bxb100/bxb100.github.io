---
title: Tailscale 和 Surge 冲突的解决方案
pubDatetime: 2024-06-28T08:24:31.000Z
modDatetime: 2024-07-02T08:04:42.000Z
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

- tailscale 与 surge 增强模式冲突, 关闭 tailscale 的 DNS setting 或者增强模式解决

[^1]: https://tailscale.com/kb/1015/100.x-addresses
