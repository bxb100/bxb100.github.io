---
title: 使用 charles 的 rootCA  代理后端 API
date: 2022-02-10T17:07:35Z
tags:
	-Horizon

---
## 前情
某日我儿（前端 ios 使用 https 但是没有强制）问我如何利用 charles 来代理后端**本地** API 测试，我直接甩给他 `map remote` 大法 （from https to http），解决。

## 思考
<img width="432" alt="image" align="right" src="https://user-images.githubusercontent.com/20685961/153456893-60900373-e67b-4134-813b-8eb1156a4b0d.png">

这时候我觉得 charles 类似 QuantumultX 直接重写响应 payload，但是看了 doc 之后发现仅仅只是转发。然后我问了下我儿，他说他客户端没做 ssl 校验，那么之后排期做了校验这种方式可能会有问题。
这时我就想到能否利用 charles 的 rootCA 来自签，这样的话配合 DNS 和一些 web server 反向代理就能做到直接本地 https 线上域名访问了（当然 client 添加公钥这种问题就不在这里赘述了）。
<br>

## 实验
首先先导出 charles 的 CA 和 私钥

**Help** >  **SSL Proxying** >  **Export Charles Root Certificate and Private Key...**

然后转成 `PEM`[^1] (_`charles-ssl-proxying.p12` `newfile.xx.pem` 按实际情况填写_）

```sh
openssl pkcs12 -in charles-ssl-proxying.p12 -out newfile.crt.pem -clcerts -nokeys
openssl pkcs12 -in charles-ssl-proxying.p12 -out newfile.key.pem -nocerts -nodes 
```
然后参考
* https://github.com/kingkool68/generate-ssl-certs-for-local-development
* https://github.com/dakshshah96/local-cert-generator

创建（这里假如使用的是 example.com 网站）
1、server.csr.cnf
```
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn

[dn]
C=US
ST=RandomState
L=RandomCity
O=RandomOrganization
OU=RandomOrganizationUnit
emailAddress=hello@example.com
CN = example.com
```
 2、v3.ext
```
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = example.com
```

执行
```
openssl req -new -sha256 -nodes -out server.csr -newkey rsa:2048 -keyout server.key -config server.csr.cnf

openssl x509 -req -in server.csr -CA newfile.crt.pem -CAkey newfile.key.pem -CAcreateserial -out server.crt -days 825 -sha256 -extfile v3.ext
```

获得
* server.key
* server.crt

使用 caddy 简单做一个反向代理

```
example.com {

tls ~/server.crt ~/server.key

reverse_proxy localhost:2022
}

:2022 {
respond "<h1>Hello, world!</h1>"
}
```

<img width="540" alt="image" align="right" src="https://user-images.githubusercontent.com/20685961/153470943-e0fbf171-01a9-440a-9a08-baa22c43a9a5.png">

然后在 charles 中配置 

**Tools** > **DNS Spoofing** 

将 `example.com`指向本地 caddy，这样就能直接请求了 (当然直接改 host 也是可以的)

<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>

----

PC:
<img  alt="image" src="https://user-images.githubusercontent.com/20685961/153471370-988fe1a9-0291-46dd-8df4-88792c54011f.png">

Android:
<img   src="https://user-images.githubusercontent.com/20685961/153471869-0b564770-f138-42bb-9dca-0d476194a929.jpg" >





[^1]: https://stackoverflow.com/questions/15144046/converting-pkcs12-certificate-into-pem-using-openssl

---

<a id="issuecomment-1203009674"></a>
其它文章
- https://medium.com/@devahmedshendy/traditional-setup-run-local-development-over-https-using-caddy-964884e75232
- https://docs.proxyman.io/advanced-features/custom-certificates