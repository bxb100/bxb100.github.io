---
title: Pick the Right Distroless Base Image For Your Application
pubDatetime: 2024-02-19T12:43:47.000Z
modDatetime: 2024-02-20T14:03:03.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/46
tags:
  - DEV
  - Docker
---

> docker challenge https://labs.iximiuz.com/challenges/pick-the-right-distroless-base-image

- 使用 logs 来查看容器的日志
  - `exec /server: no such file or directory`
  - 暂时看不出来啥问题，猜测是 CMD 位置错误，后面意识到理解错误了
- 使用 [dive](https://github.com/wagoodman/dive) 来查看 container 信息

![image](https://github.com/bxb100/bxb100.github.io/assets/20685961/1995292f-c34c-4a35-8830-ead54090b702)

- 使用 `cp` 来复制二进制 server 文件到本地运行，没有报错 （8080 端口）
  - `docker cp status-checker:/server .`
- 根据提示使用 `file` 和 `ldd` 来查看文件动态链接的 so 文件

```bash
root@docker-01:~# file server
server: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=016df6500c2c3df1dd3ce82d9e9a5bd547584c97, for GNU/Linux 3.2.0, with debug_info, not stripped
```

```bash
root@docker-01:~# ldd server
        linux-vdso.so.1 (0x00007ffde5df1000)
        libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007fbc097e4000)
        /lib64/ld-linux-x86-64.so.2 (0x00007fbc0a379000)
```

> [!NOTE]
>
> `linux-vdso.so.1`[^1] 没有实体文件，文件 GNU/LINUX 编译，那么需要 libc，动态连接 `/lib64/ld-linux-x86-64.so.2`

- 现在根据上面的理解修改成下面的 Dockerfile

```docker
FROM scratch

COPY ./server /server
COPY ./libc.so.6 /lib/x86_64-linux-gnu/libc.so.6
COPY ./ld-linux-x86-64.so.2 /lib64/ld-linux-x86-64.so.2

CMD ["/server"]
```

- `docker build -t tmp .`
  - build 的时候 `COPY` 出现无文件的错误
    文件必须和 dockerfile 文件的同级目录下 [^2]
    > The `<src>` path must be inside the build context; you can't use `COPY ../something /something`, because the builder can only access files from the context, and `../something` specifies a parent file or directory of the build context root.
- 使用 `docker run -p 8080:8080 --name status-checker tmp`
- `curl localhost:8080` 报错
  - `tls: failed to verify certificate: x509: certificate signed by unknown authority`
  - 发现需要安装 `ca-certificates`
  - 重新修改[^3]

```docker
FROM golang:alpine as builder
RUN apk update && apk upgrade && apk add --no-cache ca-certificates
RUN update-ca-certificates

FROM scratch

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY ./server /server
COPY ./libc.so.6 /lib/x86_64-linux-gnu/libc.so.6
COPY ./ld-linux-x86-64.so.2 /lib64/ld-linux-x86-64.so.2

CMD ["/server"]
```

- 重新 build 并运行通过测试

[^1]: https://stackoverflow.com/questions/58657036/where-is-linux-vdso-so-1-present-on-the-file-system

[^2]: https://serverfault.com/questions/1092830/docker-copy-fails-with-no-such-file-or-directory-but-i-am-root-and-can-access-t

[^3]: https://gist.github.com/michaelboke/564bf96f7331f35f1716b59984befc50
