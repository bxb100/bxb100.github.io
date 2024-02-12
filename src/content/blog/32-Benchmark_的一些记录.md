    ---
    title: Benchmark 的一些记录
    pubDatetime: 2023-01-25T03:47:37.000Z
    modDatetime: 2023-05-06T16:02:28.000Z
    url: https://github.com/bxb100/bxb100.github.io/issues/32
    tags:
      - DEV


    ---

    记录一下看到的各种 benchmark 指标的网站, 仓库, 和博客

- [YCSB](https://github.com/brianfrankcooper/YCSB) A common use of the tool is to benchmark multiple systems and compare them.

- [yet-another-bench-script](https://github.com/masonr/yet-another-bench-script) YABS - a simple bash script to estimate Linux server performance using fio, iperf3, & Geekbench

---

<a id='issuecomment-1403059558'></a>
ClickHouse 主导的和其它数据库性能的 benchmark
|repo | website|
|:----:|:----:|
|https://github.com/ClickHouse/ClickBench|https://benchmark.clickhouse.com/|

> TLDR: All Benchmarks Are ~Bastards~ Liars.

---

<a id='issuecomment-1403062218'></a>
SigNoz 主导的和 ES, Loki 的性能比较

|                   repo                   |                        blog                        |
| :--------------------------------------: | :------------------------------------------------: |
| https://github.com/SigNoz/logs-benchmark | https://signoz.io/blog/logs-performance-benchmark/ |

## Conclusion

- For ingestion SigNoz is 2.5x faster than ELK and uses 50% less resources.
- Loki doesn’t perform well if you want to index and query high cardinality data.
- SigNoz is about 13 times faster than ELK for aggregation queries.
- Storage used by SigNoz for the same amount of logs is about half of what ELK uses.

---

<a id='issuecomment-1410107740'></a>
Lambda 各个语言冷启动, 对 serveless edge 场景有借鉴意义

|                                              twitter                                              |                website                |
| :-----------------------------------------------------------------------------------------------: | :-----------------------------------: |
| [Twitter](https://twitter.com/timClicks/status/1619784240987799552?s=20&t=Dc-1o97y3zXLd0iOSKdIrw) | https://maxday.github.io/lambda-perf/ |

![FnqhLAoaYAA9dtE](https://user-images.githubusercontent.com/20685961/215738230-3d58dd1e-183b-4d84-b606-70da5a328e88.jpg)

---

> Rust 在边缘节点计算真有前途, 不过不知道 WASM 效能是不是一样

---

<a id='issuecomment-1412170694'></a>
由于 JDK 19 virtual thread 出现, 需要将 `synchronized` 替换成 `ReentrantLock` 的需求

|                                               source                                                |                                                                 detail                                                                 |
| :-------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------: |
| [Twitter](https://twitter.com/heinzkabutz/status/1618490856675364865?s=20&t=IanmLaWCx_zda2STp9V3AA) |       ![FndfFg4XEAEBkmg](https://user-images.githubusercontent.com/20685961/216069377-3312caa4-0a3a-4df6-bf4a-6f5789e875bc.jpg)        |
|                       [pgjdbc](https://github.com/pgjdbc/pgjdbc/issues/1951)                        | ![Snipaste_2023-02-01_22-37-53](https://user-images.githubusercontent.com/20685961/216073168-a40b6922-a99a-468f-9c92-83ea91331a25.png) |

---

> 尽量用 `synchronized` 不用 wait, notify 应该没问题

---

<a id='issuecomment-1537171738'></a>

### AWS Network Testing (not benchmark)

source: https://twitter.com/haoel/status/1654655067365179393?s=20

https://docs.google.com/spreadsheets/d/1ayC9SV1kgGjB_VHa8pAuyxjMIIZf5bEh1kiYDTo8j6I/edit#gid=0

---

> RTT + Cwnd 控制网速
