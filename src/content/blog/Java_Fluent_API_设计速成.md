---
title: Java Fluent API 设计速成
pubDatetime: 2023-01-14T07:05:06.000Z
modDatetime: 2023-01-17T04:40:40.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/30
tags:
  - DEV
---

> 译 https://blog.jooq.org/the-java-fluent-api-designer-crash-course/

自从 [Martin Fowler 谈论流畅的接口](http://martinfowler.com/bliki/FluentInterface.html)以来，人们开始到处[链式方法](https://stackoverflow.com/questions/1103985/method-chaining-why-is-it-a-good-practice-or-not/8745227)，为每个可能的用例创建流畅的 API（或 [DSLs](https://en.wikipedia.org/wiki/Domain-specific_language)）。原则上，几乎所有类型的 DSL 都可以映射到 Java。让我们看看如何做到这一点

## DSL 规则

DSL（领域特定语言）通常是根据大致如下的规则构建的

```
1. SINGLE-WORD
2. PARAMETERISED-WORD parameter
3. WORD1 [ OPTIONAL-WORD ]
4. WORD2 { WORD-CHOICE-A | WORD-CHOICE-B }
5. WORD3 [ , WORD3 ... ]
```

或者，你也可以像这样声明语法（由 [Railroad Diagrams 站点](http://www.bottlecaps.de/rr/ui) 支持）

```
Grammar ::= (
  'SINGLE-WORD' |
  'PARAMETERISED-WORD' '('[A-Z]+')' |
  'WORD1' 'OPTIONAL-WORD'? |
  'WORD2' ( 'WORD-CHOICE-A' | 'WORD-CHOICE-B' ) |
  'WORD3'+
)
```

换句话说，你有一个开始条件或状态，在达到结束条件或状态之前，你可以从中选择一些你的语言的单词。它就像一个状态机，因此可以画成这样的图：

<figure>
  <img
src="https://user-images.githubusercontent.com/20685961/212459554-d1b333ef-6d35-4bdb-bcae-bfefa24b296e.png"
  alt="image">
  <figcaption>用 http://www.bottlecaps.de/rr/ui 创建</figcaption>
</figure>

## Java 实现这些规则

使用 Java 接口，对上述 DSL 进行建模非常简单。本质上，你必须遵循以下转换规则：

- 每个 DSL **keyword** 都变成了一个 Java method
- 每个 DSL **connection** 都变成了一个接口
- 当你有一个 **mandatory** 选择时（你不能跳过下一个关键字），那个选择的每个关键字都是当前接口中的一个方法。如果只有一个关键字可能，那么就只有一种方法
- 当你有一个 **optional** 关键字时，当前接口扩展下一个接口（及其所有 keyword/methods）
- 当你有一个 **repetition** 的关键字时，表示可重复关键字的方法返回接口本身，而不是下一个接口
- 每个 DSL **子定义** 都成为一个参数。这将允许递归

请注意，也可以使用类而不是接口对上述 DSL 进行建模。但是一旦你想重用相似的关键字，方法的多重继承可能会派上用场，你可能最好使用接口。

设置好这些规则后，您可以随意重复它们以创建任意复杂度的 DSL，例如 [jOOQ](https://www.jooq.org/)。当然，您必须以某种方式实现所有接口，但那是另一回事了。

以下是将上述规则转换为 Java 的方式：

```java
// 初始接口，DSL 的入口点
// 根据DSL的性质，这也可以是一个带有静态方法的类
// 这样可以让你的 DSL 更加扁平(fluent)
interface Start {
	End singleWord();
	End parameterisedWord(String parameter);
	Intermediate1 word1();
	Intermediate2 word2();
	Intermediate3 word3();
}

// 终止接口，也可以包含方法 execute();
interface End {
	void end();
}
// 拓展中间 DSL "step" 可以由方法 optionalWord() 返回
// 让这个方法 "optional"
interface Intermediate1 extends End {
	End optionalWord();
}

// 中间 DSL "step" 提供了几个选择(类似于 Start)
interface Intermediate2 {
	End wordChoiceA();
	End wordChoiceB();
}

// 中间接口由 word3() 返回自己, 以允许重复调用.
// 重复调用可以在任意时间结束, 因为它继承自 End
interface Intermediate3 extends End {
	Intermediate3 word3();
}

```

定义了上述语法后，我们现在可以直接在 Java 中使用此 DSL。以下是所有可能的结构：

```java

Start start = new StartImpl();// ...

start.singleWord().end();
start.parameterisedWord("abc").end();

start.word1().end();
start.word1().optionalWord().end();

start.word2().wordChoiceA().end();
start.word2().wordChoiceB().end();

start.word3().end();
start.word3().word3().end();
start.word3().word3().word3().end();
```

最棒的是，您的 DSL 直接用 Java 编译！你得到一个免费的解析器。您还可以在 Scala（或 Groovy）中使用相同的表示法或在 Scala 中使用略有不同的表示法（省略点 `.` 和括号 `()`）重新使用此 DSL：

```scala
val start = // ... 

(start singleWord) end;
(start parameterisedWord "abc") end; 

(start word1) end;
((start word1) optionalWord) end; 

((start word2) wordChoiceA) end;
((start word2) wordChoiceB) end;

(start word3) end;
((start word3) word3) end;
(((start word3) word3) word3) end;
```

## 实例

在 jOOQ 文档和代码库中可以看到一些真实世界的例子。这是从[以前的一篇文章](https://blog.jooq.org/jooq-meta-a-hard-core-sql-proof-of-concept/)中摘录的使用 jOOQ 创建的相当复杂的 SQL 查询：

```java
create().select(
	r1.ROUTINE_NAME,
	r1.SPECIFIC_NAME,
	decode()
			.when(exists(create()
				.selectOne()
				.from(PARAMETERS)
				.where(PARAMETERS.SPECIFIC_SCHEMA.equal(r1.SPECIFIC_SCHEMA))
				.and(PARAMETERS.SPECIFIC_NAME.equal(r1.SPECIFIC_NAME))
				.and(upper(PARAMETERS.PARAMETER_MODE).notEqual("IN"))),
					val("void"))
			.otherwise(r1.DATA_TYPE).as("data_type"),
	r1.NUMERIC_PRECISION,
	r1.NUMERIC_SCALE,
	r1.TYPE_UDT_NAME,
	decode().when(
	exists(
		create().selectOne()
				.from(r2)
				.where(r2.ROUTINE_SCHEMA.equal(getSchemaName()))
				.and(r2.ROUTINE_NAME.equal(r1.ROUTINE_NAME))
				.and(r2.SPECIFIC_NAME.notEqual(r1.SPECIFIC_NAME))),
		create().select(count())
				.from(r2)
				.where(r2.ROUTINE_SCHEMA.equal(getSchemaName()))
				.and(r2.ROUTINE_NAME.equal(r1.ROUTINE_NAME))
				.and(r2.SPECIFIC_NAME.lessOrEqual(r1.SPECIFIC_NAME)).asField())
	.as("overload"))
.from(r1)
.where(r1.ROUTINE_SCHEMA.equal(getSchemaName()))
.orderBy(r1.ROUTINE_NAME.asc())
.fetch()

```

这有另一个例子，看起来对我很有吸引力。它称为 jRTF，用于以 fluent 的风格在 Java 中创建 RTF 文档：

```java
rtf()
	.header(
			color( 0xff, 0, 0 ).at( 0 ),
			color( 0, 0xff, 0 ).at( 1 ),
			color( 0, 0, 0xff ).at( 2 ),
			font( "Calibri" ).at( 0 ) )
	.section(
			p( font( 1, "Second paragraph" ) ),
			p( color( 1, "green" ) )
	)
).out( out );
```

## 总结

在过去的 7 年里，Fluent API 一直是一种炒作。 Martin Fowler 已经成为一个被大量引用的人并获得了大部分的荣誉，即使以前有 fluent APIs。在 `java.lang.StringBuffer` 中可以看到 Java 最古老的 fluent API 之一，它允许将任意对象附加到字符串。但是 fluent API 的最大好处是它能够轻松地将 **external DSL** 映射到 Java 并将它们实现为任意复杂度的 **internal DSL** 。

---

<a id='issuecomment-1382680120'></a>

# 实现一个简单的加减乘除的 Fluent DSL

DSL:

```
Calc::= Left (Op Right)*

Left::= '(' int | Calc ')'

Right::= '(' int | Calc ')'

Op::= (add | sub | mul | div)
```

```java
public interface Start {

	Operation left(int left);

	Operation left(End left);

}
```

```java
public interface Operation {

	Intermediate add();

	Intermediate sub();

	Intermediate mul();

	Intermediate div();
}
```

```java
public interface Intermediate {

	End right(int right);

	End right(End right);
}
```

```java
public interface End extends Operation {
	int end();
}
```

---

```java
public class Calc {
	public static void main(String[] args) {

		Start start = new StartImpl();

		System.out.println(start.left(1).add().right(2).end());

		System.out.println(start.left(
				start.left(1).mul().right(2)
		).add().right(3).end());

		System.out.println(start.left(1).add().right(
				start.left(2).mul().right(3)
		).end());

		System.out.println(start.left(1).add().right(2).mul().right(1).end());

	}
}

```

不足的地方:

1. 这样实现的话, 远算顺序只能从左到右, `(a+b)*c` 没实现 `a+b*c` 只能有 `a+(b*c)`
2. 重复的 DSL 的实现类传递值不明确

---

<a id='issuecomment-1383046623'></a>

## 类实现

```java
public class StartImpl implements Start {

	@Override
	public Operation left(int left) {
		return new OperationImpl(left);
	}

	@Override
	public Operation left(End left) {
		return new OperationImpl(left.end());
	}
}
```

```java
public class OperationImpl implements Operation {

	int left;

	public OperationImpl(int left) {
		this.left = left;
	}

	public OperationImpl() {
	}

	@Override
	public Intermediate add() {

		return new IntermediateImpl(this, OperatorType.ADD);
	}

	@Override
	public Intermediate sub() {

		return new IntermediateImpl(this, OperatorType.SUB);
	}

	@Override
	public Intermediate mul() {

		return new IntermediateImpl(this, OperatorType.MUL);
	}

	@Override
	public Intermediate div() {

		return new IntermediateImpl(this, OperatorType.DIV);
	}
}

```

```java
public enum OperatorType {
	ADD, SUB, MUL, DIV
}
```

```java
public class IntermediateImpl implements Intermediate {

	OperatorType type;
	OperationImpl operation;

	public IntermediateImpl(OperationImpl operation, OperatorType type) {
		this.operation = operation;
		this.type = type;
	}

	@Override
	public End right(int right) {
		return new EndImpl(this, right);
	}

	@Override
	public End right(End right) {
		return new EndImpl(this, right.end());
	}
}

```

```java
public class EndImpl extends OperationImpl implements End {

	private final int right;
	private final int left;
	private final OperatorType op;

	public EndImpl(IntermediateImpl intermediate, int right) {
		if (intermediate.operation instanceof End) {
			this.left = ((End) intermediate.operation).end();
		} else {
			this.left = intermediate.operation.left;
		}
		this.right = right;
		this.op = intermediate.type;
	}

	@Override
	public int end() {
		return switch (this.op) {
			case ADD -> this.left + this.right;
			case SUB -> this.left - this.right;
			case MUL -> this.left * this.right;
			case DIV -> this.left / this.right;
		};
	}
}
```
