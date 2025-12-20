---
title: Zero to production in Rust An Option 笔记
pubDatetime: 2023-04-19T10:10:05.000Z
modDatetime: 2025-12-20T13:49:41.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/40
tags:
  - DEV
  - Rust
---

~~## ZLD 的配置~~

~~Rust 编译大部分耗时在 [linker 阶段](<https://en.wikipedia.org/wiki/Linker_(computing)>), 所以文中给与 ZLD 配置, 但是注意后面的配置路径有点问题, homebrew Apple silicon 默认的安装位置在`/opt/homebrew/bin/`~~

````diff
# .cargo/config.toml
# On Windows
# ```
# cargo install -f cargo-binutils
# rustup component add llvm-tools-preview
# ```
[target.x86_64-pc-windows-msvc]
rustflags = ["-C", "link-arg=-fuse-ld=lld"]
[target.x86_64-pc-windows-gnu]
rustflags = ["-C", "link-arg=-fuse-ld=lld"]
# On Linux:
# - Ubuntu, `sudo apt-get install lld clang`
# - Arch, `sudo pacman -S lld clang`
[target.x86_64-unknown-linux-gnu]
rustflags = ["-C", "linker=clang", "-C", "link-arg=-fuse-ld=lld"]
# On MacOS, `brew install michaeleisel/zld/zld`
[target.x86_64-apple-darwin]
rustflags = ["-C", "link-arg=-fuse-ld=/usr/local/bin/zld"]
[target.aarch64-apple-darwin]
- rustflags = ["-C", "link-arg=-fuse-ld=/usr/local/bin/zld"]
+ rustflags = ["-C", "link-arg=-fuse-ld=/opt/homebrew/bin/zld"]
````

提到了新出来的 [mold](https://github.com/rui314/mold) 会更加好一点, 有机会再试试

---

update:

- zld 不再维护的了, 使用 lld 替代[^1], 但是和 reddit 上有用户评论一样, 速度并没有提示很高[^2]
- mold 的 MacOS 版本 sold 是商业版需要购买 licence , 放弃

总结: 不要花时间在 linker 上

---

<a id='issuecomment-1515125528'></a>

## 配置

### CI

- lockbud, 注意复制 tool-chain[^3]
- [GitHub Action yaml](https://gist.github.com/LukeMathWalker/5ae1107432ce283310c3e601fac915f3)
- [加速 GitHub Action 构建速度(cache) 的一些实践](https://github.com/bxb100/zero-to-production/issues/1#issue-1702972458)

### Makefile

- 最好实现 makefile 的自解释的功能, 参看 [Self-Documented Makefile](https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html)
- CLion makefile 编译报错无法解决, 但不影响使用, 所以忽略

### SQLx

1. 首先 `cargo install slqx-cli` 如果不指定版本, 它会使用最新的 `0.7.0` 版本, 但是这个版本不兼容 `0.6.3` 所以无法得到 offline 的 `sqlx-data.json` (这个在新版本中已经被取消了)
2. 新版本(0.7.0)取消了 `runtime-actix-rustls` 使得整个项目都无法正常运行, 所以暂时无法简单通过升级版本解决上面的问题
3. 所以使用固定 install 的写法 `cargo install sqlx-cli@0.6.3`

---

<a id='issuecomment-1516102092'></a>

## 技巧

### 使用 night 且不改变项目本身的 toolchain

使用 `+night` 不需要在项目中设置 `tool-chain`, 当然要注意下编译使用的版本需要和项目的一致, 比如 https://github.com/BurtonQin/lockbud

```shell
# Use the nightly toolchain just for this command invocation
cargo +nightly expand
```

### `Actix-Web` 的一些技巧

[actix-web](https://github.com/actix/actix-web) 支持共享 app 配置了[^4]

```rust
fn create_app() -> App<
    impl ServiceFactory<
        ServiceRequest,
        Config = (),
        Response = ServiceResponse<impl MessageBody>,
        Error = Error,
        InitError = (),
    >,
> {
    App::new()
        .route("/", web::get().to(greet))
        .route("/health_check", web::get().to(health_check))
        .route("/{name}", web::get().to(greet))
}
```

### Debug

- [Debugging Rust programs with lldb on MacOS](https://bryce.fisher-fleig.org/debugging-rust-programs-with-lldb/)

---

<a id='issuecomment-1543455738'></a>

### 解引用的疑惑

按照 https://course.rs/advance/smart-pointer/deref.html 一文所述, String 会自动解引用

```rust
#[stable(feature = "rust1", since = "1.0.0")]
impl ops::Deref for String {
    type Target = str;

    #[inline]
    fn deref(&self) -> &str {
        unsafe { str::from_utf8_unchecked(&self.vec) }
    }
}
```

但是我遇到一个情况是, 需要使用 `&*String` 而不是 `&String` 来赋值[^5]

```diff
    let mut connection = PgConnection::connect(&config.connection_string_without_db())
        .await
        .expect("Failed to connect to Postgres.");

    connection
+        .execute(&*format!(r#"CREATE DATABASE "{}";"#, config.database_name))
-        .execute(format!(r#"CREATE DATABASE "{}";"#, config.database_name).as_str())
        .await
        .expect("Failed to create database.");
```

按理来说应该是可以自动转换的, 比如: `let tmp: &str = &String`.

也许可能的原因: `trait bound` 高于解引用

---

<a id='issuecomment-1552740148'></a>

### 实现 dyn trait 的疑惑

我发现 rust 在同一个 create 下是可以 `impl trait for dyn trait` 不报错的, 但是只要把 define trait 放在其它 create 下就不行

update: _我突然想到是不是我没有 use 的缘故_

其它资料:

- [How to move `self` when using `dyn Trait`?](https://users.rust-lang.org/t/how-to-move-self-when-using-dyn-trait/50123)

---

<a id='issuecomment-1553929923'></a>

### 指针的优美之处

```rust
  fn read(&mut self, buf: &mut [u8]) -> io::Result<usize> {
        for slot in &mut *buf {
            *slot = self.byte;
        }
        Ok(buf.len())
    }
```

---

<a id='issuecomment-1555903473'></a>

### RwLock 的坑记录

`In particular, a writer which is waiting to acquire the lock in write might or might not block concurrent calls to read`[^6]

代码 https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=18024235e93eeb6f580eea8770167d63 在 playground 上无法运行, 但是在 apple silicon 上运行正常, 所以有的时候也无法保证 write 一定会 block read....

---

update: 它使用 `semaphore` 来控制 read/write, 所以

```

// Thread 1             |  // Thread 2
let _rg = lock.read();  |
                        |  // will block
                        |  let _wg = lock.write();
// may deadlock         |
let _rg = lock.read();  |
```

会出现死锁的情况, 但是先 `write` 的话就会先占用所有 semaphore 量就不会出现循环等待 (所以我觉得这种放在 init pool manager 是一个不错的选择, 当然使用 `try_writer` 是另一个好的选择)

---

<a id='issuecomment-1565892288'></a>

### 加快 docker 的构建速度

我之前知道使用 [sccache](https://github.com/mozilla/sccache/) 来缓存编译和使用 release 来缩小编译体积[^7], 但这一般是构建宿主机上的优化手段, 从来没考虑过加速构建 docker, 所幸现在学习到了 🥇

前置知识

- [Optimizing builds with cache management](https://docs.docker.com/build/cache/)
  > Layers are cached: if the starting point of an operation has not changed (e.g. the base image) and the command itself has not changed (e.g. the checksum of the files copied by COPY) Docker does not perform any computation and directly retrieves a copy of the result from the local cache.
- [Better support of Docker layer caching in Cargo](https://hackmd.io/@kobzol/S17NS71bh#Using-Docker-cache-mounts)
- [Dockerfile 多阶段构建](https://yeasy.gitbook.io/docker_practice/image/multistage-builds)
- [Dockerfile 最佳实践](https://yeasy.gitbook.io/docker_practice/appendix/best_practices)

我的理解:

1. 首先我们需要知道 rust 没有像 `npm install` 那样直接根据依赖文件直接安装的功能[^8]
2. 所以我们需要手动先编译仅含有 `Cargo.toml` `Cargo.lock` 和 empty `src/main.rs` `src/lib.rs`(这里是因为这个项目是 bin 类型)[^9]
   - 还有 [cargo chef](https://github.com/LukeMathWalker/cargo-chef) 这样的选择[^10]
3. 继承这个镜像然后 copy 所有的 src 文件再编译, 这样就可以利用之前的 `/usr/local/cargo` 和 `target` cache 了

实战(不考虑第一次构建耗时)修改 main.rs 然后重新构建计算耗时:

<details>
<summary>手动复制 Cargo.toml 多阶段构建 <strong>1m50s</strong> </summary>

```dockerfile
# Set the base image
FROM rust:1.69 AS toolchain
WORKDIR /app
RUN apt update && apt install lld clang -y

# Fetch all the carte source file
FROM toolchain AS bare-source
COPY Cargo.toml Cargo.lock /app/
RUN \
    mkdir /app/src && \
    echo 'fn main() {}' > /app/src/main.rs && \
    touch /app/src/lib.rs && \
    cargo build --release && \
    rm -Rvf /app/src

FROM bare-source AS builder
COPY . .
ENV SQLX_OFFLINE true
# Build the project
RUN cargo clean && cargo build --release --bin zero2prod

# Runtime stage
FROM debian:bullseye-slim AS runtime
WORKDIR /app
# Install OpenSSL - it is dynamically linked by some of our dependencies
# Install ca-certificates - it is needed to verify TLS certificates
# when establishing HTTPS connections
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    # Clean up
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/zero2prod zero2prod
COPY configuration configuration
ENV APP_ENVIRONMENT production
ENTRYPOINT ["./zero2prod"]

```

</details>

<details>
<summary>使用cargo-chef 多阶段构建 <strong>1m52s</strong> </summary>

```dockerfile
FROM rust:1.69 AS chef
WORKDIR /app
RUN cargo install cargo-chef

FROM chef AS planner
# Copy the whole project
COPY . .
# Prepare a build plan ("recipe")
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
# Copy the build plan from the previous Docker stage
COPY --from=planner /app/recipe.json recipe.json
# Build dependencies - this layer is cached as long as `recipe.json`
# doesn't change.
RUN cargo chef cook --recipe-path recipe.json
COPY . .
ENV SQLX_OFFLINE true
# Build the project
RUN cargo build --release --bin zero2prod

# Runtime stage
FROM debian:bullseye-slim AS runtime
WORKDIR /app
# Install OpenSSL - it is dynamically linked by some of our dependencies
# Install ca-certificates - it is needed to verify TLS certificates
# when establishing HTTPS connections
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    # Clean up
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/zero2prod zero2prod
COPY configuration configuration
ENV APP_ENVIRONMENT production
ENTRYPOINT ["./zero2prod"]

```

</details>

---

总结: 还是和书上一致, 使用 chef (Better support of Docker layer caching in Cargo 一文说的很清楚了, 各有利弊)

---

update: 未来需要看看 [sccache](https://github.com/mozilla/sccache) 来加速编译速度, 我目前的瓶颈卡在 `cargo build --release --bin zero2prod` 上

---

<a id='issuecomment-1571229593'></a>

### 部署

- [fly.io](https://fly.io/docs/reference/configuration/#the-checks-section)
  - 主要是 [services.http_checks](https://fly.io/docs/reference/configuration/#services-http_checks) 老是使用 8080 来做检查, 我寻思着文档不是说访问 public api 吗, 难道还要配置 `services.internal_port`? 结果是不行, 既不访问我配置的 80 public port 和 8000 internal port
  - 最后使用 [The check section](https://fly.io/docs/reference/configuration/#the-checks-section) 手动定义好了访问 8000 端口, 文档说是 doesn't have public-facing services, don't affect request routing 但是又需要在 0.0.0.0 可用, 有点懵

> port: Internal port to connect to. Needs to be available on 0.0.0.0. Required.

- [x] 希望可以有时间玩玩 terraform vault 来部署项目[^11][^12]

* 学习了一下 terraform[^13] 发现 infrastructure is code 这个理念还是那个理论, 要么做技术高的, 要么做累活, 不过它的抽象不错; 还有它的 cloud 速度太慢了, 还是本地执行, state 放到 cloud 上比较好

---

<a id='issuecomment-1706405372'></a>

### underscore pattern 的错误理解

之前我讲 `_` 和 `_xx` 当做同样的事情来看, 但是写下面代码的时候死活都无法触发一次请求

```rust
let _ = Mock::given(path("/emails"))
        .and(method("POST"))
        .respond_with(ResponseTemplate::new(200))
        .named("Create unconfirmed subscriber")
		.except(1)
        .mount_as_scoped(&app.email_server)
        .await;
```

然后将 `except` 去掉的时候看日志报 `404` 错误, 就知道这个 guard 自动 drop 掉导致服务没有正确 mount 上

总结: `_` 会立刻 drop, 并不是和 `_xx` 一样随作用域结束来 drop 的[^14]

---

<a id='issuecomment-3677836205'></a>
`_` 和 `let _` 的区别就是 `_ = expr; 是 { let _ = expr; }`[^15]

[^1]: https://eisel.me/lld

[^2]: https://www.reddit.com/r/rust/comments/11h28k3/faster_apple_builds_with_the_lld_linker/

[^3]: https://github.com/BurtonQin/lockbud/issues/44

[^4]: https://github.com/actix/actix-web/issues/1147#issuecomment-1509937750

[^5]: https://users.rust-lang.org/t/what-is-the-difference-between-as-ref/76059

[^6]: https://doc.rust-lang.org/std/sync/struct.RwLock.html

[^7]: https://github.com/johnthagen/min-sized-rust#strip-symbols-from-binary

[^9]: https://github.com/rust-lang/cargo/issues/2644

[^10]: https://www.lpalmieri.com/posts/fast-rust-docker-builds/

[^11]: https://registry.terraform.io/

[^12]: https://developer.hashicorp.com/vault/docs/what-is-vault

[^13]: https://www.bilibili.com/video/BV1L34y1B7PT

[^14]: https://stackoverflow.com/questions/76311007/what-happens-when-assigning-to-the-underscore-pattern

[^15]: https://t.me/c/2261788729/77332
