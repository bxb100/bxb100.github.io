---
title: NIO 和 Reactor 理解(待补充)
date: 2022-09-28T09:38:37Z
tags:
	- DEV

---
NIO: NIO stands for non-blocking I/O

It work looks like this:
![image](https://user-images.githubusercontent.com/20685961/192730676-ea8e3234-4b51-4b16-8dcd-27a70c669a45.png)

NIO 这是个线程模型, 通常用于 socket 连接, 减少线程数量

Reactor 库的设计目的就是在构建异步管道时避免**回调地狱**和**深层嵌套代码**, 属于 NIO 的拓展

对于 Loom 出来后, 这些都是可以忽略的

### Reference

* https://www.baeldung.com/spring-webflux-concurrency

* https://stackoverflow.com/questions/70174468/project-loom-what-happens-when-virtual-thread-makes-a-blocking-system-call

* https://www.infoq.com/articles/java-virtual-threads/ 虚拟线程更适合 IO 密集型的任务

