---
title: ThreadPoolExecutor
author: voidblank
date: 2021-05-10 19:37:00 +0800
categories: [Java]
tags: [java, java源码, JDK1.8, 后台]
math: true
mermaid: true
---

# ThreadPoolExecutor
- `public class ThreadPoolExecutor extends AbstractExecutorService`
- 线程池

## 属性

### ctl
- `private final AtomicInteger ctl`
- 存储线程池状态及池内总的线程数量
- 线程存储上限`CAPACITY`:(1 << COUNT_BITS) - 1(即2<sup>29</sup> - 1)
- COUNT_BITS:Integer.SIZE - 3(即29)
- 获取当前线程池状态:`private static int runStateOf(int c) { return c & ~CAPACITY; }`
- 获取当前线程池中的线程总数: `private static int workerCountOf(int c)  { return c & CAPACITY; }`
- 根据状态和线程数获取ctl值(一般用于更新):`private static int ctlOf(int rs, int wc) { return rs | wc; }`

### RUNNING
- `private static final int RUNNING    = -1 << COUNT_BITS;`
- 表示线程池处在运行状态,接受新任务,处理任务
- 高三位:111
- 当调用`shutdown()`时状态变为`SHUTDOWN`
- 当调用`shutdownNow()`时状态变为`STOP`

### SHUTDOWN
- `private static final int SHUTDOWN   =  0 << COUNT_BITS;`
- 表示线程池处在结束任务的状态,不再接受新任务,处理池中剩下的任务
- 高三位:000
- 当调用`shutdownNow()`时状态变为`STOP`
- 当阻塞队列和线程池均为空时变为`TIDYING`

### STOP
- `private static final int STOP       =  1 << COUNT_BITS;`
- 表示线程池处在中止状态,不再接受新任务,不再运行池中未运行的任务,立刻结束正在运行的任务
- 高三位:001
- 当线程池为空时变成`TIDYING`

### TIDYING
- `private static final int TIDYING    =  2 << COUNT_BITS;`
- 表示线程池处在清理状态,所有的任务都已执行完(包括队列中的等待任务),正在执行的任务的数量为0,即将执行`terminated()`
- 高三位:010
- 当`terminated()`钩子调用完成时变为`TERMINATED`

### TERMINATED
- `private static final int TERMINATED =  3 << COUNT_BITS;`
- 表示线程池处在终止状态,`terminated()`执行完成
- 高三位:011

### workQueue
- `private final BlockingQueue<Runnable> workQueue;`
- 任务阻塞队列,常用的:
  - 基于数组的有界ArrayBlockingQueue
  - 基于链表的无界LinkedBlockingQueue
  - 最多只有一个元素的同步队列SynchronousQueue
  - 优先级队列PriorityBlockingQueue

### mainLock
- `private final ReentrantLock mainLock = new ReentrantLock();`
- 在对worker进行处理或对线程池状态进行改变的时候,使用该锁

### workers
- `private final HashSet<Worker> workers = new HashSet<Worker>();`
- 包含线程池中所有工作线程的set集合,对该集合的处理都需要使用mainLock

### termination
- `private final Condition termination = mainLock.newCondition();`
- 线程池使用了condition来配合ReentrantLock进行wait操作

### largestPoolSize
- `private int largestPoolSize;`
- 用于记录线程池取得的最大容量值,对该值进行修改的时候需要使用mainLock

### completedTaskCount
- `private long completedTaskCount;`
- 记录已完成的任务数,更新需要使用过mainLock
- 公式:原`completedTaskCount`(默认为0) + 退出线程的已完成任务数`completedTasks`

### threadFactory
- `private volatile ThreadFactory threadFactory;`
- 线程池中的线程工厂,新增worker是由该工厂完成的,默认使用J.U.C包下的`Executors`接口的内部静态类`DefaultThreadFactory`
- ThreadFactory接口规定的`public Thread newThread(Runnable r);`是线程池中新增线程的方法,一般来说会对新增的线程进行线程组的设定、线程名称的设定、线程优先级的设定、是否为守护线程的设定

### handler
- `private volatile RejectedExecutionHandler handler;`
- 当线程池满或处在`SHUTDOWN`状态时,执行的拒绝策略

### keepAliveTime
- `private volatile long keepAliveTime;`
- 闲置线程的最大存活时间(纳秒)
- 当线程数量超过`corePoolSize`或`allowCoreThreadTimeOut`为true时,启用该值,否则会将一直等待

### allowCoreThreadTimeOut
- `private volatile boolean allowCoreThreadTimeOut;`
- 为true时,核心线程会闲置最多`keepAliveTime`纳秒;为false时,核心线程会不会因闲置超时而被回收
- 默认为false

### corePoolSize
- `private volatile int corePoolSize;`
- 核心线程数,保证线程存活的最小数量
- 如果`allowCoreThreadTimeOut`为true,则存活线程的最小数量为0(因为超时闲置线程会被回收)
- 当任务线程数量大于该值,则会被放入阻塞队列中
- 最小值为0

