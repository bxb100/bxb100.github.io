---
title: 关于 action-upload 重写的一些记录
pubDatetime: 2026-03-15T20:26:01.000Z
modDatetime: 2026-05-10T13:04:40.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/73
tags:
  - uncategorized
---

最近用到 [action-upload](https://github.com/bxb100/action-upload), 所以又重新捡起来更新一下代码, 同步一下上游 [template](https://github.com/actions/typescript-action) 代码

更新的过程中遇到很多麻烦的地方, 这里流水线记录一下还记得部分

1. 依赖的包 `@action` 最新版本都只支持 esm 了, 所以原来的 cjs 打包就无法使用了
2. jest 还没有原生支持 esm[^1]
3. ncc 打包还是可用的, 但是我选择[尤大](https://voidzero.dev/)的生态版图: tsdown (rollup 我尝试之后由于打包 opendal 的 native binary 不知道怎么配置就放弃了)
   - tsdown neverBundle 的逻辑在 alwaysBundle 之前执行, 这个没做约束, 可能以后会出现问题
4. [issues 180](https://github.com/bxb100/action-upload/issues/180) 分别记录了使用 tsdown 打包时候出现未定义 require 和 jest mock 无法生效的问题
   - 前者定义一下 `var require` 就能满足 esm 的要求了
   - 后者一定要在 mock 之后再 dynamic import 需要测试方法所在的 module (感谢 claude)
5. 使用 [prek](https://github.com/j178/prek) 在本地测试 [super-linter](https://github.com/super-linter/super-linter/blob/main/docs/run-linter-locally.md) 的时候
   - 注意 docker 只有 amd64 位产出
   - prek/pre-commiter 默认绑定当前文件夹到 `/src`, 需要配置 super-linter `DEFAULT_WORKSPACE="/src"`
   - trivy 下载需要在 `/tmp/.cache` (不确定是不是必须在 tmp) 否则会出现 mkdir 无权限的问题
6. oxc fmt 和 lint 开箱即用, 好吃爱吃

[^1]: https://github.com/jestjs/jest/issues/9430
