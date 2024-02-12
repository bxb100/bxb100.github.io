---
title: Rust  记录一下 debug
pubDatetime: 2023-03-23T19:28:50.000Z
modDatetime: 2023-04-19T10:11:01.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/37
tags:
  - DEV
  - Rust
---

wry bug 见: https://github.com/tauri-apps/wry/issues/911

1. 把可能出问题的地方打上日志
2. debug 能给出问题的流向, 但是真正出现的地方是隐藏的
3. 看 FFI 的时候不要纠结于外部实现, 90% 不会是调用地方出现问题

---

`objc` 是一个好的学习 bindings 的渠道

---

<a id='issuecomment-1493306499'></a>
问题: [5.2多线程版本](https://course.rs/advance-practice1/multi-threads.html) 的评论 https://github.com/sunface/rust-course/discussions/1157#discussioncomment-5497000

为啥那段程序 `TcpStream` 中会接收到 empty string 导致 `unwrap` panic
复现代码:

client:

```rust
let mut socket = TcpStream::connect("127.0.0.1:7878").await?;
    socket.shutdown().await?;
    Ok(())
```

server:

```rust
fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();
        handle_connection(stream);
    }
}

fn handle_connection(mut stream: TcpStream) {
    let buf_reader = BufReader::new(&mut stream);

    let request_line = buf_reader.lines().next().unwrap().unwrap();

    let (status_line, filename) = match &request_line[..] {
        "GET / HTTP/1.1" => ("HTTP/1.1 200 OK", "hello.html"),
        "GET /sleep HTTP/1.1" => {
            thread::sleep(Duration::from_secs(5));
            ("HTTP/1.1 200 OK", "hello.html")
        }
        _ => ("HTTP/1.1 404 NOT FOUND", "404.html"),
    };
    let contents = fs::read_to_string(filename).unwrap();
    let length = contents.len();
    let response = format!("{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}");
    stream.write_all(response.as_bytes()).unwrap();
}
```

这里的原因很可能是由于我上面写的那样, client shutdown 了 socket, 然后服务端 `recv` 空的字符串 [^1] 至于为啥会过一段时间会 panic, 我猜测和浏览器的 tcp socket 状态改变有点关系, 不过不是重点我就忽略了, 后面有知道了我再补充

---

## 更为细致的探索

1. 首先掏出祖传 TCP state machine
   ![image](https://user-images.githubusercontent.com/20685961/229352632-a3215ce7-2993-4ad5-93ed-58607c927884.png)
2. 然后再掏出 `sudo tcpdump -nS -ttt port 7878 -i all` 和 `nc 127.0.0.1 7878` 看一下连接情况, 这时候再找找 rust 怎么处理 FIN (close) 的 [^2]
   <img width="680" alt="image" src="https://user-images.githubusercontent.com/20685961/229352764-6d022770-7b68-4057-9337-0a0b3b675f44.png">
3. 根据代码

```rust
impl<B: BufRead> Iterator for Lines<B>
// ...
match self.buf.read_line(&mut buf) {
            Ok(0) => None,
// ...
```

和另一则社区回答[^3] 知道了标准处理 close 的办法就是看读取到的 buf 是否为 0 (原谅我一直在做应用层, 不太清楚这里的弯弯绕绕 😭)

[^1]: https://stackoverflow.com/questions/37330993/sock-recv-returns-empty-string-when-connection-is-dead-on-non-blocking-socke
[^2]: https://users.rust-lang.org/t/how-to-know-a-tcpstream-is-closed-in-the-other-side/52894/12
[^3]: https://users.rust-lang.org/t/how-to-detect-tcp-close/50925/3
