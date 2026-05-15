---
title: Tailscale 和 Surge 冲突的解决方案
pubDatetime: 2024-06-28T08:24:31.000Z
modDatetime: 2026-05-15T09:28:16.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/55
tags:
  - 就是玩
---

<details>
<summary>outdated</summary>

~~update: 20241118: 现版本的 surge 5.9.1 使用系统 VPN, 和 tailscale 已经不冲突了~~

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

</details>

---

<a id='issuecomment-2196467119'></a>

<details><summary>outdated</summary>
<p>

## 出现的问题

> ! 直接设置 host 更简单
> 由于我在 wireshark 中抓取不到 DNS query 记录, 所以下面都是猜测

- 如果需要 tailscale magic DNS 的 search domain (自动添加 tailnet domain 如我这里是 xx.sxx-xxt.ts.net), 和 tailscale 的增强模式是冲突的, 也就是所有都走 surge `198.18.0.2`, 目前的解决方法:
  - 关闭 tailscale 的 DNS, 复制主机的 ip `100.xx.xx.xx`
  - Surge 设置域名 `xx` 策略是 tailscale (上面设置的 proxy)
  - Surge 本地 DNS 设置 `xx` A IN `100.xx.xx.xx`

</p>
</details>

---

<a id='issuecomment-4169929454'></a>
😢 1.9x 之后频繁出现了 DNS 解析不走 surge 的问题, 所以我怀疑之前的操作和认识是错误的, 现在改用 `userspace-networking`[^2] 方案来兼容 surge 以及 Android 的 clash

## MacOS 设置的方案

1. homebrew 安装 tailscale[^3], 注意一定要先卸载 tailscale app, 删除 trash 然后重启
2. 改写 `homebrew.mxcl.tailscale.plist`[^4]

```diff
	<key>ProgramArguments</key>
	<array>
		<string>/opt/homebrew/opt/tailscale/bin/tailscaled</string>
+		<string>--tun=userspace-networking</string>
+		<string>--socks5-server=localhost:1055</string>
	</array>
```

3. `sudo brew services start tailscale`
4. `sudo tailscale up --auth-key=xxxx`[^5] (update: 发现 up 之后再用 `sudo tailscale login` 也行, 这样是不是重启之后无需再配置? 🤔 我再观察一下)
5. 配置一个 `tailscale-socket = socks5, 127.0.0.1, 1055` 代理, 然后手动配置规则将 `100.64.0.0/10` 转向这个 socks5 代理 (注意这时候因为没有 nameserver 所以 ns.net 都需要自己手动配置 host/规则)

## Android 配置

1. 安装 https://github.com/Asutorufa/tailscaled-socks5-android
2. 同样配置 sock 代理和对应的规则到 clash 即可

update: 上游已合并 https://github.com/MetaCubeX/mihomo/pull/2786

---

<a id='issuecomment-4251154574'></a>

> [!WARNING]
> 使用过程中发现没法使用 IpV6 所以导致无法打洞

电信

启动 ipv6, vif ipv6 always, 使用系统 DNS, 不使用 DoH, 目前能够直连

待观察代理会不会出现问题

[^1]: https://tailscale.com/kb/1015/100.x-addresses

[^2]: https://tailscale.com/docs/concepts/userspace-networking

[^3]: https://github.com/tailscale/tailscale/wiki/Tailscaled-on-macOS

[^4]: https://github.com/tailscale/tailscale/issues/10558#issuecomment-2065390858

[^5]: https://login.tailscale.com/admin/settings/keys
