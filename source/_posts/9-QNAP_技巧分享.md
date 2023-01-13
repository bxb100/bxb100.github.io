
    ---
    title: QNAP 技巧分享
    date: 2022-01-20T09:59:51Z
    tags:
    	-Horizon

    ---
    1. 默认的 8080 端口无法在公网环境下访问，可以使用[反向代理来设置](#issuecomment-1017306273)
2. [使用 Cloudflare Worker & KV 来做 DDNS](#issuecomment-1017428570)
3. 使用 [tailscale](https://tailscale.com/) 来连接 WebDAV

---

<a id="issuecomment-1017306273"></a>
众所周知的原因，电信公网 IP 一般会封 80，443，8080 这几个端口
其它方式访问
![image](https://user-images.githubusercontent.com/20685961/150316729-9aff6b84-c564-4994-85b0-4f24803bac1c.png)


---

<a id="issuecomment-1017428570"></a>
Cloudflare 设置边缘节点代码为： 
```javascript
addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

let token = '自定义'

async function handleRequest(request) {
  const url = new URL(request.url)
  const params = url.searchParams
  switch (url.pathname) {
    case "/":
      if (params.get('token') != token) {
        // Incorrect key supplied. Reject the request.
        return new Response("Sorry, you have supplied an invalid key.", {
          status: 403,
        })
      }
      if (await QNAP.get("ip") === params.get("ip")) {
        return new Response("not changed")
      }
      // save the ip in the KV
      await Promise.all([
      QNAP.put("url", request.url),
      QNAP.put("ip", params.get("ip")),
      QNAP.put("cacheTime", new Date().getTime())
      ])

      return new Response("OK")
      break;
    case "/favicon.ico":
      return fetch("https://workers.cloudflare.com/favicon.ico")
    default:
      return new Response("Not found", {status: 404});
    }
}
```
> ⚠️ 免费版的 KV 是有读写请求限制的，达到一般数量的时候会发邮件提示，最好先查再改

注意 KV 要绑定到当前的 worker 中 https://developers.cloudflare.com/workers/runtime-apis/kv#kv-bindings
![image](https://user-images.githubusercontent.com/20685961/150333993-0e10898d-5eba-4f66-a6a2-844031830a7a.png)

QNAP 中自定义 DDNS 设置参数为： 
![image](https://user-images.githubusercontent.com/20685961/150336174-3e08d278-b912-4976-bc87-b3c396f7ad45.gif)

*这里的 pass 注意和上面的 worker 中定义保持一致，其它参数随便填写*

URL：`https://.workers.dev/?ip=%IP%&token=%PASS%&user=%USER%&host=%HOST%`

后面就可以在 github action 中使用 api 调用 kv 来做一些事情了

----

后续: 吐了，公网 IP 国外访问不了

---

<a id="issuecomment-1019415303"></a>
书接上文，访问不了的时候，我突然想到 P2P 的 tailscale，~~一查发现 QNAP 社区提供了安装包https://www.qnapclub.eu/en/qpkg/1162
（😞 不过官方目前只有群辉的包，这个包的安全性就仁者见仁智者见智了）~~

建议使用 https://github.com/ivokub/tailscale-qpkg

SSH 连接到 NAS，然后 `tailscale up` 授权即可

注意：使用 tailscale 的话，最好把 UPnP 端口转发的服务都关闭，最近好多 IP 端口扫描，有公网 IP 最好防一手
*直接用 tailscale 分配的局域网 ip 连接*

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

<a id="issuecomment-1210272537"></a>
注意设置 firewall 允许 `100.64.0.0/10`[^1]

<img width="924" alt="image" src="https://user-images.githubusercontent.com/20685961/183841118-e9061ca2-c28a-497b-9ace-61f09135e297.png">



[^1]:https://tailscale.com/kb/1015/100.x-addresses/