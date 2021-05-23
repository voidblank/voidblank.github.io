---
title: AQS
author: voidblank
date: 2021-05-23 13:32:00 +0800
categories: [Java]
tags: [java, java源码, JDK1.8, 后台, 多线程, 锁]
math: true
mermaid: true
---

# AbstractQueuedSynchronizer
- `public abstract class AbstractQueuedSynchronizer extends AbstractOwnableSynchronizer implements java.io.Serializable`
- AQS

## 成员变量

### head
- `private transient volatile Node head;`
- 阻塞队列的头部,懒加载
- 仅会通过[setHead()](#sethead())来进行初始化
- 如果存在`head`,那么状态一定不为[CANCELLED](#cancelled)

### tail
- `private transient volatile Node tail;`
- 阻塞队列的尾部,懒加载

### state
- `private volatile int state;`
- 表示当前的同步状态

## 构造器

## 方法

### getState()
- `protected final int getState()`
- 获取state

### setState(int)
- `protected final void setState(int newState)`
- 更新state

### compareAndSetState(int, int)
- `protected final boolean compareAndSetState(int expect, int update)`
- CAS操作,更新state,成功返回true,失败返回false
- expect:预期的当前state值
- update:更新后的state值

### enq(Node)
- `private Node enq(final Node node)`
- 向同步队列添加节点, 添加到尾部

```java
private Node enq(final Node node) {
    // 自旋
    for (;;) {
        Node t = tail;
        // tail为空,表示队列未初始化
        if (t == null) {
            // 为头部初始化一个空的Node
            if (compareAndSetHead(new Node()))
                // 成功初始化,则设头尾一致,来进行后续的入队操作
                tail = head;
        } else {
            // 尝试将Node入队尾,直至成功
            node.prev = t;
            if (compareAndSetTail(t, node)) {
                t.next = node;
                // 成功则返回原队尾
                return t;
            }
        }
    }
}
```

### addWaiter(Node)
- `private Node addWaiter(Node mode)`
- 为当前线程创建一个Node,将其入队并设置为指定的模式(独占/共享)
- mode:独占([Node.EXCLUSIVE](#exclusive))或共享([Node.SHARED](#shared))

```java
private Node addWaiter(Node mode) {
    // 根据模式创建当前线程的Node
    Node node = new Node(Thread.currentThread(), mode);
    Node pred = tail;
    // 尾部不为空,已初始化,则尝试入队
    if (pred != null) {
        node.prev = pred;
        if (compareAndSetTail(pred, node)) {
            pred.next = node;
            // CAS入队成功后直接返回即可
            return node;
        }
    }
    // 队列未初始化或入队失败,则自旋入队
    enq(node);
    return node;
}
```

### setHead(Node)
- `private void setHead(Node node)`
- 设置同步队列的头节点,仅在``,``,``方法中调用
- 初始化头部,并会将多余的值清空(node.thread, node.prev)
- 清空:便于GC,及抑制不必要的signals及遍历

### unparkSuccessor(Node)
- `private void unparkSuccessor(Node node)`
- 唤醒node的第一个不为null的后继节点,如果没有后继节点则不做任何操作

```java
private void unparkSuccessor(Node node) {
    /*
      * If status is negative (i.e., possibly needing signal) try
      * to clear in anticipation of signalling.  It is OK if this
      * fails or if status is changed by waiting thread.
      */
    int ws = node.waitStatus;
    // 状态值小于0表示仍在等待线程调度
    if (ws < 0)
        // 将该节点状态设为零,表示已经完成
        compareAndSetWaitStatus(node, ws, 0);

    /*
      * Thread to unpark is held in successor, which is normally
      * just the next node.  But if cancelled or apparently null,
      * traverse backwards from tail to find the actual
      * non-cancelled successor.
      */
    Node s = node.next;
    // 先判断后继的第一个节点是否存在且没有取消
    if (s == null || s.waitStatus > 0) {
        s = null;
        // 从tail向前查找，去除队列中已经取消的节点
        // 如果node是尾节点,这里会直接跳出
        for (Node t = tail; t != null && t != node; t = t.prev)
            if (t.waitStatus <= 0)
                s = t;
    }
    // 如果node有没被取消的后继节点,则进行唤醒操作
    if (s != null)
        LockSupport.unpark(s.thread);
}
```

### doReleaseShared()
- `private void doReleaseShared()`
- 成功释放锁,会调用[unparkSuccessor(Node)](#unparksuccessor(node))来通知后续节点

```java
private void doReleaseShared() {
    // 自旋
    for (;;) {
        Node h = head;
        // 检查队列为是否为空
        if (h != null && h != tail) {
            int ws = h.waitStatus;
            // 检查头节点的状态是否为SIGNAL,即是否需要通知后续节点
            if (ws == Node.SIGNAL) {
                // 尝试CAS改变状态,不成功则再次循环尝试
                if (!compareAndSetWaitStatus(h, Node.SIGNAL, 0))
                    continue;            // loop to recheck cases
                // 成功的话,则调用unparkSuccessor(head)去通知后续节点
                unparkSuccessor(h);
            }
            /* 如果头部状态为0,则说明后续节点正在被唤醒/已经被唤醒，
             * 此时为了防止其他线程获取锁失败，导致头部节点又被设为
             * SIGNAL并阻塞,则将头部节点的状态设为PROPAGATE,即共享
             * 状态,这样就不会阻塞后续节点
             */
            else if (ws == 0 &&
                      !compareAndSetWaitStatus(h, 0, Node.PROPAGATE))
                // 不成功则循环再次尝试
                continue;                // loop on failed CAS
        }
        // 判断队列头部是否发生变化(如初始化操作,或者头部变更操作)
        // 只有头部没发生变化才会退出循环
        if (h == head)                   // loop if head changed
            break;
    }
}
```

### setHeadAndPropagate(Node, int)
- `private void setHeadAndPropagate(Node node, int propagate)`
- 为同步队列设置head,

```java
private void setHeadAndPropagate(Node node, int propagate) {
    Node h = head; // Record old head for check below
    setHead(node);
    if (propagate > 0 || h == null || h.waitStatus < 0 ||
        (h = head) == null || h.waitStatus < 0) {
        Node s = node.next;
        if (s == null || s.isShared())
            doReleaseShared();
    }
}
```

### cancelAcquire(Node)
- `private void cancelAcquire(Node node)`
- 取消node的正在进行的尝试,例如获取同步锁等

```java
private void cancelAcquire(Node node) {
    // 节点不存在则忽略
    if (node == null)
        return;
    // 解除节点与线程间的关系
    node.thread = null;
    // 找到第一个未被cancelled的前驱节点
    Node pred = node.prev;
    while (pred.waitStatus > 0)
        node.prev = pred = pred.prev;
    Node predNext = pred.next;
    // 将该node的状态设为CANCELLED,在并发中其他线程的操作会跳过该节点,同时也会解除与其他节点间的引用
    node.waitStatus = Node.CANCELLED;
    // 判断该节点是否为队尾,如果是则将前驱节点设为队尾
    if (node == tail && compareAndSetTail(node, pred)) {
      // 设置成功后,将前驱节点的next设为null,解除与该node间的引用
        compareAndSetNext(pred, predNext, null);
    } else {
        int ws;
        // pred != head: 判断node是否为head的后继节点
        // ws == Node.SIGNAL:判断node的前继节点是否是SIGNAL状态
        // ws不为SIGNAL,则将其状态转为SIGNAL
        // node的前继节点的线程不为空
        if (pred != head &&
            ((ws = pred.waitStatus) == Node.SIGNAL ||
              (ws <= 0 && compareAndSetWaitStatus(pred, ws, Node.SIGNAL))) &&
            pred.thread != null) {
            // 满足以上条件,则将node的前继节点指向node的后继节点
            Node next = node.next;
            if (next != null && next.waitStatus <= 0)
                compareAndSetNext(pred, predNext, next);
        } else {
          // 说明node是head的后继节点,那么调用unparkSuccessor(Node)方法去唤醒node的后继节点
            unparkSuccessor(node);
        }
        // 
        node.next = node; // help GC
    }
}
```

### shouldParkAfterFailedAcquire(Node, Node)
- `private static boolean shouldParkAfterFailedAcquire(Node pred, Node node)`
- 检查并更新一个获取失败(acquire failed)的节点的状态,需要满足`pred == node.prev`
- 返回值:node的线程是否需要锁

### selfInterrupt()
- `static void selfInterrupt()`
- 中断当前线程

### parkAndCheckInterrupt()
- `private final boolean parkAndCheckInterrupt()`
- 将当前线程park掉,返回该线程是否处在中断状态

### acquireQueued(Node,int)
- 以独占不可中断模式获取已经在队列中的线程
- 如果在等待时被中断则返回true,否则返回false

```java
final boolean acquireQueued(final Node node, int arg) {
    // 判断是否失败
    boolean failed = true;
    try {
        // 用于判断线程是否中断
        boolean interrupted = false;
        for (;;) {
            final Node p = node.predecessor();
            // 如果node的前驱是head,则尝试获取锁
            if (p == head && tryAcquire(arg)) {
                // 成功则将node设为头,并将前驱节点解除引用
                setHead(node);
                p.next = null; // help GC
                failed = false;
                return interrupted;
            }
            // 说明前驱节点不是头节点,那么获取
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                interrupted = true;
        }
    } finally {
      // 如果中途抛出异常,如获取前驱节点会抛出NullPointerException,
      // 则操作失败
        if (failed)
            // 取消node的尝试操作
            cancelAcquire(node);
    }
}
```

### doAcquireInterruptibly(int)
- `private void doAcquireInterruptibly(int arg) throws InterruptedException`
- 在独占可中断模式下尝试获取锁,与acquireQueued类似,只不过`interrupted = true;`这一步变成了抛出`InterruptedException`异常

### doAcquireNanos(int, long)
- `private boolean doAcquireNanos(int arg, long nanosTimeout) throws InterruptedException`
- `doAcquireInterruptibly(int)`的带有超时限制的版本,如果输入的时间为非正数,则直接返回

### doAcquireShared(int)
- `private void doAcquireShared(int arg)`
- 在`SHARED`模式下获取锁

### doAcquireSharedInterruptibly(int)
- `private void doAcquireSharedInterruptibly(int arg) throws InterruptedException`
- 与`doAcquireShared(int)`类似,会抛出中断异常

### doAcquireSharedNanos(int, long)
- `private boolean doAcquireSharedNanos(int arg, long nanosTimeout) throws InterruptedException`
- 与`doAcquireSharedInterruptibly(int)`类似,带有超时限制

### tryAcquire(int)
- `protected boolean tryAcquire(int arg)`
- 独占模式下尝试获取锁,当子类支持独占锁时需要实现该方法

### tryRelease(int)
- `protected boolean tryRelease(int arg)`
- 独占模式下尝试释放锁,当子类支持独占锁时需要实现该方法

### tryAcquireShared(int)
- `protected int tryAcquireShared(int arg)`
- 共享模式下尝试获取锁,当子类支持共享模式时需要实现该方法

### tryReleaseShared(int)
- `protected boolean tryReleaseShared(int arg)`
- 共享模式下尝试释放锁,当子类支持共享模式时需要实现该方法

### isHeldExclusively()
- `protected boolean isHeldExclusively()`
- 当调用线程拥有独占锁时,返回true
- 需要子类实现
- 非阻塞的Condition会[调用](#signal())该方法,阻塞的会调用[release(int)](#release(int))

### acquire(int)
- `public final void acquire(int arg)`
- 独占模式获取锁,子类获取锁都会调用该方法

```java
public final void acquire(int arg) {
    /**
     *  首先尝试获取锁,如果成功则直接返回
     *  获取锁失败后,将当前线程加入到同步队列中(独占模式)，
     *  之后中断当前线程的执行
     */
    if (!tryAcquire(arg) &&
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
```

### acquireInterruptibly(int)
- `public final void acquireInterruptibly(int arg) throws InterruptedException`
- 独占模式获取锁,如果线程已经处在中断状态则抛出`InterruptedException`,否则尝试获取锁

```java
public final void acquireInterruptibly(int arg) throws InterruptedException {
    if (Thread.interrupted())
        throw new InterruptedException();
    if (!tryAcquire(arg))
        doAcquireInterruptibly(arg);
}
```

### tryAcquireNanos(int, long)
- `public final boolean tryAcquireNanos(int arg, long nanosTimeout) throws InterruptedException`
- 独占模式获取锁,如果线程已经处在中断状态则抛出`InterruptedException`,如果获取到锁返回true,超时返回false

```java
public final boolean tryAcquireNanos(int arg, long nanosTimeout) throws InterruptedException {
    if (Thread.interrupted())
        throw new InterruptedException();
    return tryAcquire(arg) ||
        doAcquireNanos(arg, nanosTimeout);
}
```

### release(int)
- `public final boolean release(int arg)`
- 释放锁

```java
public final boolean release(int arg) {
    // 释放锁
    if (tryRelease(arg)) {
        // 释放锁之后,需要唤醒头节点后的节点
        Node h = head;
        // 检查head的状态,为0表示已有其他线程操作来更换节点了
        if (h != null && h.waitStatus != 0)
            // 说明其他线程没有抢占操作,那么开始唤醒后续节点
            unparkSuccessor(h);
        // 无论如何,释放锁成功,返回true
        return true;
    }
    // 不成功返回false
    return false;
}
```

### acquireShared(int)
- `public final void acquireShared(int arg)`
- 获取共享锁

```java
public final void acquireShared(int arg) {
    if (tryAcquireShared(arg) < 0)
        doAcquireShared(arg);
}
```

### acquireSharedInterruptibly(int)
- `public final void acquireSharedInterruptibly(int arg) throws InterruptedException`
- 获取共享锁,如果线程已经中断则抛出`InterruptedException`异常

```java
public final void acquireSharedInterruptibly(int arg) throws InterruptedException {
    if (Thread.interrupted())
        throw new InterruptedException();
    if (tryAcquireShared(arg) < 0)
        doAcquireSharedInterruptibly(arg);
}
```

### tryAcquireSharedNanos(int, long)
- `public final boolean tryAcquireSharedNanos(int arg, long nanosTimeout) throws InterruptedException`
- 尝试获取共享锁,有超时时间,获取到锁返回true,超时返回false

```java
public final boolean tryAcquireSharedNanos(int arg, long nanosTimeout) throws InterruptedException {
    if (Thread.interrupted())
        throw new InterruptedException();
    return tryAcquireShared(arg) >= 0 ||
        doAcquireSharedNanos(arg, nanosTimeout);
}
```

### releaseShared(int)
- `public final boolean releaseShared(int arg)`
- 释放共享锁,成功返回true,失败返回false

```java
public final boolean releaseShared(int arg) {
    if (tryReleaseShared(arg)) {
        doReleaseShared();
        return true;
    }
    return false;
}
```

### hasQueuedThreads()
- `public final boolean hasQueuedThreads()`
- 判断是否还有在队列中的线程,有返回true,没有返回false

```java
public final boolean hasQueuedThreads() {
    // 首尾相等则没有
    return head != tail;
}
```

### hasContended()
- `public final boolean hasContended()`
- 判断是否有线程在进行锁竞争(即同步队列中是否有线程),有返回true,否则返回false

```java
public final boolean hasContended() {
    // 头节点不为null,则说明有线程在执行且后续也有线程在队列中
    return head != null;
}
```

### getFirstQueuedThread()
- `public final Thread getFirstQueuedThread()`
- 获取队列中的第一个线程(非head),如果队列为空返回null
- 该线程也是队列中等待时间最久的线程

```java
public final Thread getFirstQueuedThread() {
    // handle only fast path, else relay
    return (head == tail) ? null : fullGetFirstQueuedThread();
}
```

### fullGetFirstQueuedThread()
- `private Thread fullGetFirstQueuedThread()`
- 获取在队列中排第一的线程

```java
private Thread fullGetFirstQueuedThread() {

    Node h, s;
    Thread st;
    /**
     *  设h为head,s为head.next
     *  如果h与s不为null(有任务),且s的prev是head(判断s是否还在队列或变成
     *  头部或有其他线程变为head),且s有线程,那么就把st返回;
     *  用||判断两次,是进行二次校验,第一次不通过则再获取一次
     */
    if (((h = head) != null && (s = h.next) != null &&
            s.prev == head && (st = s.thread) != null) ||
        ((h = head) != null && (s = h.next) != null &&
            s.prev == head && (st = s.thread) != null))
        return st;

    /**
     * 头节点的next可能未设置完,或可能还处在setHead()方法中
     * 所以从tail处开始向前找到head后第一个节点,将该节点的线程返回
     */
    Node t = tail;
    Thread firstThread = null;
    while (t != null && t != head) {
        Thread tt = t.thread;
        if (tt != null)
            firstThread = tt;
        t = t.prev;
    }
    return firstThread;
}
```

### isQueued(Thread)
- `public final boolean isQueued(Thread thread)`
- 判断指定线程是否在队列中

```java
public final boolean isQueued(Thread thread) {
    // 先校验是否为空
    if (thread == null)
        throw new NullPointerException();
    // 从tail向前遍历，尝试找到该线程
    for (Node p = tail; p != null; p = p.prev)
        if (p.thread == thread)
            return true;
    return false;
}
```

### apparentlyFirstQueuedIsExclusive()
- `final boolean apparentlyFirstQueuedIsExclusive()`
- 判断同步队列中的首个节点是否为独占模式,仅在队列不为空、队列内有节点(任务,线程)、head的后继节点为独占模式、该节点有线程的情况下为true

```java
final boolean apparentlyFirstQueuedIsExclusive() {
    Node h, s;
    return (h = head) != null &&
        (s = h.next)  != null &&
        !s.isShared()         &&
        s.thread != null;
}
```

### hasQueuedPredecessors()
- 判断是否存在比当前线程等待还要久的线程,存在返回true,不存在返回false
- 用于公平锁,按等待时间分配锁

```java
public final boolean hasQueuedPredecessors() {
    
    Node t = tail;
    Node h = head;
    Node s;
    // 队列为空,则一定不存在
    // 头节点之后为null,则队列为空或只有一个在运行的线程,那么也存在(当前线程未入队,有线程已入队且在执行)
    // head后的首个后继节点的线程不为当前线程,那么存在
    return h != t &&
        ((s = h.next) == null || s.thread != Thread.currentThread());
}
```

### getQueueLength()
- 从队尾遍历到队头,获取队列长度
- 方法获得的队列长度值一定小于实际队列长度,处在取消状态的节点thread为null

```java
public final int getQueueLength() {
    int n = 0;
    for (Node p = tail; p != null; p = p.prev) {
        if (p.thread != null)
            ++n;
    }
    return n;
}
```

### getQueuedThreads()
- 获取在同步队列中的线程集合,ArrayList

```java
public final Collection<Thread> getQueuedThreads() {
    ArrayList<Thread> list = new ArrayList<Thread>();
    for (Node p = tail; p != null; p = p.prev) {
        Thread t = p.thread;
        if (t != null)
            list.add(t);
    }
    return list;
}
```

### getExclusiveQueuedThreads()
- 获取在同步队列中的独占模式的线程集合,ArrayList

```java
public final Collection<Thread> getExclusiveQueuedThreads() {
    ArrayList<Thread> list = new ArrayList<Thread>();
    for (Node p = tail; p != null; p = p.prev) {
        if (!p.isShared()) {
            Thread t = p.thread;
            if (t != null)
                list.add(t);
        }
    }
    return list;
}
```

### getSharedQueuedThreads()
- 获取在同步队列中的共享模式的线程集合,ArrayList

```java
public final Collection<Thread> getSharedQueuedThreads() {
    ArrayList<Thread> list = new ArrayList<Thread>();
    for (Node p = tail; p != null; p = p.prev) {
        if (p.isShared()) {
            Thread t = p.thread;
            if (t != null)
                list.add(t);
        }
    }
    return list;
}
```

### isOnSyncQueue(Node)
- 判断指定节点是否在同步队列中
- 相关:
  - [findNodeFromTail(Node)](#findnodefromtail(node))

```java
final boolean isOnSyncQueue(Node node) {
    // 判断节点的等待状态是否为CONDITION,条件队列不是同步队列
    // 判断node是否有前继节点,没有则说明为head或不在队列中
    if (node.waitStatus == Node.CONDITION || node.prev == null)
        return false;
    // 走到这里说明head有前继节点,如果有后继节点那一定在队列里
    if (node.next != null)
        return true;
    // 如果没有后继节点,可能是因为CAS正在执行入队操作,那么就执行该方法从尾部向前遍历查找
    return findNodeFromTail(node);
}
```

### findNodeFromTail(Node)
- 从tail查找指定Node是否在队列中,存在返回true,不存在返回false

```java
private boolean findNodeFromTail(Node node) {
    Node t = tail;
    for (;;) {
        if (t == node)
            return true;
        if (t == null)
            return false;
        t = t.prev;
    }
}
```

### transferForSignal(Node)
- 将一个在条件队列([Node.CONDITION](#condition))的节点加入到同步队列中,成功返回true,失败返回false
- 相关:
  - [enq(Node)](#enq(node))
  - [doSignal(Node)](#dosignal(node))

```java
final boolean transferForSignal(Node node) {
    // 尝试将该节点的状态变为0,即初始化
    if (!compareAndSetWaitStatus(node, Node.CONDITION, 0))
        return false;
    // 将其入队
    Node p = enq(node);
    int ws = p.waitStatus;
    // 如果线程被取消或改变状态失败,则唤醒该线程,使其重新同步
    if (ws > 0 || !compareAndSetWaitStatus(p, ws, Node.SIGNAL))
        LockSupport.unpark(node.thread);
    return true;
}
```

### transferAfterCancelledWait(Node)
- 将指定节点从条件队列移到同步队列中,成功返回true,已在队列返回false

```java
final boolean transferAfterCancelledWait(Node node) {
    if (compareAndSetWaitStatus(node, Node.CONDITION, 0)) {
        enq(node);
        return true;
    }
    /** 如果转变不成功,说明可能被signal()方法抢占,
     *  那么就需要等待enq()方法执行完成。
     *  这种状况罕见且短暂,所以通过自旋的方式等待入队即可
     */
    while (!isOnSyncQueue(node))
        Thread.yield();
    return false;
}
```

### fullyRelease(Node)
- 完全释放头节点持有的锁,成功返回之前的同步状态值(state),失败会抛出`IllegalMonitorStateException`,且会将参数节点的状态设为[CANCELLED](#cancelled)
- node:正在等待释放锁的条件节点

```java
final int fullyRelease(Node node) {
    boolean failed = true;
    try {
        int savedState = getState();
        if (release(savedState)) {
            failed = false;
            return savedState;
        } else {
            throw new IllegalMonitorStateException();
        }
    } finally {
        if (failed)
            node.waitStatus = Node.CANCELLED;
    }
}
```

### owns(ConditionObject)

```java
public final boolean owns(ConditionObject condition) {
    return condition.isOwnedBy(this);
}
```

## Node
- `static final class Node`
- AQS内部类,队列的单位

### SHARED
- `static final Node SHARED = new Node();`
- 共享模式的等待节点
- Semaphore、CountDownLatch、ReadWriteLock，CyclicBarrier是共享模式,可以多个线程同时执行

### EXCLUSIVE
- `static final Node EXCLUSIVE = null;`
- 独占模式的等待节点
- ReentrantLock是独占模式,同时只有一个线程可以执行

### CANCELLED
- `static final int CANCELLED =  1;`
- 表示该节点上的线程已被取消(等待超时或被中断等)
- 处在取消状态的线程,将会从队列中剔除

### SIGNAL
- `static final int SIGNAL    = -1;`
- 表示该节点已经准备好了,等待资源释放以获得锁
- 当前继节点释放资源后,标识为SIGNAL状态的后继节点就会获取锁并执行

### CONDITION
- `static final int CONDITION = -2;`
- 该标识的结点处于等待队列中，结点的线程等待在Condition上，当其他线程调用了Condition的signal()方法后，CONDITION状态的结点将从等待队列转移到同步队列中，等待获取同步锁。

### PROPAGATE
- `static final int PROPAGATE = -3;`
- 表示该节点及后续线程无条件传播下去
- 仅在共享模式下有效

### waitStatus
- `volatile int waitStatus;`
- 表示节点的等待状态标志位
- 大于0表示线程中断或超时
- 小于0表示线程在队列中等待获取资源
- 等于0表示刚被初始化

### prev
- `volatile Node prev;`
- 表示当前节点的前继节点
- 独占模式用的节点,双向队列

### next
- `volatile Node next;`
- 表示当前节点的后继节点
- 独占模式用的节点,双向队列
- 当head任务完成后,head.next为null,所以AQS中的遍历都是由tail向前遍历的
- 同时线程在acquire操作失败后会执行[cancelAcquire(Node)](#cancelacquire(node)),此时会将该节点的next设为自身,如果从tail倒序遍历则不会受到影响

### thread
- `volatile Thread thread;`
- 当前节点的线程,在构造器中初始化,在节点使用完之后设为null

### nextWaiter
- `Node nextWaiter;`
- 指向下一个处在`Condition`上的条件队列的节点,单向队列

### isShared()
- `final boolean isShared() { return nextWaiter == SHARED; }`
- 判断当前节点是否处在分享模式下等待,分享模式返回true

### predecessor()
- `final Node predecessor() throws NullPointerException`
- 获取当前节点的前继节点,如果不存在(或为null)会抛出空指针异常

## ConditionObject
- `public class ConditionObject implements Condition, java.io.Serializable`
- AQS内部类,AQS中Condition的实现,同时也是Lock实现的基础

### firstWaiter
- `private transient Node firstWaiter;`
- 条件队列头节点

### lastWaiter
- `private transient Node lastWaiter;`
- 条件队列尾节点

### addConditionWaiter()
- 在等待队列中添加一个新节点,返回该节点
- 相关:
  - [unlinkCancelledWaiters()](#unlinkcancelledwaiters())

```java
private Node addConditionWaiter() {
    Node t = lastWaiter;
    // 判断尾节点是否被取消,被取消就将其清除
    if (t != null && t.waitStatus != Node.CONDITION) {
        unlinkCancelledWaiters();
        t = lastWaiter;
    }
    Node node = new Node(Thread.currentThread(), Node.CONDITION);
    // 队列为空则设为头节点,否则设在尾节点之后
    if (t == null)
        firstWaiter = node;
    else
        t.nextWaiter = node;
    // 最终这个节点都是尾节点
    lastWaiter = node;
    return node;
}
```

### doSignal(Node)
- 将条件队列的头节点唤醒,加入到AQS的同步队列中
- 相关:
  - [transferForSignal(Node)](#transferforsignal(node))
  - [signal()](#signal())

```java
private void doSignal(Node first) {
    do {
        // 校验当前队列是否为空,为空就将队列置空
        if ( (firstWaiter = first.nextWaiter) == null)
            lastWaiter = null;
        first.nextWaiter = null;
        // 如果转移到同步队列失败,那么就通过自旋的方式重复尝试
    } while (!transferForSignal(first) &&
                (first = firstWaiter) != null);
}
```

### doSignalAll(Node)
- 将所有的条件队列上的节点唤醒，加入到同步队列
- 相关:
  - [transferForSignal(Node)](#transferforsignal(node))
  - [signalAll()](#signalall())

```java
private void doSignalAll(Node first) {
    // 将首尾节点置空,允许其他线程进行添加等操作
    lastWaiter = firstWaiter = null;
    do {
        Node next = first.nextWaiter;
        first.nextWaiter = null;
        transferForSignal(first);
        first = next;
    } while (first != null);
}
```

### unlinkCancelledWaiters()
- 把队列中处在[CANCELLED](#cancelled)状态下的节点移除

```java
private void unlinkCancelledWaiters() {
    Node t = firstWaiter;
    Node trail = null;
    while (t != null) {
        // 缓存等待队列中的下个节点
        Node next = t.nextWaiter;
        // 不为CONDITION,那就是CANCELLED
        if (t.waitStatus != Node.CONDITION) {
            // 解除next的关系
            t.nextWaiter = null;
            // 如果trail为空,说明同步队列还未遍历到有效节点,那么就把next设为头节点
            if (trail == null)
                firstWaiter = next;
            else
                trail.nextWaiter = next;
            // 如果没有下一个,可能是队列为空或遍历到尾部了
            if (next == null)
                lastWaiter = trail;
        }
        else
            // 上一个状态为CONDITION的节点
            trail = t;
        t = next;
    }
}
```

### signal()
- 唤醒条件队列的首节点
- 相关:
  - [isHeldExclusively()](#isheldexclusively())
  - [doSignal(Node)](#dosignal(node))

```java
public final void signal() {
    if (!isHeldExclusively())
        throw new IllegalMonitorStateException();
    Node first = firstWaiter;
    if (first != null)
        doSignal(first);
}
```

### signalAll()
- 唤醒条件队列的所有节点
- 相关:
  - [isHeldExclusively()](#isheldexclusively())
  - [doSignalAll(Node)](#dosignalall(node))

```java
public final void signalAll() {
    if (!isHeldExclusively())
        throw new IllegalMonitorStateException();
    Node first = firstWaiter;
    if (first != null)
        doSignalAll(first);
}
```

### awaitUninterruptibly()
- 相关:
  - [addConditionWaiter()](#addconditionwaiter())
  - [fullyRelease(Node)](#fullyrelease(node))
  - [isOnSyncQueue(Node)](#isonsyncqueue(node))
  - [acquireQueued(Node, int)](#acquirequeued(node,-int))
  - [selfInterrupt()](#selfinterrupt())

```java
public final void awaitUninterruptibly() {
    Node node = addConditionWaiter();
    int savedState = fullyRelease(node);
    boolean interrupted = false;
    while (!isOnSyncQueue(node)) {
        LockSupport.park(this);
        if (Thread.interrupted())
            interrupted = true;
    }
    if (acquireQueued(node, savedState) || interrupted)
        selfInterrupt();
}
```