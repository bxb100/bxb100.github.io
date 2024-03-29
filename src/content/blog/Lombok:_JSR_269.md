---
title: Lombok  JSR 269
pubDatetime: 2023-03-03T12:47:25.000Z
modDatetime: 2023-03-03T12:48:37.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/35
tags:
  - uncategorized
---

Lombok 背后使用的技术是 [JSR 269: Pluggable Annotation Processing API](https://jcp.org/en/jsr/detail?id=269) [^1]

见:
https://github.com/projectlombok/lombok/blob/e5c324c615c1e304b2a9a64bc7f8608a67b0a74e/buildScripts/compile.ant.xml#L71

有关的文献和仓库:

- https://github.com/gunnarmorling/awesome-annotation-processing
- http://notatube.blogspot.com/2010/12/project-lombok-creating-custom.html 注意 maven scope `provided`
- https://github.com/mplushnikov/lombok-intellij-plugin

[^1]: https://stackoverflow.com/questions/6107197/how-does-lombok-work
