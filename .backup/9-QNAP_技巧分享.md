[QNAP 技巧分享](https://github.com/bxb100/blog/issues/9)

1. 默认的 8080 端口无法在公网环境下访问，可以使用[反向代理来设置](#issuecomment-1017306273)
2. [使用 Cloudflare Worker & KV 来做 DDNS](#issuecomment-1017428570)

---

<a id="issuecomment-1017306273"></a>
众所周知的原因，电信公网 IP 一般会封 80，443，8080 这几个端口
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