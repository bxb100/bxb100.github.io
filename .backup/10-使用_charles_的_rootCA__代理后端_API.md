[使用 charles 的 rootCA  代理后端 API](https://github.com/bxb100/blog/issues/10)

## 前情
某日我儿（前端 ios 使用 https 但是没有强制）问我如何利用 charles 来代理后端**本地** API 测试，我直接甩给他 `map remote` 大法 （from https to http），解决。

## 思考
<img width="432" alt="image" align="right" src="https://user-images.githubusercontent.com/20685961/153456893-60900373-e67b-4134-813b-8eb1156a4b0d.png">

这时候我觉得 charles 类似 QuantumultX 直接重写响应 payload，但是看了 doc 之后发现仅仅只是转发。然后我问了下我儿，他说他客户端没做 ssl 校验，那么之后排期做了校验这种方式可能会有问题。
这时我就想到能否利用 charles 的 rootCA 来自签，这样的话配合 DNS 和一些 web server 反向代理就能做到直接本地 https 线上域名访问了（当然 client 添加公钥这种问题就不在这里赘述了）。
<br>

## 实验
首先先 export charles 的 CA 和 私钥

<div>
<img width="360" alt="image" align="left" src="https://user-images.githubusercontent.com/20685961/153458862-ab9f98f0-f76e-4551-a99f-0a492840d58c.png">
<img width="450" alt="image" align="right" src="https://user-images.githubusercontent.com/20685961/153458880-2e08351e-775a-498d-9067-07c15725431d.png">
</div>
<br>

然后获得

