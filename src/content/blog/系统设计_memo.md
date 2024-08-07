---
title: 系统设计 memo
pubDatetime: 2023-01-02T03:49:12.000Z
modDatetime: 2023-03-02T09:31:09.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/29
tags:
  - Horizon
---

---

<a id='issuecomment-1368635257'></a>

# 如何优化报表

问题来源: [求各位大佬给些报表优化的思路?](https://www.v2ex.com/t/906010)

## 可能的解决方案

- 使用 `ETL`, 通过 `CDC`[^1] 来将数据转换到 [ClickHouse](https://clickhouse.com/) 这种列式数据库或者计算放到缓存中, 然后报表请求到新的数据源中
- 使用 [PlanetScale Boost](https://planetscale.com/blog/how-planetscale-boost-serves-your-sql-queries-instantly) 类似的 [readyset](https://github.com/readysettech/readyse) 中间件来缓存查询语句, 相当于实时更新 view 数据
- 使用 [Apache Flink](https://github.com/apache/flink) 来实时转换数据, 然后直接存储对应聚合搜索的结果, 相当于运算放到 **推** 的地方去[^2]
  - 阿里云有个最佳实践 [link](https://help.aliyun.com/document_detail/446799.html)
- 使用 Spark[^3]

---

<a id='issuecomment-1368955932'></a>

# 如何动态配置 Nginx 代理 host

问题来源: https://github.com/leandromoreira/cdn-up-and-running/issues/2#issue-1327709419

## 可能的解决方案[^4]

- 使用 Redis + OpenResty[^5]
- 使用 [etcd](https://etcd.io/) / [consul](https://www.consul.io/) + [confd](https://github.com/kelseyhightower/confd)[^6]

---

<a id='issuecomment-1416924759'></a>

# 如何自由的控制 env

看到 https://github.com/Infisical/infisical , 比较好奇它的运行机制. 然后发散性的想了一下, 如何接入 https://github.com/hashicorp/vault 做出同样效果: 将 vault 的秘钥注入到一个类似 python virtual env 中, 然后直接在这个环境中运行application, 通过环境变量获取秘钥(和 `nix shell` 一样)

下面这段代码是 infisical 的执行环境

```golang
func executeMultipleCommandWithEnvs(fullCommand string, secretsCount int, env []string) error {
	shell := [2]string{"sh", "-c"}
	if runtime.GOOS == "windows" {
		shell = [2]string{"cmd", "/C"}
	} else {
		currentShell := os.Getenv("SHELL")
		if currentShell != "" {
			shell[0] = currentShell
		}
	}

	cmd := exec.Command(shell[0], shell[1], fullCommand)
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Env = env

	color.Green("Injecting %v Infisical secrets into your application process", secretsCount)
	log.Debugf("executing command: %s %s %s \n", shell[0], shell[1], fullCommand)

	return execCmd(cmd)
}
```

其实和 `var=value cmd` 差不多

---

<a id='issuecomment-1451564554'></a>

### 如何在 iframe 中无感登录

来源: https://www.v2ex.com/t/920543

解决方式:

- 使用同样的单点登录, 然后两个 web 都跳转并且 setCookie
- 对于 a.d.c 和 b.d.c 使用 d.c 的 cookie
- ~~前端使用 Event[^7] 传递 iframe 可用的 token 但是要对 iframe 中网页可控)~~

[^1]: https://debezium.io/

[^2]: https://nightlies.apache.org/flink/flink-docs-master/zh/docs/try-flink/table_api/

[^3]: https://www.youtube.com/watch?v=ChISx0-cMpU

[^4]: https://groups.google.com/g/openresty/c/claxKss8zc0

[^5]: https://juejin.cn/post/6962576607928123428

[^6]: https://www.digitalocean.com/community/tutorials/how-to-use-confd-and-etcd-to-dynamically-reconfigure-services-in-coreos#creating-the-nginx-container

[^7]: https://stackoverflow.com/questions/28672152/pass-an-event-to-an-iframe-from-the-parent-window-javascript
