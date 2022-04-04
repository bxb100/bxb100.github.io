[使用 N_m3u8DL-CLI 简化下载 m3u8 流程](https://github.com/bxb100/blog/issues/13)

[N_m3u8DL-CLI](https://github.com/nilaoda/N_m3u8DL-CLI) 是一个比较好用的 m3u8 下载工具, 但是它是 NET 写成的, 我懒得改成 JAVA, 想着白嫖 GitHub Action 来中转下载

写了个脚本直接 re 页面中 m3u8 后缀连接, 然后调用 CLI 下载, 可以直接放在 release 中或者传到 webdav 中, 感觉更安全了 🤣 

当然, 如果是在 win 机上, 那么直接 execute ps1 更简单

[👉 脚本地址](https://github.com/bxb100/OSS-Config/blob/main/Win/execute.ps1)

参数:

1. `-URI`: 参数唯一, 默认为 URI, 如果参数为空, 默认从 env 环境变量中取值, 所以塞值的时候需要 `$env:xxx`
2. `-Proxy`: 代理地址
3. `-Extra`: N_m3u8DL-CLI 其它参数, 形如 `'--saveName filename --timeOut 1000'` 注意单引号字符串传入