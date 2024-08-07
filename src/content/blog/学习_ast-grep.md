---
title: 学习 ast-grep
pubDatetime: 2024-04-12T09:11:54.000Z
modDatetime: 2024-04-12T09:13:47.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/52
tags:
  - Horizon
  - DEV
---

- https://ast-grep.github.io
- https://github.com/ast-grep/ast-grep

## [demo](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6IlByb21pc2UuYWxsKCRBKSIsInJld3JpdGUiOiIiLCJjb25maWciOiJpZDogbm8tYXdhaXQtaW4tcHJvbWlzZS1hbGxcbmxhbmd1YWdlOiBUeXBlU2NyaXB0XG5ydWxlOlxuICBraW5kOiBhd2FpdF9leHByZXNzaW9uXG4gIHBhdHRlcm46IGF3YWl0ICRCXG4gIGluc2lkZTpcbiAgICBwYXR0ZXJuOiBQcm9taXNlLmFsbCgkJCQpICMgYSBzdWIgcnVsZSBvYmplY3RcbiAgICBzdG9wQnk6IGVuZCAgICAgICAgICAgICAgICAgICMgc3RvcEJ5IGFjY2VwdHMgJ2VuZCcsICduZWlnaGJvcicgb3IgYW5vdGhlciBydWxlIG9iamVjdC5cbiAgICBmaWVsZDogYXJndW1lbnRzXG5maXg6ICRCIiwic291cmNlIjoiUHJvbWlzZS5hbGwoW1xuICBhd2FpdCBQcm9taXNlLnJlc29sdmUoMTIzKSxcbiAgUHJvbWlzZS5yZXNvbHZlKDEyNCksXG4gIGF3YWl0IFByb21pc2UucmVzb2x2ZSgxMjUpXG5dKVxuUHJvbWlzZS5hbGwoKVxuXG52YXIgYSA9IHtcbiAgbm9ybWFsS2V5OiBwcm90b3R5cGVcbn0ifQ==): 替换 `Promise.all` inside `await expression`

```ts
Promise.all([
  await Promise.resolve(123),
  Promise.resolve(124),
  await Promise.resolve(125),
]);
Promise.all();

var a = {
  normalKey: prototype,
};
```

```yaml
id: no-await-in-promise-all
language: TypeScript
rule:
  kind: await_expression
  pattern: await $B
  inside:
    pattern: Promise.all($$$)
    stopBy: end
    field: arguments
fix: $B
```

- `CST` 会显示全部的信息，比 `AST` 显示的数据要全面[^1]
- `kind` 代表 tree-sitter node 的名称
- `inside.field` 代表的是字段的类型

<img width="801" alt="image" src="https://github.com/bxb100/bxb100.github.io/assets/20685961/2381c314-d1e1-46bb-a6c2-3693105966e0">

[^1]: https://ast-grep.github.io/advanced/core-concepts.html#ast-vs-cst
