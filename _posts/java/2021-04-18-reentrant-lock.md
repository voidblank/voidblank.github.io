---
title: ReentrantLock
author: voidblank
date: 2021-04-18 14:15:00 +0800
categories: [Java]
tags: [java, java源码, JDK1.8, 后台]
math: true
mermaid: true
---

# ReentrantLock
- `public class ReentrantLock implements Lock, java.io.Serializable`
- Lock的常用实现

## 成员变量

### sync
- `private final Sync sync;`
- 提供所有实现机制的同步器

## 构造器
- `public ReentrantLock()`
- `public ReentrantLock(boolean)`
- 默认构造器中的`sync`为非公平锁,带参构造器中若传入`true`则为公平锁,否则为非公平锁

## 方法

### lock()
- `public void lock()`
- 执行锁操作,调用`sync.lock()`

### tryLock()
- `public boolean tryLock()`
- 试图获取锁,实际上调用的是`sync.nonfairTryAcquire(1)`

### tryLock(long, TimeUnit)
- `public boolean tryLock(long timeout, TimeUnit unit) throws InterruptedException`
- 有超时时间的试锁,获取到锁返回true,超时返回false,如果尝试途中被中断则抛出异常
- 如果TimeUnit为null还会抛出`NullPointerException`

### unlock()
- `public void unlock()`
- 释放一层锁
- 实际上调用的是`sync.release(1)`

### newCondition()
- `public Condition newCondition()`
- 返回一个新的`Condition`

### getHoldCount()
- `public int getHoldCount()`
- 返回`sync.getHoldCount()`

### isHeldByCurrentThread()
- `public boolean isHeldByCurrentThread()`
- 返回`sync.isHeldByCurrentThread()`

### isLocked()
- `public boolean isLocked()`
- 返回`sync.isLocked()`

### isFair()
- `public final boolean isFair()`
- 判断该`ReentrantLock`是否为公平锁

### getOwner()
- `protected Thread getOwner()`
- 返回`sync.getOwner()`

### hasQueuedThreads()
- `public final boolean hasQueuedThreads()`
- 如果阻塞队列为空则返回false,否则返回true
- 实际上是判断`AQS`的阻塞队列的`tail != head`

### hasQueuedThread(Thread)
- `public final boolean hasQueuedThread(Thread thread)`
- 判断指定线程是否在阻塞队列中

### getQueueLength()
- `public final int getQueueLength()`
- 获取阻塞队列的长度

### getQueuedThreads()
- `protected Collection<Thread> getQueuedThreads()`
- 返回一个`ArrayList`,包含在阻塞队列中的所有的线程

### hasWaiters(Condition)
- `public boolean hasWaiters(Condition condition)`
- 判断是否有线程调用了`Condition.await()`且处于`await`状态

### getWaitQueueLength(Condition)
- `public int getWaitQueueLength(Condition condition)`
- 获取已调用`Condition.await()`且处于`await`状态的线程数量

### getWaitingThreads(Condition)
- `protected Collection<Thread> getWaitingThreads(Condition condition)`
- 返回一个`ArrayList`,包含在阻塞队列中的所有的满足已调用`Condition.await()`且处于`await`状态的线程


## Sync
- `abstract static class Sync extends AbstractQueuedSynchronizer`
- ReentrantLock的内部类,是ReentrantLock同步控制的核心,子类实现了公平锁与非公平锁,同时该类通过AQS的`state`来表示锁的重入数

### 方法

#### lock()
- `abstract void lock();`
- 规定了子类的加锁方法

#### nonfairTryAcquire(int)
- `final boolean nonfairTryAcquire(int acquires)`
- 非公平尝试取得锁,设为final是因为无论子类是否是公平锁,都需要有非公平的试锁方法

```java
// 取得锁返回true,否则返回false
final boolean nonfairTryAcquire(int acquires) {
    final Thread current = Thread.currentThread();
    // 获取并判断当前锁的状态,为0表示没有被占用
    int c = getState();
    if (c == 0) {
      // 没被占用则尝试cas操作更新状态,因为多线程下可能并发操作
        if (compareAndSetState(0, acquires)) {
          // 将排他锁的使用线程设为当前线程
            setExclusiveOwnerThread(current);
            return true;
        }
    }
    // 锁被占用了,则判断是否为当前线程持有
    else if (current == getExclusiveOwnerThread()) {
      // 重入锁机制,重复上锁使得state叠加,但是如果是负的则表示
      // 数据异常
        int nextc = c + acquires;
        if (nextc < 0) // overflow
            throw new Error("Maximum lock count exceeded");
        setState(nextc);
        return true;
    }
    return false;
}
```

#### tryRelease(int)
- `protected final boolean tryRelease(int releases)`
- 尝试释放锁,如果锁没有被调用的线程持有,则会抛出`IllegalMonitorStateException`
- 如果这次释放后`state`归零,则会清除排他锁的线程

#### isHeldExclusively()
- `protected final boolean isHeldExclusively()`
- 判断持有锁的线程是否为当前线程

#### getOwner()
- `final Thread getOwner()`
- 如果当前`state`为零,则返回null;
- 否则返回持有锁的线程

#### getHoldCount()
- `final int getHoldCount()`
- 返回`state`的值

#### isLocked()
- `final boolean isLocked()`
- 判断是否上锁

## NonfairSync
- `static final class NonfairSync extends Sync `
- Sync的子类,非公平锁

### 方法

#### lock()
- `final void lock()`
- 执行锁操作

```java
final void lock() {
  // 先尝试设置state由0变1
    if (compareAndSetState(0, 1))
    // 成功说明锁之前没被持有,且成功拿到锁,设置持有锁的线程为当前线程
        setExclusiveOwnerThread(Thread.currentThread());
    else
    // 不成功则尝试获取锁,如果获取失败则会加入到阻塞队列中
    // 可参考AQS的acquire(int)方法
        acquire(1);
}
```

#### tryAcquire(int)
- `protected final boolean tryAcquire(int acquires)`
- 尝试获取锁,实际上调用的是Sync的`nonfairTryAcquire(int)`

## FairSync
- `static final class FairSync extends Sync`
- - Sync的子类,公平锁

### 方法

#### lock()
- `final void lock()`
- 执行锁操作
- 直接调用`AQS`的`acquire(1)`方法,获取锁

#### tryAcquire(int)
- `protected final boolean tryAcquire(int acquires)`
- 与非公平锁的试锁方式相似,不过在c为0时会通过`AQS`的`hasQueuedPredecessors()`来判断是否阻塞队列为空及当前线程是否在阻塞队列头部