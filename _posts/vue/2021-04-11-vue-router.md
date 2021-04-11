---
title: Vue Router
author: voidblank
date: 2021-04-11 14:35:00 +0800
categories: [vue]
tags: [vue, 前端]
math: true
mermaid: true
---

# Vue Router

## 定义vue-router
- 简单定义
```js
// 定义组件
const f = { template: '<div>f</div>' }
const b = { template: '<div>b</div>' }

// 定义路由
const routes = [
    { path: '/f', component: f },
    { path: '/b', component: b }
]

// 创建router实例
const router = new VueRouter({
    routes: routes
})

// 创建和挂载router
const app = new Vue({
    router
}).$mount('#app')

```
- 通常定义
    - 路由懒加载:设置路由懒加载后,只有访问他的上级路径时,才会加载该路由的js文件
    - webpackChunk:相同chunkname的路由会被放到同一个文件下
    - 路由元信息(meta): 可在component中通过`this.$route.meta`来获取
```js
router.config.js

const index = {
  template: '<div>Home</div>'
}

export const routerMap = [
  {
    path: '/home', // 路由路径, 绝对路径为: /home
    name: 'index',  // 路由名称,唯一
    component: index, // 组件
    redirect: '/index', // 重定向路径,访问时自动重定向
    children: [ // 嵌套路由
      {
        path: 'a/:userId', // 带参数的路由路径,绝对路径为: /home/a/:userId
        name: 'a',
        // 设置别名,在访问'/home/a/:userId'时显示的url不变,但实际上的url是'/aaa'(待考证)
        alias: '/aaa',
        component: () => import('...'), // 路由懒加载
        meta: { title: '', }
      },
      {
        path: 'b', // 绝对路径: /home/b
        name: 'b',
        // 路由懒加载
        component: resolve => require(['b'], resolve),
        meta: {}
      },
      {
        path: '/c', // 绝对路径: /c,最好不要在children里这样写
        name: 'c',
        // 路由懒加载,打包处理
        component: () => import(/* webpackChunkName: "group-foo" */ '...'),
      },
      {
        path: 'd',
        name: 'd',
        // 设置命名视图,用于router-view
        components: {
            default: defaultComponent, // 当没有name时
            helper: helperComponent // 当name="helper"时
        }
      },
      {
        path: 'e/:id',
        name: 'e',
        component: () => import('...'),
        // 设置传参方式为props方式,默认为布尔值,也可以使用Object或Function
        props: true
        // props: { default: true, sidebar: false }
        // props: (route) => ({ query: route.query.q })
      }
    ],
    // 当前路由独享的守卫
    beforeEnter: (to, from, next) => {},
    meta: { // 路由元信息
            keepAlive: true, // 是否缓存
            title: 'title', // 标题
          }
  },
  {
    path: '*' // 用于通配所有页面,一般用于404
  }
]

const router = new VueRouter({
    // 路由数组
    routes: routerMap,
    // 路由模式,hash/history/abstract
    mode: history,
    // 应用的根路径,默认为"/"
    base: "/",
    // <router-link>的默认class
    linkActiveClass: "router-link-active",
    // <router-link>的默认的精确激活class
    linkExactActiveClass: "router-link-exact-active",
    // 滚动行为
    scrollBehavior:,
    // 提供自定义查询字符串的解析/反解析函数。覆盖默认行为。
    parseQuery/stringifyQuery:,
    // 当浏览器不支持history.pushState时控制路由是否应该回退到hash模式
    fallback: true
})
```
- router-view
```html
<div class="abc">
    <!-- 以router.config.js为例,当前页面若为/home/b,则router-view会在此处渲染component为b的组件 -->
    <router-view></router-view>
    <!-- 在设置了命名视图(components)后,可以根据name来渲染多个组件 -->
    <router-view name="helper"></router-view>
</div>
```
- props解耦
```js
export default{
    name: 'e',
    props: ['id'] // 通过props来获取$route.params.id,也可以获取query
}
```

## 引用router

### HTML
- to:点击后将值传到`router.push()`
```html
  <router-link to="/a">a</router-link>
  <!-- router-link会变为 -->
  <a href="/a">a</a>

  <!-- 使用v-bind绑定 -->
  <router-link :to="'home'">home</router-link>
  <router-link :to="{ path: 'home' }">home</router-link>
  <!-- 命名的路由 -->
  <router-link :to="{ name: 'user', params: { userId: 123 }}">user</router-link>
  <!-- 带参,等效于/register?plan=private -->
  <router-link :to="{ path: 'register', query: { plan: 'private' }}">Register</router-link>
```
- replace:点击后调用`router.replace()`,无历史记录
```html
<router-link :to="{ path: '/abc' }" replace></router-link>
```
- append:在相对路径后添加路径
```html
<!-- 当前路径为/a, 则点击后路径变为/a/b -->
<router-link :to="{ path: 'b' }" append></router-link>
```
- tag:将router-link渲染为其他标签,仍保留点击导航的效果
```html
<router-link :to="{ path: 'c' }" tag="li">c</router-link>
<!-- 等效于 -->
<li>c</li>
```
- event:声明可以触发导航的事件
```html
<!-- 当点击或鼠标移到a上时,触发导航跳转 -->
<router-link :to="{ path: '/a' }" event="mouseover">a</router-link>
```