### maximumPoolSize
- `private volatile int maximumPoolSize;`
- 线程池最大上限,无法超过`CAPACITY`

### defaultHandler
- `private static final RejectedExecutionHandler defaultHandler = new AbortPolicy();`
- 默认的拒绝策略(`handler`)

## 方法

### isRunning(int)
- `private static boolean isRunning(int c) { return c < SHUTDOWN; }`
- 判断当前状态是否为RUNNING
- 五种状态间是有大小区分的,从RUNNING到TERMINATED依次增大

### advanceRunState(int)
- `private void advanceRunState(int targetState)`
- 改变线程池状态,如果当前状态比要改变的状态大则直接退出
- 参数为五个状态常量

### tryTerminate()
- `final void tryTerminate()`
- 检查是否需要执行terminate,包括:
  - 状态不为RUNNING
  - 状态不为TYDING和TERMINATED
  - 状态为STOP或状态为SHUTDOWN且阻塞队列为空
  - 当前活跃线程数为0
  - 如果以上不满足,则跳出方法
  - 如果以上满足,则尝试将线程池状态变为TYDING,线程池置零,成功后执行`terminate()`
- 在添加worker失败、移除worker、执行shutdown()、执行shutdownNow()时调用

### interruptWorkers()
- `private void interruptWorkers()`
- 中断所有的worker,实际上调用的是`Worker.interruptIfStarted()`

### interruptIdleWorkers(boolean)
- `private void interruptIdleWorkers(boolean onlyOne)`
- 中断所有的空闲worker,如果传入true则只会检查第一个线程(无论中断与否)
- 实际上调用的是Worker内部变量thread的`interrupt()`

### isRunningOrShutdown(boolean)
- `final boolean isRunningOrShutdown(boolean shutdownOK)`
- 检查状态为RUNNING还是SHUTDOWN
- 当shutdownOK为true时,状态为RUNNING或为SHUTDOWN时都返回true
- 当shutdownOK为false时,只有状态为RUNNING时才返回true

### addWorker(Runnable, boolean)
- `private boolean addWorker(Runnable firstTask, boolean core)`
- 添加新任务到`workers`
- firstTask:要执行的任务
- core:为true时,根据`corePoolSize`来判断是否将任务执行;为false时,根据`maximumPoolSize`来判断是否将任务执行;如果活跃线程数为0或阻塞队列已满,则设为false;否则为true
- 流程:

```java
private boolean addWorker(Runnable firstTask, boolean core) {
        // 将大循环标识为retry
        retry:
        for (;;) {
            int c = ctl.get();
            int rs = runStateOf(c);

            // 校验当前线程池状态
            // 必要时检查是否为空
            if (rs >= SHUTDOWN &&
                ! (rs == SHUTDOWN &&
                   firstTask == null &&
                   ! workQueue.isEmpty()))
                return false;

            for (;;) {
              // 判断当前线程池内的线程数量是否超过当前允许的限制
              // core表示阻塞队列是否已满,满为false
                int wc = workerCountOf(c);
                if (wc >= CAPACITY ||
                    wc >= (core ? corePoolSize : maximumPoolSize))
                    return false;
                // 未满,通过CAS增加1个线程数量
                if (compareAndIncrementWorkerCount(c))
                    break retry;
                // 增加失败,则重新获取ctl并判断线程池状态是否发生变化
                c = ctl.get();
                if (runStateOf(c) != rs)
                    // 发生变化则跳到大循环
                    continue retry;
            }
        }

        // 判断任务是否开始
        boolean workerStarted = false;
        // 判断任务是否添加成功
        boolean workerAdded = false;
        Worker w = null;
        try {
            // 创建新任务的worker对象
            w = new Worker(firstTask);
            final Thread t = w.thread;
            if (t != null) {
                final ReentrantLock mainLock = this.mainLock;
                mainLock.lock();
                try {
                    // 重新获取线程池状态,double-check
                    int rs = runStateOf(ctl.get());

                    // 判断线程池状态
                    // 如果任务为null,状态又为SHUTDOWN,表示开辟新线程来执行阻塞队列中的任务
                    if (rs < SHUTDOWN ||
                        (rs == SHUTDOWN && firstTask == null)) {
                        if (t.isAlive()) // 判断线程是否存活
                            throw new IllegalThreadStateException();
                        // 上述条件都满足了,将worker对象加到workers中
                        workers.add(w);
                        // 检查线程池容量是否超过历史最大值,更新最大值
                        int s = workers.size();
                        if (s > largestPoolSize)
                            largestPoolSize = s;
                        // 线程添加成功
                        workerAdded = true;
                    }
                } finally {
                    mainLock.unlock();
                }
                // 线程添加成功时,执行任务,设置线程成功执行
                if (workerAdded) {
                    t.start();
                    workerStarted = true;
                }
            }
        } finally {
          // 如果线程未能成功执行,执行该方法,具体看下面
            if (! workerStarted)
                addWorkerFailed(w);
        }
        // 任务成功执行才会返回true
        return workerStarted;
    }
```

