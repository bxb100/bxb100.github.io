---
title: Tailscale 和 Surge 冲突的解决方案
pubDatetime: 2024-06-28T08:24:31.000Z
modDatetime: 2024-07-02T08:46:19.000Z
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

- 如果需要 tailscale magic DNS 的 search domain (自动添加 tailnet domain 如我这里是 xx.sxx-xxt.ts.net), 和 tailscale 的增强模式是冲突的, 也就是所有都走 surge `198.18.0.2`, 目前的解决方法: - 关闭 tailscale 的 DNS, 复制主机的 ip `100.xx.xx.xx` - Surge 设置域名 `xx` 策略是 tailscale (上面设置的 proxy) - Surge 本地 DNS 设置 `xx` A IN `100.xx.xx.xx`
  > 由于我在 wireshark 中抓取不到 DNS query 记录, 所以猜测二者 DNS 处理方式的冲突

[^1]: https://tailscale.com/kb/1015/100.x-addresses
