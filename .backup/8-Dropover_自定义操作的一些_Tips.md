[Dropover 自定义操作的一些 Tips](https://github.com/bxb100/blog/issues/8)

1. 放在 `Application Scripts` 文件夹时候注意给权限, 否则会报格式异常错误
2. 估计作者调用 unix script 的时候没有给其它 path 的执行环境, 导致只能用 `user/bin` 下面的命令, 类似 `execve` ?
3. 如果没有输出有的时候就是 `2` 导致的原因

---

<a id="issuecomment-1015431962"></a>
https://gist.github.com/bxb100/6734e7fdc5396bcfcaf34c809c8334f6

使用 Google Lens 搜图