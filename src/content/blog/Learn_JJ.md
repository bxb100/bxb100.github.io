---
title: Learn JJ
pubDatetime: 2025-08-14T13:05:45.000Z
modDatetime: 2025-08-14T15:25:50.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/68
tags:
  - DEV
---

- https://steveklabnik.github.io/jujutsu-tutorial
- https://justinpombrio.net/2025/02/11/jj-cheat-sheet.html

[jj-cheat-sheet.pdf](https://github.com/user-attachments/files/21773596/jj-cheat-sheet.pdf)

---

<a id='issuecomment-3188865696'></a>

### Rebase[^1]

- `-s`
- `-r`

That's a little rough. There are some helpful diagrams in `jj rebase --help` that got me to understand the differences between `-r`, `-s`, and `-b`, but the short of it is that `-r` will sort of "rip out" a change and move it somewhere else. `-s` does that, but also moves descendants. In other words, imagine that we have a history like this:

```
A - B - C - D
```

If we `jj rebase -r C` to somewhere else, it will only move that revision, and so you end up with

```
A - B - D
```

Whereas `-s` operates more like I'd be used to with git: it takes the children too, so after `jj rebase -s C`, you'd have:

```
A - B
```

as both C and D are somewhere else now. `-b` works to rebase a branch.

```shell
$ jj rebase -s 'all:roots(trunk..@)' -d trunk
```

> We're rebasing all of the root changes from trunk to `@` onto `trunk`.

[^1]: https://steveklabnik.github.io/jujutsu-tutorial/advanced/simultaneous-edits.html#:~:text=That%27s%20a%20little,history%20like%20this%3A