### js
- 使用`this.$router`来获取全部路由,使用`this.$router.push()`来执行跳转等操作
- 使用`this.$route`来获取当前路由

## 关于route与router的属性

### route
- `$route.path`(String)
    - 返回当前路由的路径,如`/foo/bar`
- `$route.params`(Object)
    - 获取传来的参数。如:`/foor/:username`的路由,当前路径为`/foor/bar`,则`$route.params.username = bar`,当没有参数时为空Object
- `$route.query`(Object)
    - 获取传来的参数。如:`/foo?user=1`,当前路径为`/foo`,则`$route.query.user = 1`,当没有参数时为空Object
- `$route.hash`(String)
    - 获取当前路由的哈希值,若没有则为`''`
- `$route.fullPath`(String)
    - 获取当前完整解析后的url
- `$route.matched`(Array)
    - 获取当前路由的路由记录,包含嵌套的(?)
- `$route.name`(String)
    - 获取当前路由的name
- `$route.redirectedFrom`(String)
    - 获取重定向来源的路由的名字
- `this.$route`是不可变的,但是可以通过`watch`钩子去监视变化

### router
- `$router.app`:返回当前router的app根实例(Vue instance)
- `$router.mode`:返回当前router的mode(String)
- `$router.currentRoute`:返回当前router的路由信息对象(?)
- `$router.push()`:导航到指定url
    - `$router.push('home')`
    - `$router.push({ path: 'home' })`
    - `$router.push({ name: 'home', params: { userId: '123' }})`
    - `$router.push({path: 'home', query: { plan: 'private' }})`
    - `$router.push({ path: home, params: { userId }})`<br>此处的userId是上文中定义的变量
    - `$router.push({ path: '/user/${userId}' })`<br>此处的userId是上文中定义的变量
- `$router.replace()`:导航到指定url,替换掉当前的history记录
- `$router.go(Number)`:在history中前进或后退多少步,如果步数错误就会失败
    - `$router.go(1)`:前进一步
    - `$router.go(-1)`:后退一步
    - `$router.go(0)`:刷新
- `$router.back()`:后退一步
- `$router.forward()`:前进一步

## 导航守卫
- 路由间跳转的时候执行的钩子函数(?)
- 导航解析流程:
  - 触发导航
  - 在当前组件里调用`beforeRouteLeave`守卫
  - 调用全局`beforeEach`守卫
  - 在复用组件内调用`beforeRouteUpdate`守卫
  - 调用跳转后路由的`beforeEnter`守卫
  - 解析异步路由组件
  - 在被激活的组件内调用`beforeRouteEnter`守卫
  - 调用全局`beforeResolve`守卫
  - 确认导航
  - 调用全局`afterEach`钩子
  - 触发DOM更新
  - 调用`beforeRouteEnter`守卫中传给`next`的回调函数,创建好的组件实例会作为回调函数的参数传入
- 守卫是异步执行的,导航在守卫resolve完之前一直处在等待状态
- 关于`next()`的使用:
  - `next()`:进行管道中的下一个钩子,若全部钩子执行完了,则导航状态变为`confirmed`
  - `next(false)`:中断导航,返回到from的路由
  - `next(String url)`:中断当前导航,跳转到url的导航
  - `next({ path: String url })`:同上,可以添加多种设置,如`replace(bool)`,`name(String)`,`path(String)`,以及路由设置中`props`的可设置选项
  - `next(error)`:传入一个Error实例,导航将被终止,错误会被传递给`router.onError()`

### 全局守卫

#### 全局前置守卫
- 创建:`router.beforeEach((to, from, next) => {})`

#### 全局解析守卫
- 创建:`router.beforeResolve((to, from, next) => {})`
- 在导航确认之前、组件内所有守卫和异步路由组件被解析之后

#### 全局后置钩子
- 创建:`router.afterEach((to, from) => {})`
- 没有`next()`,无法改变导航

### 路由独享守卫
- 创建(在routes内):`beforeEnter: (to, from, next) => {}`

### 组件守卫
- 如同组件内部的钩子

#### beforeRouteEnter
- 在渲染该组件的对应路由被 confirm 前调用
- 无法获取到`this`,因为守卫执行前,组件实例还没有创建
- 可以通过`next`来使用组件实例:
```js
beforeRouteEnter (to, from, next) {
  next(vm => {
    // 使用vm作为this
  })
}
```

#### beforeRouteUpdate
- 在当前路由改变，但是该组件被复用时调用
- 复用:指对于一个路由`/a/:userId`来说,`/a/1`与`/a/2`之间的跳转会产生对同一个组件实例的复用,此时该钩子生效
- 可以访问`this`

#### beforeRouteLeave
- 导航离开该组件的对应路由时调用
- 可用于禁止用户未完成保存时离开
- 可以访问`this`