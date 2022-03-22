[GitHub Markdown LaTeX to text technique](https://github.com/bxb100/blog/issues/12)

最近发现的若干将 LaTeX 转为 图片的方式
1. github 自己的 render 服务[^1]
  * `<img src="https://render.githubusercontent.com/render/math?math=e^{i \pi} = -1">`
  * `![formula](https://render.githubusercontent.com/render/math?math=e^{i%20\pi}%20=%20-1)` 这个注意空格
  * 在 github 上还可以切换 dark/light 模式
    * light: `<img src="https://render.githubusercontent.com/render/math?math={e^{i \pi} = -1}#gh-light-mode-only">`
    * dark: `<img src="https://render.githubusercontent.com/render/math?math={\color{white}e^{i \pi} = -1}#gh-dark-mode-only">`
    * 展示: <img src="https://render.githubusercontent.com/render/math?math={e^{i \pi} = -1}#gh-light-mode-only"><img src="https://render.githubusercontent.com/render/math?math={\color{white}e^{i \pi} = -1}#gh-dark-mode-only">

2. 使用基于 latex 的 [readme2tex](https://github.com/leegao/readme2tex), 可惜好像没更新了
3. 使用 mathjax-node, 需要注意需要使用 double backslash [^2]




[^1]: https://gist.github.com/a-rodin/fef3f543412d6e1ec5b6cf55bf197d7b
[^2]: http://docs.mathjax.org/en/latest/basic/mathematics.html#putting-math-in-javascript-strings