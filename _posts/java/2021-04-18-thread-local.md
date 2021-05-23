---
title: ThreadLocal
author: voidblank
date: 2021-04-18 14:13:00 +0800
categories: [Java]
tags: [java, java源码, JDK1.8, 后台, 多线程]
math: true
mermaid: true
---

# ThreadLocal
- `public class ThreadLocal<T>`
- 用于为每个线程存储属于自己的属性/值,在多线程的情况下做到数据隔离,防止自身线程的变量被其他线程更改

## 方法

### get()
- `public T get()`
- 获取当前线程在ThreadLocalMap中存储的value
- 使用的Map为当前线程的`threadLocals`,key为调用的ThreadLocal
- 如果该线程还未初始化导致没有`threadLocals`,那么会执行`setInitialValue()`,并把结果值(null)返回

### setInitialValue()
- `private T setInitialValue()`
- 初始化当前线程存储在`threadLocals`中的值
  - key:调用的ThreadLocal
  - value:null
- 如果当前线程没有ThreadLocalMap则执行`createMap()`
- 返回null

### set(T)
- `public void set(T value)`
- 向当前线程的ThreadLocalMap中存储值
- 如果当前线程没有ThreadLocalMap则执行`createMap()`

### remove()
- `public void remove()`
- 将当前ThreadLocal从当前线程的ThreadLocalMap中移除
- 在某些使用ThreadLocal的场景下,对于不需要的值需要手动的调用该方法以防止内存溢出

### getMap(Thread)
- `ThreadLocalMap getMap(Thread t)`
- 获取t的`threadLocals`

### createMap(Thread, T)
- `void createMap(Thread t, T firstValue)`
- 为指定线程创建`threadLocals`并设置初始值

## ThreadLocalMap
- `static class ThreadLocalMap{}`
- ThreadLocal的内部静态类,用于存储线程独享的信息
- 内部存储为Entry数组
- 未设置的情况下,默认容量为16,每次扩容翻倍
  - 扩容只会在rehash的时候触发
  - 扩容条件:已使用的size占table总长度的2/3时
- 内部通过`size`属性来保存当前有多少个值

### Entry
- `static class Entry extends WeakReference<ThreadLocal<?>>`
- ThreadLocalMap的内部value存储是通过Entry[],继承了弱引用以方便gc回收,但是由于一般情况下线程是复用的,这会导致ThreadLocal无法触发gc回收,所以需要通过调用remove方法来解除ThreadLocal的强引用
- key设置为弱引用也是为了防止内存泄漏
- Entry中只有key(ThreadLocal<?>)及value(Object)

### 内部set/update
- 通过计算拿到key值对应的索引(i),接着:
  - 判断table中当前位置是否为null,如果为null则保存在这里;
  - 不为null,则判断当前位置的key值与要保存的key值是否相等,相等则进行value的更新;
  - 不相等,则i++,对下一个格子做相同的操作;
  - 达到table尾部时,将i变为0,继续操作

### 内部get
- 通过计算拿到key值对应的索引(i),接着:
  - 判断当前位置不为null且key值与get的key值是否相等,相等则将该处的value返回;
  - 不满足条件,则向后遍历,直至找到满足条件的值,返回value;
  - 如果遍历到table尾部,则将i变为0,继续操作
  - 如果向后遍历出null值,则表示当前table中没有对应的key值,返回null