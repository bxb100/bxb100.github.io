---
title: SWAR explained  parsing eight digits 的理解
date: 1704792125000
tags:
- 读后感

url: https://github.com/bxb100/bxb100.github.io/issues/43

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

* 假设字符串是 `12345678` 转为小端的 bytes 是 `\x38 \x37 \x36 \x35 \x34 \x33 \x32 \x31`
* `val -= 0x3030303030303030` 则 val 的值为 `0x0807060504030201`
* `(val * 10) + (val >> 8)` 构造成 bytes 为
   * 1th byte: `10 * b1 + b2` (为了讨论的更为通用，采用原文形式 b1,b2,b3,b4,b5,b6,b7,b8)
   * 3th byte: `10 * b3 + b4`
   * 5th byte: `10 * b5 + b6`
   * 7th byte: `10 * b3 + b4`
* `((val & mask) * mul1)`
   * `val & mask` 只保留 1th, 5th byte
   * `* mul1` 可以通过分配率的形式来理解，`1th byte * 1000000ULL * 2^32` 就是 `1th byte * 1000000ULL`, 通同理 `5th * 100`, 二者相加的和存放在 5th byte（这里还要注意这里可以存储 32 位，而这里最大也只有 255 * 10^6, 所以也防止溢出）

* `(((val >> 16) & mask) * mul2)` 同理，在 5th byte 上加上了 `(10 * b3 + b4) * 10000ULL + 10 * b7 + b8`
* 最后第 5th byte 也就是 32 位开始的和就是 `10^6*(10 * b1 + b2) + 10^2*(10 * b5 + b6) + 10^4*(10 * b3 + b4) + 10^0*(10 * b3 + b4)` 也就是如下所示的累加和
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
