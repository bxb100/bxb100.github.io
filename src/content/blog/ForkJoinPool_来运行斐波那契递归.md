---
title: ForkJoinPool 来运行斐波那契递归
pubDatetime: 2023-03-11T19:19:54.000Z
modDatetime: 2026-05-10T13:06:17.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/36
tags:
  - uncategorized
---

```java
	static class ComputeFibonacciTask extends RecursiveTask<Long> {

		private final long n;

		public ComputeFibonacciTask(long n) {
			this.n = n;
		}

		protected Long compute() {
			if (n <= 1) {
				return n;
			} else {
				RecursiveTask<Long> otherTask = new ComputeFibonacciTask(n - 1);
				otherTask.fork();
				Long right = new ComputeFibonacciTask(n - 2).compute();
				return right + otherTask.join();
			}
		}
	}
```

直接 `1000` 使用默认的 `ForkJoinPool` 构造方法, 可以看到由于错误的理解, 分治导致出现 2^1000 - 2 个实例

还有一点注意的是: 默认 pool 的大小是 `核心-1`, 并且是并行的[^1]

直接爆炸 💥

某一刻的 profile
<img width="1200" alt="image" src="https://user-images.githubusercontent.com/20685961/224507439-14d808e3-491d-47f4-bfba-67fc1d2044ac.png">
_jprofile active code: https://zhile.io/2022/02/22/jprofiler-license.html_

解决方法:

**不要用 forkJoinPool 来解决非分治问题**[^2]

---

<a id='issuecomment-2122838098'></a>
https://www.bilibili.com/video/BV1fr42157T1/

今天看到处理器调度, 想到和这个关联关系. 可能需要从 CPU L1 cache 这个角度来思考, 为什么有的时候并发和并行并不会带来好的结果

[^1]: https://medium.com/@peterlee2068/concurrency-and-parallelism-in-java-f625bc9b0ca4

[^2]: https://stackoverflow.com/questions/51414388/fibonacci-using-fork-join-in-java-7
