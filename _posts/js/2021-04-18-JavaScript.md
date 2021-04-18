---
title: JavaScript
author: voidblank
date: 2021-04-18 14:03:00 +0800
categories: [Js]
tags: [js, 基础, 前端]
math: true
mermaid: true
---

# JavaScript

## 输出
- `window.alert()`：弹出警告框
- `document.write()`内容输出到html文档中
    - 如果在html加载完成后执行该函数，则会使html内容被覆盖
- `document.getElementById("demo").innerHTML`:将id=demo的内容改写
- `console.log()`：输出到控制台

## 变量

### 变量类型
- Number类型:数值
- String类型:字符串
- boolean类型:布尔值
- function类型:函数
- symbol类型:唯一值
- Array类型:数组类型
- Object类型:对象类型
- Date类型:日期Object
- null类型与undefined类型

### 特殊的变量类型
- NaN:Number,表示非数
- null:Object
- undefined:undefined
- 

### 判断变量类型
- typeof
    - Array与Object类型相同
    - 返回值是字符串,如Object类型返回`'object'`
- isArray
    - 用于判断是否是数组
- x instanceof y
    - 用于判断x是否是y类型
- x.constructor:返回变量的构造函数
    - 如`new Date().constructor` => Date()
    - `(3.14).constructor` => Number()

### 赋值
- 当变量与函数重名时，变量覆盖函数
- 当有重复函数时,后定义的覆盖先定义的
- `===`:判断值与数据类型是否都相等
- 对于`var x;`来说，x是undefined
- 对于下面的x来说，x是`"abc"`

```js
var x = "abc";
var x;
```

- 关于null与undefined：
    - `null==undefined`: true
    - `null===undefined`: false
    - typeof null: Object
    - typeof undefined: undefined 
    - null用于主动释放对象的应用
    - undefined一般表示变量声明但没赋过值
- NaN:
    - Number型，表示非数
    - NaN与自身不相等


### 转换
- `toString()`:将数值转换为字符串
    - `x.toString(16);`将x转为16进制数字的字符串
- `parseInt()`:将字符串转换为整数
- `parseFloat()`:将字符串转换为浮点数
- null与数据类型运算时，会进行转换
    - 5 + null: 5
    - "5" + null: "5null"
    - "5" + 1: "51"
    - "5" - 1: 4

### 关于布尔值
- "0" => 0, "0" => true
- "000" => 0, "000" => true
- NaN => "NaN", NaN => false
- Infinity => "Infinity", Infinity => true
- -Infinity => "-Infinity", -Infinity => true
- "" => 0 => false
- [] => 0 => false
- null => 0 => false
- undefined => NaN => false 
- function(){}
    - NaN
    - "function(){}"
    - true
- {}
    - NaN
    - "[Object, Object]"
    - true

### Object
- 键值对容器，键为String，值为非undefined和null的任意值
- 同名键后者覆盖

### 提升(Hoisting)
- 在JavaScript中，编译时会进行变量与函数的提升

```js
x = 5;
document.getElementById("demo").innerHTML = x;
var x;
func();
function func(){};
```

- 对于上面的代码，编译后会变为:

```js
function func(){}:
var x;
x = 5;
func();
document.getElementById("demo").innerHTML = x;
```

- 可以看到函数先于变量提升，而赋值的过程不会被提升

## 循环及相关

### for-in

```js
var person = {f1: "abc", f2: "def", f3: 1};
for(x in person){
    document.write(person[x]);
}
```

### for-of

```js
var person = {f1: "abc", f2: "def", f3: 1};
for(x of person){
    document.write(x);
}
```

### break与continue
- 可以使用`break label;`或是`continue label;`来在代码块内进行跳出或继续

```js
//执行前三句就会跳出
list:{
    document.write(cars[0] + "<br>"); 
    document.write(cars[1] + "<br>"); 
    document.write(cars[2] + "<br>"); 
    break list;
    document.write(cars[3] + "<br>"); 
    document.write(cars[4] + "<br>"); 
    document.write(cars[5] + "<br>"); 
}
```

