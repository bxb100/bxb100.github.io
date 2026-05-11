---
title: SWAR 的理解
pubDatetime: 2024-01-09T09:22:05.000Z
modDatetime: 2026-05-10T13:05:59.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/43
tags:
  - 读后感
---

原文：https://lemire.me/blog/2022/01/21/swar-explained-parsing-eight-digits/

```c
uint32_t  parse_eight_digits_unrolled(uint64_t val) {
  const uint64_t mask = 0x000000FF000000FF;
  const uint64_t mul1 = 0x000F424000000064; // 100 + (1000000ULL << 32)
  const uint64_t mul2 = 0x0000271000000001; // 1 + (10000ULL << 32)
  val -= 0x3030303030303030;
  val = (val * 10) + (val >> 8); // val = (val * 2561) >> 8;
  val = (((val & mask) * mul1) + (((val >> 16) & mask) * mul2)) >> 32;
  return val;
}
```

- 假设字符串是 `12345678` 转为小端的 bytes 是 `\x38 \x37 \x36 \x35 \x34 \x33 \x32 \x31`
- `val -= 0x3030303030303030` 则 val 的值为 `0x0807060504030201`
- `(val * 10) + (val >> 8)` 构造成 bytes 为
  - 1th byte: `10 * b1 + b2` (为了讨论的更为通用，采用原文形式 b1,b2,b3,b4,b5,b6,b7,b8)
  - 3th byte: `10 * b3 + b4`
  - 5th byte: `10 * b5 + b6`
  - 7th byte: `10 * b3 + b4`
- `((val & mask) * mul1)`
  - `val & mask` 只保留 1th, 5th byte
  - `* mul1` 可以通过分配率的形式来理解，`1th byte * 1000000ULL * 2^32` 就是 `1th byte * 1000000ULL`, 通同理 `5th * 100`, 二者相加的和存放在 5th byte（这里还要注意这里可以存储 32 位，而这里最大也只有 255 \* 10^6, 所以也防止溢出）

- `(((val >> 16) & mask) * mul2)` 同理，在 5th byte 上加上了 `(10 * b3 + b4) * 10000ULL + 10 * b7 + b8`
- 最后第 5th byte 也就是 32 位开始的和就是 `10^6*(10 * b1 + b2) + 10^2*(10 * b5 + b6) + 10^4*(10 * b3 + b4) + 10^0*(10 * b3 + b4)` 也就是如下所示的累加和

```c
uint32_t parse_eight_digits(const unsigned char *chars) {
  uint32_t x = chars[0] - '0';
  for (size_t j = 1; j < 8; j++)
    x = x * 10 + (chars[j] - '0');
  return x;
}
```

---

~~理解的过程中，把数值 `1000000ULL` 按照 10 进制的形式填到二进制里面，以为是 `0100 0000`~~ 😢 :(

---

<a id='issuecomment-1882698869'></a>
从 https://github.com/gunnarmorling/1brc#running-the-challenge 那里看到的优化技巧

---

<a id='issuecomment-1886184937'></a>
https://github.com/gunnarmorling/1brc/blob/085168a0b3c73b64409afcf58a1f0a67f746a30a/src/main/java/dev/morling/onebrc/CalculateAverage_royvanrijn.java#L140C11-L141

`Salt Lake City;10.3` 的 bytes:

```
byte[19] { 83, 97, 108, 116, 32, 76, 97, 107, 101, 32, 67, 105, 116, 121, 59, 49, 48, 46, 51 }
```

按 Long 64bits 来分割的话，为(这里都是**大端**，后面使用需要 `Long.reverseBytes`）：

```
// 83, 97, 108, 116, 32, 76, 97, 107
// 6008202623902835051L hex: 0x53616C74204C616B
// 101, 32, 67, 105, 116, 121, 59, 49
// 7286898317290191665L hex: 0x6520436974793B31
// 48, 46, 51
// 0x302E33L
```

可以看到

```java
final long match = word ^ 0x3B3B3B3B3B3B3B3BL;
long mask = ((match - 0x0101010101010101L) & ~match) & 0x8080808080808080L;
```

主要是判断 bytes 里面有没有 `;` (0x3B)，如果有的话，高位为 1 剩余都为 0

```java
final long partialWord = word & ((mask >> 7) - 1);
```

这里的技巧是右移 7 位再减 1，等价于高位后 bytes 均为 1，那么这里就是分割 `;` 后面 bytes 的值（这里是小端计算！！）

从上面的举例来说，也就是 `101, 32, 67, 105, 116, 121, 59, 49` bytes 走这个逻辑：

64bits Long 值为 `7286898317290176512L` 也就是 `0x6520436974790000`

`mask` 值为 `0x80000000000000`

`((mask >> 7) - 1)` 值就是 `0xFFFFFFFFFFFF`

所以最后得到 `7286898317290176512L` 即 `e City\000\000`

<details>
<summary>转换为 string 的代码</summary>

这里也挺搞笑的，小端进去，String 按大端转，最后结果是可读的 ;)

```java
public byte[] longToBytes(long x) {
    ByteBuffer buffer = ByteBuffer.allocate(Long.BYTES);
    buffer.putLong(x);
    return buffer.array();
}

new String(longToBytes(7286898317290176512L))
```

当然后面的代码并没有使用这个方式获取 string，而是直接通过 `UNSAFE.getByte` 直接获取内存中映射的值

</details>

后面还有一段代码, 也是一个技巧，由前文可知某一个 byte 是 `0x80`，其余为 0，也就是说 0 的个数和 byte 的关系是 `1:8`

```java

final int index = Long.numberOfTrailingZeros(mask) >> 3;

```

---

<a id='issuecomment-1886252447'></a>
推荐书 [算法心得](https://www.amazon.com/Hackers-Delight-2nd-Henry-Warren/dp/0321842685)
