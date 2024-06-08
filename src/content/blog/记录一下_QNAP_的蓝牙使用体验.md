---
title: 记录一下 QNAP 的蓝牙使用体验
pubDatetime: 2023-12-26T13:10:47.000Z
modDatetime: 2023-12-26T13:14:43.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/42
tags:
  - 就是玩
  - Rust
---

tldr: QNAP 使用的 dbus 是 1.4，rs-dbus 使用的不兼容

搞了个项目 [rs-luck-jingle](https://github.com/bxb100/rs-luck-jingle) 想跑在 qnap NAS 上，但是报 `dbus` 无方法

下载了 QNAP 的 toolchain[^1]，然后本地搞个虚拟机开始编译 1.14 版本的 dbus[^2]

NAS 关了 dbus `sudo sh /etc/init.d/dbus.sh stop`

然后到 `/mnt/ext/opt/avahi0630/` 替换产出，重启 dbus，这时候项目是不报错了，但是 `bluetoothctl` block 住了，没法启动

```
/usr/lib/pkgconfig dbus-1.pc

/mnt/ext/opt/avahi0630/usr/lib libdus*
  /usr/lib 软链接

/mnt/ext/opt/avahi0630/usr/sbin dbus*
  /usr/sbin 软链接
```

结论：没成功

PS: home assistant 好像也没人搞成功..

[^1]: https://sourceforge.net/p/qosgpl/activity/?page=0&limit=100#64d47706d61c866ab279b42e

[^2]: https://www.linuxfromscratch.org/blfs/view/svn/general/dbus.html