## this
- JavaScript关键字

### 方法中
- this表示方法所属的对象

```js
var person = {
    firstName: "John",
    secondName: "Jonnas",
    id: 1234,
    // 这里的this表示person
    fullName: function(){
        return this.firstName + " " + this.secondName;
    }
}
```

### 单独使用
- this表示`[object Window]`

```js
var x = this;
// 会将demo的文本改成[object Window]
document.getElementById("demo").innerHTML = x;
```

### 函数中
- this表示函数的所有者，为`[object Window]`
- 严格模式下,this是undefined

```js
function myFunc(){
    // [object Window]或是undefined
    return this;
}
```

### 事件中
- this表示事件的HTML元素

```html
<button onclick="this.style.display='none'">点击消失</button>
```

### 函数绑定
- this表示当前绑定的对象

```js
var person1 = {
    fullName: function(){
        return this.s1 + " " + this.s2;
    }
}
var person2 = {
    s1: "abc",
    s2: "def",
}
// 绑定person2,此时返回的是person2的s1与s2
person1.fullName.call(person2);
```

## void
- 可以使用`href="javascript:void(0)"`来表示一个死链
- 与`href="#"`的区别:
    - `href="#"`表示跳转到页面头部,或是#pos跳转到id=pos的位置
    - `href="javascript:void(0)"`点击后不会有任何事情发生
- 可以定义一个方法`void(func())`,这表示无返回值，但是函数依然会执行

## 异步
- `setTimeout(func, time)`:创建一个子线程，在time秒后执行func方法
    - 异步创建，不会使程序在此等待

## 函数

### 属性
- arguments
    - `arguments.length`:返回参数的个数
    - `arguments[i]`:返回第i个参数，可以用来遍历参数
- 参数在提供时会默认设置为undefined,或是ES6中可以设置默认值

### 函数自调用
- 匿名函数自调用
- 创建后即调用

```js
(function (){
    console("hello!");
})();
```

- 将函数赋给变量时调用

```js
var x = function (){
    return "return something";
}();
```

### 闭包
- 相当于创建私有变量

```js
var add = function (){
    var cnt = 0;
    return function (){cnt++;}
}
// 执行add()时会导致cnt增加，但是外界无法直接修改cnt，只能通过add方法增加并获取
add();
add();
add();
```

## DOM

### 查找HTML元素
- 通过id:`var x = document.getElementById("demo");`
    - 若没有找到，则x为null
- 通过标签:

```js
// 查找id=demo的元素下的所有<p>元素,动态的
var x = document.getElementById("demo");
var y = x.getElementByTagName("p");
// 获取y中的元素,使用y.length来遍历查找
var t = y[1];
// 获取所有<p>元素的NodeList,静态的,一般用于旧版本浏览器的匹配
var pcoll = document.querySelectorAll("p");
```

- 通过类名:`var x = document.getElementByClassName("demo");`

### 改变HTML
- 改变HTML元素的内容:`document.getElementById("demo").innerHTML = "new txt.";`
- 改变HTML元素的属性:`document.getElementById("demo").src = "test.jpg";`
- 改变HTML元素的样式:`document.getElementById("demo").style.color = "red";`

### 事件

#### onclick
- 可以通过在HTML中使用`onclick=JavaScript`来实现点击触发的效果
    - 例如:`onclick="changeText(this)"`
    - 也可以在js中:`document.getElementById("demo").onclick=function(){changeText(this)};`

#### onmouseover&onmouseout
- 鼠标移至元素上和鼠标移出元素

#### onouserenter&onmouseleave
- 鼠标移至元素上和鼠标移出元素
- 不能冒泡

#### onmousedown&onmouseup
- 鼠标点击时和鼠标松起时

#### onkeydown
- 按下键盘按键

