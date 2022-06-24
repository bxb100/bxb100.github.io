[记一次 Win Dokcer 无法在局域网内连接的解决方案](https://github.com/bxb100/blog/issues/18)

我出现的问题是 docker firewall UAC 弹窗的时候只允许了 public 连接，然后网络变成 private 导致无法连接

进入 `Control Panel\System and Security\Windows Defender Firewall\Allowed apps` 添加 private 权限即可

相关文章参考
https://blog.miniasp.com/post/2021/06/14/Docker-Desktop-for-Windows-Windows-Firewall-Issues