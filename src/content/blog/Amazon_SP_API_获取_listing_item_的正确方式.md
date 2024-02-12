
---
title: Amazon SP API 获取 listing item 的正确方式
pubDatetime: 2022-07-20T04:04:53.000Z
modDatetime: 2022-07-20T04:04:53.000Z
url: https://github.com/bxb100/bxb100.github.io/issues/19
tags:
  - DEV

---

* download `GET_MERCHANT_LISTINGS_ALL_DATA` report (fr region does not contain `ASIN`)
* download `GET_FLAT_FILE_OPEN_LISTINGS_DATA` report (get missing `ASIN`)
* Get the main picture and variations ASIN with the CatalogItems API


source: https://medium.com/@nassuf/how-to-get-a-sellers-listings-using-amazon-sp-api-475771d3754c
