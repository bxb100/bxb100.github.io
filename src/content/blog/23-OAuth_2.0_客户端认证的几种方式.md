    ---
    title: OAuth 2.0 客户端认证的几种方式
    pubDatetime: 2022-08-31T16:16:22.000Z
    modDatetime: 2022-08-31T16:16:22.000Z
    url: https://github.com/bxb100/bxb100.github.io/issues/23
    tags:


    ---

    全文摘抄 https://darutk.medium.com/oauth-2-0-client-authentication-4b5f929305d4

> OAuth 对资源所有者和用户来说是授权协议, 不是验证协议

---

# client_secret_post

([OIDC Core](https://openid.net/specs/openid-connect-core-1_0.html), [9. Client Authentication](https://openid.net/specs/openid-connect-core-1_0.html#ClientAuthentication))

传统的方式中, 授权服务器提前给与客户端一对 `ID` 和 `Secrect`

![image](https://user-images.githubusercontent.com/20685961/187720742-9dfc502f-6740-4da1-b8f9-d03b9de68902.png)

然后再发送 **POST** 请求 token 的时候附加这对信息

![image](https://user-images.githubusercontent.com/20685961/187721042-1763b2ce-f8e9-4bc9-9660-982236605b04.png)

# client_secret_basic

([OIDC Core](https://openid.net/specs/openid-connect-core-1_0.html), [9. Client Authentication](https://openid.net/specs/openid-connect-core-1_0.html#ClientAuthentication))

在获取 token 请求中包含 `ID` 和 `Secret` 使用 Basic Authentication ([RFC 7617](https://tools.ietf.org/html/rfc7617))

首先使用冒号将二者拼接

```
{Client ID}:{Client Secret}
```

然后 `Base64` 后放入 `Authorization` 请求头中

![image](https://user-images.githubusercontent.com/20685961/187723378-28acd3ac-c411-4919-8117-4c1b721f460f.png)

> `client_secret_post` 和 `client_secret_basic` 是 [RFC 6749](https://tools.ietf.org/html/rfc6749), [2.3.1. Client Password](https://tools.ietf.org/html/rfc6749#section-2.3.1) 描述的两种客户端验证方案

# client_secret_jwt

([OIDC Core](https://openid.net/specs/openid-connect-core-1_0.html), [9. Client Authentication](https://openid.net/specs/openid-connect-core-1_0.html#ClientAuthentication))

在请求 token 的时候, 对数据使用 `Secret` 来生成签名 [RFC 7515](https://tools.ietf.org/html/rfc7515) (JSON Web Signature) 生成 JWT ([RFC 7519](https://tools.ietf.org/html/rfc7519)) 传给授权服务器

![image](https://user-images.githubusercontent.com/20685961/187724256-735fab63-644b-4749-9e7d-b4c30888518f.png)

JWT payload 格式定义在 [RFC 7523](https://tools.ietf.org/html/rfc7523), [2.2. Using JWTs for Client Authentication](https://tools.ietf.org/html/rfc7523#section-2.2)

![image](https://user-images.githubusercontent.com/20685961/187724284-19a1f92e-c5cd-4cff-bdce-bd805984c122.png)

这个 JWT 称为客户端断言 (OAuth In Action 也翻译为断言, 姑且称之)

请求 Token 时, **客户端断言** 置于 `client_assertion` 请求参数上, `client_assertion_type` 是固定值: `urn:ietf:params:oauth:client-assertion-type:jwt-bearer`

![image](https://user-images.githubusercontent.com/20685961/187724309-52b3ece2-2edc-435a-a4bb-801d91633b4f.png)

# private_key_jwt

([OIDC Core](https://openid.net/specs/openid-connect-core-1_0.html), [9. Client Authentication](https://openid.net/specs/openid-connect-core-1_0.html#ClientAuthentication))

既然上面是用对称加密, 那么就一定会出现不对称加密 (公钥分享使用诸如 `jwks` 或 `jwks_uri` client metadata)

![image](https://user-images.githubusercontent.com/20685961/187727532-611eb102-69e6-41d7-b6aa-6701bfc9a635.png)
