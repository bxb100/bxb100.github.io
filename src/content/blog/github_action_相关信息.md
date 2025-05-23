---
title: github action 相关信息
pubDatetime: 2021-12-31T10:41:11.000Z
modDatetime: 2025-03-12T05:56:06.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/7
tags:
  - API
---

- [生成 release log automatically-generated-release-notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes)
- [Anyway to check the error message and retry?](#issuecomment-1008555315)
- [输入输出多行](#issuecomment-1008555105)
- [如何上传可执行文件到 release 中 (draft)](#issuecomment-1275587834)
- action 不再允许 if 中使用 secrets 参数进行判断[^1][^2]
- [Action Cache](#issuecomment-1510413884)
- [Auto upload to Marketplace](#issuecomment-1512457398)
- [Reusable Workflow](#issuecomment-1521073861)

---

<a id='issuecomment-1008555105'></a>

- [输入参数多行](https://github.community/t/set-output-truncates-multiline-strings/16852)
- [echo multiline strings in github action](https://trstringer.com/github-actions-multiline-strings/)
- 同样的问题还出现在 setting error message 中(这里只讨论直接在 yaml 文件中输出的情况), 输出 `\n` 的文件只会输出第一行, 用如下方式解决:

```shell
ERR_MSG=$(cat err.log)
ERR_MSG="${ERR_MSG//'%'/'%25'}"
ERR_MSG="${ERR_MSG//$'\n'/'%0A'}"
ERR_MSG="${ERR_MSG//$'\r'/'%0D'}"
echo "::error title=err::$ERR_MSG"
```

---

<a id='issuecomment-1008555315'></a>

- Anyway to check the error message and retry?
  1.  社区里面用 `||` 来 retry 命令, 但是我这个 shell 着实繁琐又不想写个 sh 文件, 忽略[^3]
  2.  还有种思路就是利用 `2> file` 输出错误信息, 判断[^4], 然后利用 workflow 的 API 来重新调用[^5], 调用代码如下
      - 注意 `failure()` 标识 [此 job 中存在失败](https://docs.github.com/en/actions/learn-github-actions/expressions#failure)
      - `${{ secrets.GH_PAT }}` 注意给 workflow 的权限
      - `workflow_id` 目前好像只能通过 list workflows 的 API 来获取
      - **可能导致无限调用**, 但是可以将 retry 次数当做 input 传入, 然后判断大于多少次直接 `exit 1`
      - `continue-on-error: true`[^6] 会导致 `failure` 判断失效

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

- 注意一点, `workflow_call` 不允许自己调用自己(错误信息如下), 所以可能只有上述方法可行

```
error parsing called workflow "bxb100/xxx/.github/workflows/download.yml@main": job "retry" calls workflow "bxb100/xxx/.github/workflows/download.yml@main", but doing so would exceed the limit on called workflow depth of 2
```

---

<a id='issuecomment-1275587834'></a>

## 如何上传可执行文件到 release 中 (draft)

1. 首先需要先创建一个 git ref tag 对应的 draft release, 注意此时的 tag 如果没有的话 GitHub 也不会主动给你绑定
   <img width="1115" alt="image" src="https://user-images.githubusercontent.com/20685961/195251932-4b084fde-8bf3-4913-b1ea-b315661f8f8d.png">

see https://gist.github.com/bxb100/d2fedcb3cdc897062ee03920d6ae83be

2. upload the artifact
3. download artifacts, and compress them
4. using `gh` upload to the release

```yaml
     - name: Upload
        run: |
          until gh release upload --clobber --repo ${{ github.repository }} ${{ github.event.inputs.tag }} *.zip *.tar.gz; do
            echo "Attempt $((++attempts)) to upload release artifacts failed. Will retry in 20s"
            sleep 20
          done
        timeout-minutes: 10
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Examples

- https://github.com/temporalio/sdk-java/actions/runs/3132010440/workflow

---

<a id='issuecomment-1510413884'></a>

## Github Action Cache Path

> https://github.com/actions/toolkit/blob/e98bae803b6520b2a331f66011d812c3af8bf6ae/packages/cache

At the beginning, I tried to understand this path as a specified file glob expression, like this: `~/.m2/repository/**`

but correct the way is upload **directory** like this: `~/.m2/repository/*/*/*`

So don't miss the point of what your need

---

<a id='issuecomment-1512457398'></a>

## Auto push to Marketplace

一般来说, GitHub action 如果要上传到 marketplace 的话需要生成 dist 目录, 但是可以通过 https://github.com/JasonEtco/build-and-tag-action 项目自动生成 dist 然后自动上传 (_去除了非 dist, action.xml, 仓库大小减少了~~_)

注意默认 `github.token` 权限问题: <https://github.com/JasonEtco/build-and-tag-action/issues/40> 注意一定要有 `write` 权限...

---

<a id='issuecomment-1521073861'></a>

## Reusable workflow

If you using a useable workflow, input with `env` will cause an error (test `secrets`, `needs.xx.outputs.xxx` working now)[^7]

```log
The workflow is not valid. xxxx: Unrecognized named-value: 'env'.
```

My work on https://github.com/BurtonQin/lockbud/pull/49 show that problems

solve the problem using a config like this:

```yaml
with:
  rust_version: ${{ needs.test.outputs.rust_version }}
```

---

<a id='issuecomment-1565175314'></a>

## Docker

In the Action, we have three ways to use the docker

1. using container[^8], need to notice that runner is running a docker image
2. using service[^9], it like expose a port to workflow runtime, so we don't change the runner env
3. using docker action[^10]

---

<a id='issuecomment-2716605081'></a>

# 在 PR 中使用 secret 的一些手段

1. 使用 `pull_request_target`[^11], 我在 https://github.com/bxb100/action-test/pull/16/checks 中测试过, 需要配合 enviroment secret 的授权来做更严格的限制
2. 通过 `repository_dispatch` 触发[^12], 可以参看 https://github.com/1Password/load-secrets-action/blob/85e0e789db06bad7e43b5f7b0c36700967d04155/.github/workflows/ok-to-test.yml 用例, 可以通过 api 也可以通过一个新的 action 来 trigger (没想到的地方是, 这个能关联到正确的 commit-hash 中, 需要进步理解)

[^1]: https://docs.github.com/en/actions/security-guides/encrypted-secrets#:~:text=Secrets%20cannot%20be%20directly%20referenced%20in%20if%3A%20conditionals.%20Instead%2C%20consider%20setting%20secrets%20as%20job%2Dlevel%20environment%20variables%2C%20then%20referencing%20the%20environment%20variables%20to%20conditionally%20run%20steps%20in%20the%20job.

[^2]: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#example-using-secrets

[^3]: https://github.community/t/how-to-retry-a-failed-step-in-github-actions-workflow/125880

[^4]: https://stackoverflow.com/questions/11287861/how-to-check-if-a-file-contains-a-specific-string-using-bash

[^5]: https://docs.github.com/en/rest/reference/actions#create-a-workflow-dispatch-event Create a workflow dispatch event

[^6]: https://docs.github.com/en/actions/learn-github-actions/contexts#steps-context

[^7]: https://github.com/orgs/community/discussions/26671

[^8]: https://docs.github.com/en/actions/using-jobs/running-jobs-in-a-container

[^9]: https://docs.github.com/en/actions/using-containerized-services/about-service-containers

[^10]: https://docs.github.com/en/actions/creating-actions/creating-a-docker-container-action

[^11]: https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#pull_request_target

[^12]: https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#repository_dispatch
