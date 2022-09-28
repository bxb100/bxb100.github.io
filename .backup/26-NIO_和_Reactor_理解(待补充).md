[NIO 和 Reactor 理解(待补充)](https://github.com/bxb100/blog/issues/26)

NIO: NIO stands for non-blocking I/O

It work looks like this:
![image](https://user-images.githubusercontent.com/20685961/192730676-ea8e3234-4b51-4b16-8dcd-27a70c669a45.png)

NIO 这是个线程模型, 通常用于 socket 连接, 减少线程数量

Reactor 是个业务模型, 通常基于 NIO 来做 Event 通知

对于 Loom 出来后, 这些都是可以忽略的

https://www.baeldung.com/spring-webflux-concurrency

https://stackoverflow.com/questions/70174468/project-loom-what-happens-when-virtual-thread-makes-a-blocking-system-call

