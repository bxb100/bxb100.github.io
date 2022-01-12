[github action 相关信息](https://github.com/bxb100/blog/issues/7)

* [生成 release log automatically-generated-release-notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes)
* [Anyway to check the error message and retry?](#issuecomment-1008555315)
* [输入输出多行](#issuecomment-1008555105)



---

* [输入参数多行](https://github.community/t/set-output-truncates-multiline-strings/16852)
* [echo multiline strings in github action](https://trstringer.com/github-actions-multiline-strings/)
* 同样的问题还出现在 setting error message 中(这里只讨论直接在 yaml 文件中输出的情况), 输出 `\n` 的文件只会输出第一行, 用如下方式解决: 
```shell
ERR_MSG=$(cat err.log)
ERR_MSG="${ERR_MSG//'%'/'%25'}"
ERR_MSG="${ERR_MSG//$'\n'/'%0A'}"
ERR_MSG="${ERR_MSG//$'\r'/'%0D'}"
echo "::error title=err::$ERR_MSG"
```


---

* Anyway to check the error message and retry?
	1. 社区里面用 `||` 来 retry 命令, 但是我这个 shell 着实繁琐又不想写个 sh 文件, 忽略[^1]
	2. 还有种思路就是利用 `2> file` 输出错误信息, 判断[^3], 然后利用 workflow 的 API 来重新调用[^2], 调用代码如下
		* 注意 `failure()` 标识 [此 job 中存在失败](https://docs.github.com/en/actions/learn-github-actions/expressions#failure)
		* `${{ secrets.GH_PAT }}` 注意给 workflow 的权限
		* `workflow_id` 目前好像只能通过 list workflows 的 API 来获取
		* **可能导致无限调用**, 但是可以将 retry 次数当做 input 传入, 然后判断大于多少次直接 `exit 1`
		* `continue-on-error: true`[^4] 会导致 `failure` 判断失效
```yaml
- name: Failed
if: ${{ failure() }}
run: |
  if grep -q 'errorMessage' err.log;
  then curl --location --request POST 'https://api.github.com/repos/xxx/xxx/actions/workflows/xxxx/dispatches' \
  --header 'Accept: application/vnd.github.v3+json' \
  --header 'Authorization: token ${{ secrets.GH_PAT }}' \
  --header 'Content-Type: application/json' \
  --data-raw '{
      "ref": "main",
      "inputs": {
          "xxx": "${{github.event.inputs.xxx}}"
      }
  }'
  fi
```

* 注意一点, `workflow_call` 不允许自己调用自己(错误信息如下), 所以可能只有上述方法可行
```
error parsing called workflow "bxb100/xxx/.github/workflows/download.yml@main": job "retry" calls workflow "bxb100/xxx/.github/workflows/download.yml@main", but doing so would exceed the limit on called workflow depth of 2
```

[^1]: https://github.community/t/how-to-retry-a-failed-step-in-github-actions-workflow/125880
[^2]: https://docs.github.com/en/rest/reference/actions#create-a-workflow-dispatch-event Create a workflow dispatch event
[^3]: https://stackoverflow.com/questions/11287861/how-to-check-if-a-file-contains-a-specific-string-using-bash
[^4]: https://docs.github.com/en/actions/learn-github-actions/contexts#steps-context 