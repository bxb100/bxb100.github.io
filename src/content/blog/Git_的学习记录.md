---
title: Git 的学习记录
pubDatetime: 2024-03-27T14:54:09.000Z
modDatetime: 2026-03-27T00:02:58.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/49
tags:
  - DEV
---

# 如何使用 git 拉取部分文件

有时候需要 clone 一些仓库到本地来查看或者修改，但是对于 https://github.com/eugenp/tutorials 和 https://github.com/raycast/extensions 的仓库来说，全量下载就不是一个好选择（尤其是对国内复杂的网络环境来说），然后我发现了 `git-sparse-checkout`[^1]（虽说 cargo 就有 spare checkout 但是没意识到 🤣 ）

下面都来自 stackoverflow[^2]

- `git clone --filter=blob:none --sparse  %your-git-repo-url%`[^3]
  - `--filter=blob:none` will filter out all blobs (file contents) until needed by Git
  - `--sparse` 告诉 git 只会疏松克隆, 如果没有 `--filter` 虽然克隆的文件都一样，但是这个 `.git/objects/packs` 文件夹明显要大

- `git sparse-checkout add %subdirectory-to-be-cloned%`
  - 看到这个我才知道 GitHub 为啥每个文件都给路径的复制按钮，原来还有如此妙用

[^1]: https://git-scm.com/docs/git-sparse-checkout

[^2]: https://stackoverflow.com/a/73254328/6699096

[^3]: https://git-scm.com/docs/git-clone
