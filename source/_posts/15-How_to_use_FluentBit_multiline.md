---
title: How to use FluentBit multiline
date: 2022-04-17T04:44:09Z
tags:
	- DEV

---
One day, my friend asked a question about how to use [fluentBit ](https://fluentbit.io/) (It's popular in k8s [^1]) to collect Java application logs. I had no idea how to do this at first, but finally the result seems good, so I want to give this tale to introduce the way I walk pasted.

![Flow](https://user-images.githubusercontent.com/20685961/163699255-57467f29-4d24-4948-aa27-62aa8d3e9b75.png)
<p align="center"><em>The config visualizes</em></p>

Usually, the log file pattern seems unified, it looks like 

`2022-04-17 03:10:42.381  INFO 28420 --- [restartedMain] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Starting...`

You can easily use regex to collect each line into a structure. But when the app throws exceptions, you need to use multiline parser [^2][^3]. Briefly, it's caught raw text read line by line, so each line needs to match [rule](https://docs.fluentbit.io/manual/administration/configuring-fluent-bit/multiline-parsing#rules-definition), like this:

```conf
# rules   |   state name   | regex pattern                   | next state
# --------|----------------|---------------------------------------------
rule         "start_state"   "/(Dec \d+ \d+\:\d+\:\d+)(.*)/"   "cont"
rule         "cont"          "/^\s+at.*/"                      "cont"
```

<p align="center">
<img src="https://user-images.githubusercontent.com/20685961/163700092-d1875099-1775-4c9a-8926-6fa7b6d0b9d0.png">
<p align="center"><em>Each line pipeline</em></p>
</p>


```log
2022-04-17 03:10:43.578 ERROR 28420 --- [scheduling-1] o.s.s.s.TaskUtils$LoggingErrorHandler    : Unexpected error occurred in scheduled task.

java.lang.RuntimeException: cs
	at guru.sfg.brewery.config.TaskConfig.throwError(TaskConfig.java:25) ~[classes/:na]
	at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method) ~[na:na]
	at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62) ~[na:na]
	at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43) ~[na:na]
	at java.base/java.lang.reflect.Method.invoke(Method.java:566) ~[na:na]
	at org.springframework.scheduling.support.ScheduledMethodRunnable.run(ScheduledMethodRunnable.java:84) ~[spring-context-5.1.6.RELEASE.jar:5.1.6.RELEASE]
	at org.springframework.scheduling.support.DelegatingErrorHandlingRunnable.run(DelegatingErrorHandlingRunnable.java:54) ~[spring-context-5.1.6.RELEASE.jar:5.1.6.RELEASE]
	at java.base/java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:515) ~[na:na]
	at java.base/java.util.concurrent.FutureTask.runAndReset(FutureTask.java:305) ~[na:na]
	at java.base/java.util.concurrent.ScheduledThreadPoolExecutor$ScheduledFutureTask.run(ScheduledThreadPoolExecutor.java:305) ~[na:na]
	at java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1128) ~[na:na]
	at java.base/java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:628) ~[na:na]
	at java.base/java.lang.Thread.run(Thread.java:834) ~[na:na]

2022-04-17 03:10:43.591  INFO 28420 --- [restartedMain] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080 (http) with context path ''
2022-04-17 03:10:43.593  INFO 28420 --- [restartedMain] g.sfg.brewery.SfgBreweryUiApplication    : Started SfgBreweryUiApplication in 2.717 seconds (JVM running for 3.998)
2022-04-17 03:10:43.596  INFO 28420 --- [scheduling-1] o.h.h.i.QueryTranslatorFactoryInitiator  : HHH000397: Using ASTQueryTranslatorFactory
```

But how to? The official Doc is good, but in this case, in the default spring logging pattern, log message with break-line, and, in Windows, it's `\r\n`, Me using windows, so be an attention

So, collusion below (remember when the up satisfied that one can be execute):
1. The start line is simple `(\d{4}-\d{2}-\d{2}\s\d+\:\d+\:\d+.\d+)(.*)` , [see](https://rubular.com/r/48Q24T9wXBsle9)
2. next is tricky, [see](https://rubular.com/r/YNoxsscZcVtlbY)
  * `\r\n`
  * `\s` + `name: default`
3. and the next, loop `3`, [see](https://rubular.com/r/NXxvOGLOyThUzm)
  * `\s` + `...]`
  * `xxx.xxx.xxException`
  * `\s` + `at XXXX`

In the end, the exception snippet will produce a single line, you can use filter to exclude this.

gist: https://gist.github.com/bxb100/de46e5f708d03d509430d4767806fb14


## Other thing
Using docker needs packing by yourself [^4], don't forget it should with ES under same network [^5]

1. build an image

```Dockerfile
FROM fluent/fluent-bit:1.9.0
ADD parsers_multiline.conf /fluent-bit/etc/
ADD fluent-bit.conf /fluent-bit/etc/
```

`docker build -t fluentbit-cs:sim .`

`docker run -id --name fluent -v /e/docker/fluentBit/log:/var/log --network 8x_default fluentbit-cs:sim`

2. mount config to `/fluent-bit/etc`

`docker run -id --name fluent -v /e/docker/fluentBit/log:/var/log -v /e/docker/fluentBit/config:/fluent-bit/etc --network 8x_default fluent/fluent-bit:1.9.0`

---

If you are missing `cont2` rule, the ES log will trigger exception like single document, it's not combined with log message

![image](https://user-images.githubusercontent.com/20685961/163700773-a1c6520b-4830-4700-ad19-0d100b72db60.png)
<p align="center"><em>Obviously It's not my wanted type</em></p>



[^1]: https://gist.github.com/StevenACoffman/4e267f0f60c8e7fcb3f77b9e504f3bd7 fluent-filebeat-comparison
[^2]: https://docs.fluentbit.io/manual/administration/configuring-fluent-bit/multiline-parsing
[^3]: https://docs.fluentbit.io/manual/pipeline/inputs/tail Tail input
[^4]: https://kevcodez.de/posts/2019-08-10-fluent-bit-docker-logging-driver-elasticsearch/
[^5]: https://juejin.cn/post/6844903847383547911


