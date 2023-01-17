---
title: Dropover 自定义操作的一些 Tips
date: 1642513566000
tags:
- Horizon

url: https://github.com/bxb100/bxb100.github.io/issues/8

---
1. 放在 `Application Scripts` 文件夹时候注意给**权限,** 否则会报格式异常错误
2. 估计作者调用 unix script 的时候没有给其它 path 的执行环境, 导致只能用 `user/bin` 下面的命令, 类似 `execve` ? （不过这里可以用全路径先用着）
3. 如果没有输出有的时候就是 `2` 导致的原因

---

<a id="issuecomment-1015431962"></a>
https://gist.github.com/bxb100/6734e7fdc5396bcfcaf34c809c8334f6

使用 Google Lens 搜图

---

<a id="issuecomment-1026828776"></a>
搜索 GIF 第一帧的时候发现 Lens 无法请求成功，所以弃用 Lens 改成 google image search

https://gist.github.com/bxb100/4cdfa1b52999ac491b21fd9e1803f58a

---

<a id="issuecomment-1172560293"></a>
设置第一张图片为壁纸
```shell
osascript -e "tell application \"System Events\" to tell every desktop to set picture to \"$1\" as POSIX file" 
```