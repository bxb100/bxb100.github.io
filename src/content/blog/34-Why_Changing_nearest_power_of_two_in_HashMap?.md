    ---
    title: Why Changing nearest power of two in HashMap?
    pubDatetime: 2023-02-16T10:05:37.000Z
    modDatetime: 2023-02-16T10:05:37.000Z
    url: https://github.com/bxb100/bxb100.github.io/issues/34
    tags:
      - question


    ---

    ## JDK 7

```java
   static int roundUpToPowerOf2(int cap) {
        return cap >= MAXIMUM_CAPACITY
                ? MAXIMUM_CAPACITY
                : (cap > 1) ? Integer.highestOneBit((cap - 1) << 1) : 1;
    }
```

## JDK 8

> http://hg.openjdk.java.net/jdk8/jdk8/jdk/rev/d62c911aebbb?revcount=80

```java
    static int tableSizeFor(int cap) {
        int n = cap - 1;
        n |= n >>> 1;
        n |= n >>> 2;
        n |= n >>> 4;
        n |= n >>> 8;
        n |= n >>> 16;
        return (n < 0) ? 1 : (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1;
    }
```

## JDK 11

> https://bugs.openjdk.java.net/browse/JDK-8203279

```
static int tableSizeFor(int cap) {
   int n = -1 >>> Integer.numberOfLeadingZeros(cap - 1);
   return (n < 0) ? 1 : (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1;
}
```

## JMH

```java
@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.NANOSECONDS)
@Warmup(iterations = 2, time = 1, timeUnit = TimeUnit.SECONDS)
@Measurement(iterations = 5, time = 1, timeUnit = TimeUnit.SECONDS)
@Fork(1)
@State(Scope.Thread)
public class TableSizeForTest {

    static final int MAXIMUM_CAPACITY = 1 << 30;

    static final int roundSize = 100_000_000;

    public static void main(String[] args) throws RunnerException {
        Options opt = new OptionsBuilder()
                .include(TableSizeForTest.class.getSimpleName())
                .build();
        new Runner(opt).run();
    }

    @Benchmark
    public void jdk8(Blackhole bh) {
        for (int i = 1; i <= roundSize; i++) {
            bh.consume(tableSizeFor(i));
        }
    }

    private int tableSizeFor(int cap) {
        int n = cap - 1;
        n |= n >>> 1;
        n |= n >>> 2;
        n |= n >>> 4;
        n |= n >>> 8;
        n |= n >>> 16;
        return (n < 0) ? 1 : (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1;
    }

    @Benchmark
    public void jdk7(Blackhole bh) {
        for (int i = 1; i <= roundSize; i++) {
           bh.consume(roundUpToPowerOf2(i));
        }
    }

    private int roundUpToPowerOf2(int cap) {
        return cap >= MAXIMUM_CAPACITY
                ? MAXIMUM_CAPACITY
                : (cap > 1) ? Integer.highestOneBit((cap - 1) << 1) : 1;
    }

    @Benchmark
    public void jdk11(Blackhole bh) {
        for (int i = 1; i <= roundSize; i++) {
            bh.consume(   tableSizeFor_JDK11(i));
        }
    }

    private int tableSizeFor_JDK11(int cap) {
        int n = -1 >>> Integer.numberOfLeadingZeros(cap - 1);
        return (n < 0) ? 1 : (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1;
    }
}
```

```
Benchmark               Mode  Cnt          Score          Error  Units
TableSizeForTest.jdk11  avgt    5  360240163.800 ± 11650107.231  ns/op
TableSizeForTest.jdk7   avgt    5  131499421.850 ±  2815742.686  ns/op
TableSizeForTest.jdk8   avgt    5  223145028.320 ±  5272965.882  ns/op
```

It's look like 7 > 11 > 8, Why not using JDK 7 verison?
