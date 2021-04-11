---
title: 安装vue
author: voidblank
date: 2021-04-11 14:34:00 +0800
categories: [vue]
tags: [vue, 前端, 安装]
math: true
mermaid: true
---

# 安装vue

## 安装node.js,内含npm
- `npm -v`查看npm版本号
- 可以设置淘宝的镜像`npm config set registry https://registry.npm.taobao.org`
- 查看是否设置成功`npm config get registry`
- 也可以安装cnpm来进行代替npm进行下载安装插件等文件`npm install -g cnpm`

## 安装vue
- `npm install vue -g`

## 安装vue-cli
- `npm install vue-cli -g`
- `npm install --global vue-cli`

## 使用`vue -V`来检查是否安装成功
- PATH中添加路径:`C:\Users\death\AppData\Roaming\npm`

## 安装webpack
- `npm install webpack -g`
- `npm install --global webpack`

## 安装webpack-cli
- `npm install webpack-cli -g`
- `npm install --global webpack-cli`

## 使用`webpack -V`来检查是否安装成功

## 建议安装`cnpm install -g phantomjs`防止后续卡死

## 到指定目录下建立vue项目
- `vue init webpack my-project`
- 默认情况下，后续一直回车即可

## 安装完成，`cd my-project`,`npm run dev`启动项目
- 默认`localhost:8080`