---
title: ANTLR 速记
pubDatetime: 2023-01-17T08:20:45.000Z
modDatetime: 2023-01-17T08:39:18.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/31
tags:
  - DEV
---

## 结合性和左、右递归

```g4
grammar Expr;

expr: expr '^' expr
| INT
;

INT: [0-9]+;
WS: [ \t\r\n]+ -> skip;
```

使用 `assoc`

```g4
grammar Expr;

expr: <assoc=right> expr '^' expr
| INT
;

INT: [0-9]+;
WS: [ \t\r\n]+ -> skip;

```

<img width="634" alt="image" src="https://user-images.githubusercontent.com/20685961/212845734-0fe03e3f-76e6-4d95-a8b8-ba494a2ffecf.png">

---

<a id='issuecomment-1385027634'></a>

### 左递归

`*( *a) [] []`

```antlr
grammar PC;

decl: decl '[' ']'
| '*' decl
| '(' decl ')'
| ID
;

ID: [a-zA-Z]+;
WS: [ \t\r\n]+ -> skip;

```

<img width="145" alt="image" src="https://user-images.githubusercontent.com/20685961/212849377-0046b5ef-557a-4927-94ba-024490d76f5e.png">