#### onkeyup
- 松起键盘按键

#### onkeypress
- 按下键盘按键并松起

#### onload&onunload
- 可以使用`onload`来检测用户加载页面/图像，使用`onunload`来检测用户离开页面
    - 例如:`<body onload="func()">`

#### onbeforeunload
- 刷新或关闭页面之前触发

#### onresize
- 窗口或框架被重新调整大小
- 拖动窗口的时候也会触发

#### onchange
- 可以使用`onchange`来检测用户输入
    - 例如:`<input type="text" id="fname" onchange="changeText()">`
- 当文本框发生改动并失去焦点时(?)就会触发

#### oninput
- 用于检测用户输入改变,改变时就会触发
- 通过js改变value不会触发

#### onsearch
- 按下"enter"或点击`<input="search>"`的元素按钮时触发

#### onsubmit
- 提交表单时触发

#### oncopy
- 用户复制时触发

#### oncut
- 用户剪切时触发

#### onpaste
- 用户粘贴时触发

### 事件的属性
- bubbles(bool):判断事件是否是起泡事件类型
- currentTarget:返回事件监听器触发该事件的元素
- target:返回触发此事件的元素
- type:返回触发事件类型,如`mousedown`

#### currentTarget&target
- 若将监听器添加在b上，则点击a不会有任何效果;添加在a上，则点击a和b都有效果。
- 点击a时:target与currentTarget都为a
- 点击b时:target为b,currentTarget为a

``` html
<!DOCTYPE html>
<html>
<head>
    <title>test</title>
</head>
<body>
    <div id="A">我是A
        <div id="B">我是B</div>
    </div>
</body>
</html>

<script>
    var a = document.getElementById('A'),
        b = document.getElementById('B');
    function handler (e) {
        console.log(e.target);
        console.log(e.currentTarget);
    }
    a.addEventListener('click', handler);   
</script>
```

### EventListener
- `element.addEventListener(event, function, useCapture);`
    - 向指定元素的指定事件添加事件句柄
    - event:事件名(不包含on),例如:`"click"`
    - function:触发时调用的函数名,例如:`myFunction, function(){}`
    - useCapture:可选参数,判断事件冒泡或是事件捕获,默认为false
        - 冒泡时,先触发内部元素,再触发外部元素(默认)
        - 捕获时,先触发外部元素,再触发内部元素
- 可以向同一事件添加多个事件句柄,不会覆盖
- 可以向window添加事件句柄
    - `window.addEventListener("resize", myFunc);`
    - 当用户重设窗口大小时触发
- `element.removeEventListener(event, function);`
    - 移出指定元素的指定事件下的指定事件句柄

### DOM元素(节点)
- 创建新节点

```html
<div id="myDiv">
    <p id="p1">text1</p>
    <p id="p2">text2</p>
</div>
<script>
    <!-- 创建一个<p> -->
    var para = document.createElement("p");
    <!-- 设置内容 -->
    var node = document.createTextNode("text3");
    <!-- 将内容添加进<p>中 -->
    para.appendChild(node);
    var element = document.getElementById("myDiv");
    <!-- 将上面创建的<p>添加进HTML中的myDiv中,置于末尾 -->
    element.appendChild(para);
    <!-- 将上面创建的<p>添加进HTML中的myDiv中,置于p2前面 -->
    element.insertBefore(para, document.getElementById("p2"));
</script>
```

- 移出已存在节点

```html
<div id="myDiv">
    <p id="p1">text1</p>
    <p id="p2">text2</p>
</div>
<script>
    <!-- 获取要删除节点的父节点 -->
    var parent = document.getElementById("myDiv");
    <!-- 获取要删除的节点 -->
    var node = document.getElementById("p1");
    <!-- 删除节点 -->
    parent.removeChild(node);
    <!-- 也可以这样删除 -->
    node.parentNode.removeChild(node);
</script>
```

- 替换节点:`parent.replaceChild(para, child);`