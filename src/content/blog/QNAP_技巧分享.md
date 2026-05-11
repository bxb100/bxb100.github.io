---
title: QNAP 技巧分享
pubDatetime: 2022-01-20T09:59:51.000Z
modDatetime: 2026-05-10T13:09:02.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/9
tags:
  - Horizon
  - 就是玩
---

1. 默认的 8080 端口无法在公网环境下访问，可以使用[反向代理来设置](#issuecomment-1017306273)
2. [使用 Cloudflare Worker & KV 来做 DDNS](#issuecomment-1017428570)
3. 使用 [tailscale](https://tailscale.com/) 来连接 WebDAV

---

<a id='issuecomment-1017306273'></a>
众所周知的原因，电信公网 IP 一般会封 80，443，8080 这几个端口
其它方式访问
![image](https://user-images.githubusercontent.com/20685961/150316729-9aff6b84-c564-4994-85b0-4f24803bac1c.png)

---

<a id='issuecomment-1017428570'></a>
Cloudflare 设置边缘节点代码为：

```javascript
addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

let token = "自定义";

async function handleRequest(request) {
  const url = new URL(request.url);
  const params = url.searchParams;
  switch (url.pathname) {
    case "/":
      if (params.get("token") != token) {
        // Incorrect key supplied. Reject the request.
        return new Response("Sorry, you have supplied an invalid key.", {
          status: 403,
        });
      }
      if ((await QNAP.get("ip")) === params.get("ip")) {
        return new Response("not changed");
      }
      // save the ip in the KV
      await Promise.all([
        QNAP.put("url", request.url),
        QNAP.put("ip", params.get("ip")),
        QNAP.put("cacheTime", new Date().getTime()),
      ]);

      return new Response("OK");
      break;
    case "/favicon.ico":
      return fetch("https://workers.cloudflare.com/favicon.ico");
    default:
      return new Response("Not found", { status: 404 });
  }
}
```

> ⚠️ 免费版的 KV 是有读写请求限制的，达到一般数量的时候会发邮件提示，最好先查再改

注意 KV 要绑定到当前的 worker 中 https://developers.cloudflare.com/workers/runtime-apis/kv#kv-bindings
![image](https://user-images.githubusercontent.com/20685961/150333993-0e10898d-5eba-4f66-a6a2-844031830a7a.png)

QNAP 中自定义 DDNS 设置参数为：
![image](https://user-images.githubusercontent.com/20685961/150336174-3e08d278-b912-4976-bc87-b3c396f7ad45.gif)

_这里的 pass 注意和上面的 worker 中定义保持一致，其它参数随便填写_

URL：`https://.workers.dev/?ip=%IP%&token=%PASS%&user=%USER%&host=%HOST%`

后面就可以在 github action 中使用 api 调用 kv 来做一些事情了

---

后续: 吐了，公网 IP 国外访问不了

---

<a id='issuecomment-1019415303'></a>
书接上文，访问不了的时候，我突然想到 P2P 的 tailscale，~~一查发现 QNAP 社区提供了安装包https://www.qnapclub.eu/en/qpkg/1162
（😞 不过官方目前只有群辉的包，这个包的安全性就仁者见仁智者见智了）~~

建议使用 https://github.com/ivokub/tailscale-qpkg

SSH 连接到 NAS，然后 `tailscale up` 授权即可

注意：使用 tailscale 的话，最好把 UPnP 端口转发的服务都关闭，最近好多 IP 端口扫描，有公网 IP 最好防一手
_直接用 tailscale 分配的局域网 ip 连接_

![image](https://user-images.githubusercontent.com/20685961/150665679-c124d31c-af44-4eb0-a4b1-7484cca349ad.png)

从此在 github action 中轻松使用 WebDAV， tailscale action 见 https://github.com/tailscale/github-action

```yaml
- name: Tailscale
  uses: tailscale/github-action@v1
  with:
    authkey: ${{ secrets.TAILSCALE_AUTHKEY }}
- name: Publish
  uses: bxb100/action-upload-webdav@v1
  with:
    webdav_address: "http://IP:PORT"
    webdav_username: ${{secrets.username}}
    webdav_password: ${{secrets.password}}
    webdav_upload_path: "/Video/"
    files: ./**\-**/**
```

---

~~PS: 不要开 IPv6, 开了之后我这里的情况就是 tailscale 最近的 DERP 是 San Francisco，而不是日本，淦 💩~~
淦，不是这个原因，看起来 tailscale 是从链接方找延迟低的 DERP 服务器中转，后面看有没有能指定的命令参数

---

<a id='issuecomment-1210272537'></a>
注意设置 firewall 允许 `100.64.0.0/10`[^1]

<img width="924" alt="image" src="https://user-images.githubusercontent.com/20685961/183841118-e9061ca2-c28a-497b-9ace-61f09135e297.png">

---

<a id='issuecomment-1598051222'></a>

### Docker 安全

Qnap 的 QuFirewall 是 iptables 的可视化版本, 目前它应该默认开启容器的外部访问

<img width="910" alt="image" src="https://github.com/bxb100/bxb100.github.io/assets/20685961/3565bfcb-e38b-4ab6-a45a-194c6939ce2d">

但是我目前要么是通过 tailscale 来 p2p, 要么就是利用 cloudflare tunnel 来外部链接, 这二者都不需要直接 `公网 IP + 端口` 的形式来访问, 所以需要首先关闭应用程序访问(上图描述全部都是 container-station, 但如果你有其它的程序话, 需要注意后续相应的添加路由规则) _对了, 这个规则不是立即生效的_

然后注意查看 docker 的网关, 如果这个后续不添加对应的规则, 容器内部无法通信[^2]

<img width="892" alt="image" src="https://github.com/bxb100/bxb100.github.io/assets/20685961/30b1c9c7-4e84-4662-98f8-34151a0a7ae6">

部分规则的配置:

<img width="898" alt="image" src="https://github.com/bxb100/bxb100.github.io/assets/20685961/e71d3966-d4af-4387-8f49-669b938cce50">

---

<a id='issuecomment-1598066765'></a>

## Alist 设定

### 离线下载[^3]

因为使用 docker 所以需要手动映射 `/opt/alist/data/temp/qbittorrent` 到对应的 docker volume 位置

可以手动映射个软连接

`sduo ln -s /${docker mapping location}/alist/ /opt/alist`

---

<a id='issuecomment-3510866459'></a>
~~注意最新的 tailscale QNAP 发行版有个坑~~[^4]

使用 `/sbin/getcfg Tailscale Install_Path -f /etc/config/qpkg.conf` 到安装目录, 然后执行 `./tailscale set --accept-routes`

[^2]:

> By default, Linux devices only discover [Tailscale IP addresses](https://tailscale.com/kb/1015/100.x-addresses). To enable automatic discovery of new subnet routes on Linux devices, use the --accept-routes flag
> [^2]: https://github.com/tailscale/tailscale/blob/d37884c734762cdd96d184c877b3b6eac139e5a2/envknob/featureknob/featureknob.go#L46C1-L52C12 web 页面无法使用 exit-node
> [^1]:https://tailscale.com/kb/1015/100.x-addresses/
> [^2]: https://forum.qnap.com/viewtopic.php?t=166412#p828884:~:text=I%20explicitely%20authorize%20192.168.1.0/24%20(my%20LAN)%2C%20172.29.8.0/22%20(the%20docker%20network%20so%20that%20containers%20can%20talk%20to%20each%20other)%20and%20172.16.1.0/24%20(my%20VPN%20network)%2C%20all%20the%20rest%20is%20dropped.
> [^3]: https://alist.nn.ci/zh/guide/advanced/offline-download.html
> [^4]: https://github.com/tailscale/tailscale/issues/1995 是故意的
