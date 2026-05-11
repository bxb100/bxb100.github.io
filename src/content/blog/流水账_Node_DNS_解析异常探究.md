---
title: 流水账  Node DNS 解析异常探究
pubDatetime: 2024-05-10T15:43:05.000Z
modDatetime: 2026-05-10T13:05:32.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/53
tags:
  - uncategorized
---

## 前情提要

<img width="1145" alt="image" src="https://github.com/bxb100/bxb100.github.io/assets/20685961/5bdc266d-1245-4016-b27a-417554894874">

[Local subdomains on macOS with Dnsmasq and Caddy](https://maxschmitt.me/posts/local-subdomains-dnsmasq-caddy)

## 配置

- `dnsmasq` 配置 test => 127.0.0.1
- `caddy` 配置 ll.test => 127.0.0.1:8080
- 启动 `http-server`

## 思考过程

网页正常, 插件不正常, 我猜测可能是 DNS 在 `fetch` 命令下没有生效, 但是查询文档 `dns.lookup()`[^1], 其中有段文字写道

> For instance, [dns.lookup()](https://nodejs.org/api/dns.html#dnslookuphostname-options-callback) will almost always resolve a given name the same way as the ping command

那么我就猜呗

首先 `ping ll.test` 没 ping 通, 看到 Surge 代理开着, 寻思着有可能是它的问题, 关闭再测试, 还是不通, 最后发现没刷新 DNS 🃏

理理思路, 首先先确定 DNS 有没有起作用, `scutil --dns`[^2] 确定自定义的 nameserver 是在 DNS resolver 链里面, 然后查看 `nslookup` 文档

> Interactive mode is entered in the following cases:
>
>        1. when no arguments are given (the default name server
>           will be used)
>
>        2. when the first argument is a hyphen (-) and the second
>           argument is the host name or Internet address of a
>           name server.

那么首先知道 `nslookup ll.test` 应该要无法解析, 然后才能让后面 `nameserver` 来 resolver

```shell
nslookup ll.test
Server:		198.18.0.2
Address:	198.18.0.2#53

Non-authoritative answer:
Name:	ll.test
Address: 198.18.2.181
```

又被 Surge gank 了, 关掉之后

```
nslookup ll.test
Server:		fe80::8ede:f9ff:feb2:4ed%12
Address:	fe80::8ede:f9ff:feb2:4ed%12#53

** server can't find ll.test: NXDOMAIN
```

然后

```
nslookup ll.test localhost
Server:		localhost
Address:	::1#53

Name:	ll.test
Address: 127.0.0.1
```

再去 Raycast curl 测试就正常了

<img width="774" alt="image" src="https://github.com/bxb100/bxb100.github.io/assets/20685961/0d05b3cc-9451-4f0a-bd2e-3037f782c627">

## 总结

大部分情况下应该是 DNS 没有刷新或者没启用导致的

---

<a id='issuecomment-2205977974'></a>
[How DNS Works
](https://wizardzines.com/zines/dns/)
<img width="1059" alt="image" src="https://github.com/bxb100/bxb100.github.io/assets/20685961/908f6d83-7102-464c-a516-f8f7e189d76a">

[^1]: https://nodejs.org/api/dns.html#supported-getaddrinfo-flags

[^2]: https://www.reddit.com/r/MacOS/comments/1afwm7t/terminal_ping_not_using_configured_dns_nslookup/
