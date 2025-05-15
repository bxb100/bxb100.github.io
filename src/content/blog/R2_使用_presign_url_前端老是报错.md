---
title: R2 使用 presign url 前端老是报错
pubDatetime: 2025-05-15T11:52:58.000Z
modDatetime: 2025-05-15T11:52:58.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/66
tags:
  - uncategorized
---

<img width="898" alt="Image" src="https://github.com/user-attachments/assets/8fba8a1f-c7dd-468d-8a81-fec38cfc77a9" />
 
 
- https://developers.cloudflare.com/r2/examples/aws/aws-sdk-java/
- 前端使用 axios

---

直接就去 R2 bucket 设置里面设置 CORS Policy[^1]

```json
[
  {
    "AllowedOrigins": ["http://localhost"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["Content-type"]
  }
]
```

还是报错, 然后去查看 `Access-Control-Allow-Headers`[^2] 查了 [CORS-safelisted response header
](https://developer.mozilla.org/en-US/docs/Glossary/CORS-safelisted_response_header) 和 https://fetch.spec.whatwg.org/#cors-safelisted-request-header

看代码

```js
return axios.put(presignedInfo.uploadUrl, options.file, {
  headers: {
    "Content-Type": options.file.type,
  },
});
```

设置也没问题啊, 但就是报错 (注意这里 PUT 不能直接 GET 查看, 这时候 403 和上述 OPTIONS 错误不是一个问题, 上述问题只是一个 CORS 报错, 这就是整个事件最大的乌龙了), 最后在 axios 社区[^3] 提醒下, 设置允许 header 为 `*`

然后发现忘了 axios 中间件层设置了 `tenant-id` header 😅

---

教训:

> The 403 response status indicates a general problem with the server backend not being configured to handle OPTIONS requests, not just CORS preflight OPTIONS requests.
>
> The server must respond to OPTIONS requests with a 2xx success status—typically 200 or 204.

<https://stackoverflow.com/questions/44966434/response-for-preflight-403-forbidden/44968217>

[^1]: https://developers.cloudflare.com/r2/buckets/cors/

[^2]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Access-Control-Allow-Headers

[^3]: https://github.com/axios/axios/discussions/4478
