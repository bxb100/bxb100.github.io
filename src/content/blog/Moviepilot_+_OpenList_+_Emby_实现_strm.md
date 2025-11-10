---
title: Moviepilot + OpenList + Emby 实现 strm
pubDatetime: 2025-11-02T04:40:07.000Z
modDatetime: 2025-11-10T10:58:33.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/71
tags:
  - 就是玩
---

# 配置

- Moviepilot v2.8.1-1
- OpenList 4.1.5
- Emby 4.9.1.80

# 设置

## OpenList

参看 https://doc.oplist.org/guide/drivers/strm 设置一个自动生成 strm 的存储, **注意要加签名**(否则后续播放的时候就会 401 无权限)

## Moviepilot

- 在 `设定` - `存储 & 目录` 设定 OpenList
- 设置目录
  - 坑 1: 我一开始以为可以自动复制 strm, 但是就是显示 `alist:strm 文件 0`, 参看 issue 配置 `OPENLIST_SNAPSHOT_CHECK_FOLDER_MODTIME='False'` 然后重启依然无法正确识别文件数量
  - 坑 2: 这个配置看似没有在任何地方上使用, 但是在代码中会被使用到, 参看 https://github.com/jxxghp/MoviePilot/blob/8b7374a6875873c7c65bb44faa75465d72f679bb/app/modules/filemanager/__init__.py#L429

<img width="331" height="677" alt="Image" src="https://github.com/user-attachments/assets/b35fe29d-67c5-4dd5-90aa-718622358bfb" />

- 配置 workflow (配置这个是因为上一步目录无法同步复制 strm 文件)
  - 定时任务 (可以先手动触发看看能不能行)
  - 要选 `文件列表` (_不要问我为什么叫 `源目录`, 为什么不选 `下载列表`, 我也不知道, 都是试出来的_)
  - 然后这一步就能正确显示文件数量并根据上一部的配置, 自动复制 strm 并刮削了
  - `重置任务` 可以清除过往的识别历史, 单纯清除 `媒体整理` 记录是没用的, 依然会 skip

<img width="1167" height="564" alt="Image" src="https://github.com/user-attachments/assets/a1930ae2-6693-4af1-8af8-db8d18209d2f" />
