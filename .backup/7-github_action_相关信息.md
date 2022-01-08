[github action 相关信息](https://github.com/bxb100/blog/issues/7)

* [生成 release log automatically-generated-release-notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes)

* [输入参数多行](https://github.community/t/set-output-truncates-multiline-strings/16852)

* Anyway to check the error message and retry?
	1. 社区里面用 `||` 来 retry 命令, 但是我这个 shell 着实反锁又不想写个 sh 文件, 忽略[^1]
	2. 还有种思路就是利用 `2> file` 输出错误信息, 判断[^3], 然后利用 workflow 的 API 来重新调用, 调用代码如下[^2]
		* 注意 `failure()` 标识[此 job 中上一个 step 失败](https://docs.github.com/en/actions/learn-github-actions/expressions#failure)
		* `${{ secrets.GH_PAT }}` 注意给 workflow 的权限
```yaml
      - name: Failed
        if: ${{ failure() }}
        run: |
          if grep -q 'errorMessage' err.log;
          curl --location --request POST 'https://api.github.com/repos/xxx/xxx/actions/workflows/xxxx/dispatches' \
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





[^1]: https://github.community/t/how-to-retry-a-failed-step-in-github-actions-workflow/125880
[^2]: https://docs.github.com/en/rest/reference/actions#create-a-workflow-dispatch-event Create a workflow dispatch event
[^3]: https://stackoverflow.com/questions/11287861/how-to-check-if-a-file-contains-a-specific-string-using-bash