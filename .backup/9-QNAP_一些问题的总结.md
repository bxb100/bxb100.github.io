[QNAP 一些问题的总结](https://github.com/bxb100/blog/issues/9)

1. 默认的 8080 端口无法在公网环境下访问，可以使用[反向代理来设置](#issuecomment-1017306273)
2. 使用 Cloudflare Worker & KV 来做 DDNS

---

<a id="issuecomment-1017306273"></a>
众所周知的原因，电信公网 IP 一般会封 80，443，8080 这几个端口
![image](https://user-images.githubusercontent.com/20685961/150316729-9aff6b84-c564-4994-85b0-4f24803bac1c.png)
