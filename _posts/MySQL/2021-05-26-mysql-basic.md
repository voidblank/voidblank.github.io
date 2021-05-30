---
title: MySQL 基础
author: voidblank
date: 2021-05-30 21:57:00 +0800
categories: [mysql]
tags: [MySQL, 数据库, 基础]
math: true
mermaid: true
---

# MySQL 基础

## DQL
- Data Query Language,数据查询语言

### 语句

```sql
-- 一
SELECT
	st_id AS id,
	st_name AS NAME 
FROM
	test_table1 t1,
	test_table2 t2 
WHERE
	t1.st_id = t2.s_id 
	AND t1.st_id IS NOT NULL 
ORDER BY
	t1.st_time DESC 
	LIMIT 5,
	10

-- 二
SELECT
	st_id 
FROM
	test_table1 t1
	LEFT JOIN test_table2 t2 ON t1.st_id = t2.s_id 
WHERE
	t2.s_name != '' 
GROUP BY
    t2.s_time
    HAVING COUNT(*) > 1
ORDER BY
	t2.s_time ASC 
	LIMIT 100
```

## DML
- Data Manipulate Language, 数据操作语言

### 语句

```sql
-- 新增
INSERT INTO test_table1 ( Uid, Uname )
VALUES
	( 123, 'aaa' )

-- 更新
UPDATE test_table1 t1,
test_table2 t2 
SET t1.Password = 'abbb',
t2.Number = 211 
WHERE
	t1.Uid = 123 
	AND t2.Eid =1

-- 删除一
DELETE 
FROM
test_table1 
WHERE
	Uid = 123

-- 删除二
TRUNCATE TABLE test_table1
```

## DDL
- Data Define Languge, 数据定义语言

### 语句

```sql
-- 新增数据库
CREATE DATABASE test_database1

-- 删除数据库
DROP DATABASE test_database1

-- 新建表
CREATE TABLE IF NOT EXISTS `test_table1`(
		`st_id` INT NOT NULL COMMENT '主键',
		`st_name` VARCHAR(20) DEFAULT NULL COMMENT '名字',
		`st_gender` CHAR,
		`st_time` DATETIME,
        PRIMARY KEY (`st_id`) USING BTREE,
        KEY `index_st_name` (`st_name`) USING BTREE,
        KEY `index_st_key` (`st_id`, `st_name`) USING BTREE
	)ENGINE=InnoDB DEFAULT CHARSET=utf-8 ROW_FORMAT=DYNAMIC COMMENT='表1';

-- 删除表
DROP TABLE IF EXISTS test_table1

-- 查看表结构
DESC test_table1

-- 修改表名
ALTER TABLE test_table1 RENAME TO test_table2

-- 新增字段
ALTER TABLE test_table1 ADD COLUMN email VARCHAR(20) NOT NULL

-- 修改字段
ALTER TABLE test_table1 MODIFY COLUMN email VARCHAR(30)
ALTER TABLE test_table1 CHANGE COLUMN email email1 VARCHAR(30) NOT NULL

-- 删除字段
ALTER TABLE test_table1 DROP COLUMN email
```

## 事务
- 四种隔离级别

### READ UNCOMMITTED
- 未提交读
- A事务已执行，但未提交；B事务查询到A事务的更新后数据；A事务回滚；---出现脏数据

### READ COMMITTED
- 已提交读
- A事务执行更新；B事务查询；A事务又执行更新；B事务再次查询时，前后两次数据不一致；---不可重复读

### REPEATABLE READ
- 可重复读
- A事务无论执行多少次，只要不提交，B事务查询值都不变；B事务仅查询B事务开始时那一瞬间的数据快照；

### SERIALIZABLE
- 串行化
- 不允许读写并发操作，写执行时，读必须等待；

### 语句

```sql
start transaction;
...
commit;
rollback;

-- 查看当前隔离级别
SELECT @@tx_isolation

-- 设置事务隔离级别
set session transaction isolation level [要设置的隔离级别]
```

## 视图
- view,虚拟表,在调用的时候执行语句生成
- 平时缓存查询语句

### 语句

```sql
-- 创建
create view v1 as 
select * from test_table1 where st_id is not null

-- 查看
select * from v1

-- 更新
create or replace view v1 as
select * from test_table1 where st_id is not null and st_name is not null

-- 删除
drop view v1
```

## 存储过程
- 预先编译过的sql集合

### 语句

```sql
DROP PROCEDURE IF EXISTS `proc_adder`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `proc_adder`(IN a int, IN b int, OUT sum int)
BEGIN
    #Routine body goes here...

    DECLARE c int;
    if a is null then set a = 0; 
    end if;
  
    if b is null then set b = 0;
    end if;
    set sum  = a + b;
END
;;
DELIMITER ;

-- 调用
set @b=5;
call proc_adder(2,@b,@s);
select @s as sum;
```

## 多表连接查询相关
![]({{ site.url }}/assets/markdown/sql-joins.png)
- 左连接(left join)
  - 返回包括左表中的所有记录和右表中连接字段相等的记录
- 右连接(right join)
  - 返回包括右表中的所有记录和左表中连接字段相等的记录
- 内连接(也称为等值连接,inner join)
  - 返回两个表中连接字段相等的行
- 全外连接(full join)
  - 返回左右表中的所有记录和左右表中连接字段相等的记录

## 删除的比较
- truncate table `表名`
  - 效率高于delete
  - 保留表的结构
  - 不能回滚
- delete from `表名`
  - 添加 where 即删除特定行,不添加where则全部行都删除
  - 可以回滚
- drop table `表名`
  - 效率最高
  - 将表完全删除,包括表的结构
  - 依赖于该表的存储过程/函数将被保留，但其状态会变为：invalid
  - 不能回滚

## 常用语句

```bash
#登录
>mysql -h host -p port -u username -p password

#版本
>mysql --version
```

```sql
-- 显示所有数据库
show databases

-- 使用指定数据库
use database1

-- 显示所有表
show tables
show tables from datase1

-- 显示版本
select version()

-- 查看全局变量
SHOW GLOBAL VARIABLES LIKE '%char%'
SELECT @@global.autocommit

-- 查看会话变量
SHOW SESSION VARIABLES LIKE '%char%'
SELECT @@autocommit
```

## 安装时的可能的问题

### 安装后无mysql数据库
- 首先停止mysql服务,`net stop mysql`
- 删除data文件夹
- (管理员)在bin目录下，`mysqld --initialize-insecure --user=mysql`

### 5.7版本更改密码
- 使用`skip-grant-tables`无密码登录
- 执行以下sql语句

```sql
use mysql;
update user set authentication_string=password('123') where user='root';
flush privileges;
```