### addWorkerFailed(Wokrer)
- `private void addWorkerFailed(Worker w)`
- 当添加新任务失败时,调用该方法
- 将worker从workers中移除,将ctl-1,调用`tryTerminate()`

### runWorker(Worker)
- `final void runWorker(Worker w)`
- Worker类的`run()`的执行,即使抛出了异常也会视作任务完成,本质上时调用了Worker中的内部成员变量`Runnable firstTask`的`run()`

### 构造器
- 参数:
  - `int corePoolSize`
  - `int maximumPoolSize`
  - `long keepAliveTime`
  - `TimeUnit unit`
  - `BlockingQueue<Runnable> workQueue`
  - `ThreadFactory threadFactory`,可选
  - `RejectedExecutionHandler handler`,可选
- 会校验参数的值的有效性和是否包含空指针

### execute(Runnable)
```java

public void execute(Runnable command) {
        // 校验任务是否为空指针
        if (command == null)
            throw new NullPointerException();
        // 获取当前的任务数量
        int c = ctl.get();
        if (workerCountOf(c) < corePoolSize) {
            // 小于核心线程数则直接尝试添加任务
            if (addWorker(command, true))
                return;
            // 添加失败的话,说明线程池状态可能有问题或任务已被添加过
            // 重新获取ctl
            c = ctl.get();
        }
        // 判断线程池状态是否为RUNNING
        // 如果是,则将任务加入到阻塞队列中
        if (isRunning(c) && workQueue.offer(command)) {
            // 重新获取ctl,可能此时线程池的状态发生了变化
            int recheck = ctl.get();
            // 判断线程池状态,如果状态不为RUNNING则尝试将该任务从队列中移除
            if (! isRunning(recheck) && remove(command))
                // 执行拒绝策略
                reject(command);
            // 上述条件不成立,则判断线程池是否为空
            // 为空则添加一个空线程
            // 由于上方已经将任务添加到阻塞队列了,那么添加一个空线程后该任务会被立刻使用
            // 在设置了空闲核心线程存活时间时,需要这么做
            else if (workerCountOf(recheck) == 0)
                addWorker(null, false);
        }
        // 阻塞队列已满,则需要增大正在执行的线程池
        else if (!addWorker(command, false))
            // 失败的话执行拒绝策略,此时线程池已满或线程池terminating
            reject(command);
    }
```

### shutdown()
- `public void shutdown()`
- 将线程池状态变为SHUTDOWN,中断空闲worker,执行`tryTerminate()`

### shutdownNow()
- `public List<Runnable> shutdownNow()`
- 将线程池状态变为STOP,中断所有worker,执行`tryTerminate()`,将阻塞队列中的任务返回

### isShutdown()
- `public boolean isShutdown()`
- 状态为RUNNING是返回true,否则返回false

### isTerminating()
- `public boolean isTerminating()`
- 状态为RUNNING或TERMINATED时返回false,否则返回true

### isTerminated()
- `public boolean isTerminated()`
- 状态为TERMINATED时返回true,否则返回false

### awaitTermination(long, TimeUnit)
- `public boolean awaitTermination(long timeout, TimeUnit unit)`
- 等待直到线程池状态变为TERMINATED或超时

### prestartCoreThread()
- `public boolean prestartCoreThread()`
- 创建一个核心线程,成功返回true;
- 如果当前核心线程数大于等于`corePoolSize`,那么返回false并不会创建线程
- 创建的空线程用于闲置并等待新的任务

### prestartAllCoreThreads()
- `public int prestartAllCoreThreads()`
- 启动所有的核心线程
- 返回该方法启动的核心线程数

### remove(Runnable)
- `public boolean remove(Runnable task)`
- 将指定任务从阻塞队列中移除,并调用`tryTerminate()`
- 成功返回true,失败返回false

### purge()
- `public void purge()`
- 将阻塞队列中所有的类型为`Future`的,已经被取消了的线程移除

### getPoolSize()
- `public int getPoolSize()`
- 获取当前池中存活的worker的数量
- 如果线程池状态为TYDING及以上,则返回0

### getActiveCount()
- `public int getActiveCount()`
- 获取当前池中正在执行任务的worker数量
- 实际上遍历`workers`,调用worker的`isLocked()`

### getTaskCount()
- `public long getTaskCount()`
- 获取线程池的任务总数(已经执行完的,正在执行的,未执行的)
- 公式:已完成任务数(`completedTaskCount`) + 每个活跃线程的完成任务数(`completedTasks`) + (如果该活跃线程执行在执行任务,+1) + 阻塞队列中的任务数

### getCompletedTaskCount()
- `public long getCompletedTaskCount()`
- 获取线程池的已完成的任务总数
- 公式:已完成任务数(`completedTaskCount`) + 每个活跃线程的完成任务数(`completedTasks`)

## Worker
- `private final class Worker extends AbstractQueuedSynchronizer implements Runnable{}`

### 成员属性

#### thread
- `final Thread thread`: 执行的实际子线程

#### firstTask
- `Runnable firstTask`: 要执行的任务

#### completedTasks
- `volatile long completedTasks`: 已完成的任务总数