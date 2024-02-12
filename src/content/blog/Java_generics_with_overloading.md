---
title: Java generics with overloading
pubDatetime: 2022-07-29T16:34:58.000Z
modDatetime: 2023-01-17T05:34:10.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/20
tags:
  - Archive
  - DEV
---

    The scenario:

```java
    public static void test1(Object... args) {

    }

    public static void test1(List<Object> args) {

    }

```

there are two overloading method, but when you're using

```java
 List<Long> list1 = new ArrayList<>();
 test1(list1);
```

It's always using the first method `test1(Object... args)`, but when using `List<Object> list2` the executor is different, It's too wired

---

Some document identified

> The example above shows why generics and arrays don't mix well together. **An array is what is called reifiable type -- a type where full type information is available during run-time.** It is because Java array is reifiable that the Java run-time can check what we store into the array matches the type of the array and throw an `ArrayStoreException ` at us if there is a mismatch. **Java generics, however, is not reifiable due to type erasure**. Java designers have decided not to mix the two.[^1]

> the `List<?>` means you can assign any type of List to it and `List<Object>` means you can store any type of object into it.[^2]

Sure, it's not the same question, but I think some conception can go to the same destination

I think the runtime compiler design to obey this:

1. `List` same as `List<Object>`
2. `List<Type> list1` with generics can accept any type
3. `List<Object>` means just accept `List<Object>` or `List`
4. `List<T> list1` calling varargs method equals `new Object[]{ list1 }`
5. Using `test1(Collections.singletonList(x))` equals `test1(new ArrayList<Object>())`

---

So this is the check trick problem

---

<a id='issuecomment-1347703171'></a>
generics safety term like `PECS`

---

<a id='issuecomment-1384855824'></a>

```java
public static void test1(List<Object> args) {

}
```

Diff with

```java
public static void test1(List args) {

}
```

```java
public static void test1(List<?> args) {

}
```

[^1]: https://nus-cs2030s.github.io/2021-s2/21-erasure.html
[^2]: https://www.java67.com/2021/08/real-difference-between-list-and-list.html
