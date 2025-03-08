---
title: Java 使用中的一些奇巧淫技
pubDatetime: 2025-03-08T04:44:45.000Z
modDatetime: 2025-03-08T04:44:45.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/64
tags:
  - DEV
---

- [双分派](https://refactoringguru.cn/design-patterns/visitor-double-dispatch)
  - 双分派是一个允许在重载时使用动态绑定的技巧
  - 利用后期动态类型绑定
- [递归类型参数(recursive type parameter)](https://github.com/clxering/Effective-Java-3rd-edition-Chinese-English-bilingual/blob/dev/Chapter-5/Chapter-5-Item-30-Favor-generic-methods.md)
  - `<E extends Comparable<E>>` 可以读作可以与自身进行比较的每个类型 E
