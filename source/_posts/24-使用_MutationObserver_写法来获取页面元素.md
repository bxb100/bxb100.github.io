
    ---
    title: 使用 MutationObserver 写法来获取页面元素
    date: 2022-09-23T09:54:55Z
    tags:
    	-DEV

    ---
    之前一直使用 `DOMContentLoaded` 来捕捉 DOM 树的变化, 写的渣代码需要判断, 然后还要 `Promise setTimeout` 这种形式来 `sleep` (不能直接用 `setTimeout` 是 js 运行的 eventLoop 会在最后才执行)

但是当使用 https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists 所述的代码
```js
function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}
```
直接将 `MutationObserver` 和 `Promise` 结合起来, 这样可以直接用 `Promise.then` 来链式调用, 并且也可以复用 js 中 `Promise` 相关优秀的特性, 比如 `race` , `any` 等

当然有点需要注意, 构造方法中的 callback 返回的是所有更新的 `MutationRecord` 数组, 所以没法简单的使用 `mutations.addedNodes.find(node => node.matches("..."))`, 原回答的解法目前看来最简单且优雅