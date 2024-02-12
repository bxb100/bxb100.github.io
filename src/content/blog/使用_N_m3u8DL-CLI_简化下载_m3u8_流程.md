---
title: 使用 N_m3u8DL-CLI 简化下载 m3u8 流程
pubDatetime: 2022-04-04T03:52:27.000Z
modDatetime: 2022-10-13T11:10:23.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/13
tags:
  - uncategorized
---

[N_m3u8DL-CLI](https://github.com/nilaoda/N_m3u8DL-CLI) 是一个比较好用的 m3u8 下载工具, 但是它是 NET 写成的, 我懒得改成 JAVA, 想着白嫖 GitHub Action 来中转下载

写了个脚本直接 re 页面中 m3u8 后缀连接, 然后调用 CLI 下载, 可以直接放在 release 中或者传到 webdav 中, 感觉更安全了 🤣

当然, 如果是在 win 机上, 那么直接 execute ps1 更简单

[👉 脚本地址](https://github.com/bxb100/OSS-Config/blob/main/Win/execute.ps1)

参数:

1. `-URI`: 参数唯一, 默认为 URI, 如果参数为空, 默认从 env 环境变量中取值, 所以塞值的时候需要 `$env:xxx`
2. `-Proxy`: 代理地址
3. `-Extra`: N_m3u8DL-CLI 其它参数, 形如 `'--saveName filename --timeOut 1000'` 注意单引号字符串传入

---

<a id='issuecomment-1277438921'></a>
好消息, 作者新的跨平台 [N_m3u8DL-RE](https://github.com/nilaoda/N_m3u8DL-RE) 已经可以实装了, 新的 Github action 使用脚本如下

```yaml
name: "下载"
on:
  workflow_dispatch:
    inputs:
      url:
        description: "m3u8 网站"
        required: false
      filename:
        description: 文件名
jobs:
  download:
    runs-on: ubuntu-latest
    steps:
      - name: Check input
        if: ${{ github.event.inputs.url == '' }}
        run: |
          echo '::error title=⛔️ ERROR::请输入参数'
          exit 1
      - uses: FedericoCarboni/setup-ffmpeg@v1
        id: setup-ffmpeg
      - name: Download N_m3u8DL-RE
        run: >
          wget https://github.com/nilaoda/N_m3u8DL-RE/releases/download/v0.0.3-beta/N_m3u8DL-RE_Beta_linux-x64_20221012.tar.gz -O cs.tar.gz && tar -zxf cs.tar.gz;
          cd N_m3u8DL-RE_Beta_linux-x64 && sudo chmod u+x N_m3u8DL-RE && ./N_m3u8DL-RE ${{ github.event.inputs.url }} --save-name ${{ github.event.inputs.filename }};
          ls -lah;
```
