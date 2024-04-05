---
title: 流水账：给 blog 加上 aplayer
pubDatetime: 2024-04-05T13:36:19.000Z
modDatetime: 2024-04-05T13:36:26.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/50
tags:
  - DEV
---

- 直接参看 https://aplayer.js.org/#/home

`yarn add aplayer`

```js
import "aplayer/dist/APlayer.min.css";
import APlayer from "aplayer";

const ap = new APlayer(options);
```

```
[vite]: Rollup failed to resolve import "APlayer/dist/APlayer.min.css" from "~/home/runner/work/bxb100.github.io/bxb100.github.io/src/components/Player.tsx".
```

失败: 主因错误的使用了 `yarn` 但是不知道为啥不行

- 直接使用 js，没有 default 无法导入 APlayer
- 使用 npm `npm install aplayer --save` 但是报错

```
src/components/Player.tsx:3:21 - error ts(7016): Could not find a declaration file for module 'aplayer'.
```

参看[^1] 添加 `aplayer.d.ts` 成功

---

期间设置了 `build.rollupOptions.external` `build.rollupOptions.commonjsOptions` 都无用（事后来看确实不是问题的主因），所以最后为啥用 `npm` 就行但是一开始 `yarn` 不行没弄懂

[^1]: https://stackoverflow.com/questions/41292559/could-not-find-a-declaration-file-for-module-module-name-path-to-module-nam
