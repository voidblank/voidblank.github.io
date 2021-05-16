# SpringBoot 注解

## A

### @Autowired
- `org.springframework.beans.factory.annotation.Autowired`
- 标注在类、成员变量、构造函数上,他用来进行自动装配
- 使用这个注解后,被标注的类/成员变量/构造函数将不需要写出get与set方法

## B

### @Bean
- `org.springframework.context.annotation.Bean`
- 标注在方法上,表示向容器中添加一个组件,将方法的返回值添加到容器中

## C

### @Component
- `org.springframework.stereotype.Component`
- 标注在类上,该类会被看作时组件,当扫描时会将该类实例化
- 当这个组件不属于`@controller`,`@service`,`@repository`等类型时,使用该标注

### @ComponentScan(basePackages)
- `org.springframework.context.annotation.ComponentScan`
- 标注在类上,指定你要扫描的包。因为SpringBoot只会默认扫描主配置类所在目录及该目录的子目录,所以有时需要这个配置来扫描其他文件

### @Conditional({conditionSubClass.class})
- `org.springframework.context.annotation.Conditional`
- 标注在类或方法上,表示当conditionSubClass(即实现了`Condition`接口,重写了`matches()`方法的条件判断类)中的`matches()`方法返回true时,才会创建这个bean
- 标注在方法上时,仅对该方法有效;标注在类(配置类)上时,将会对类下所有方法有效
- 参数可以是类的数组,这种情况下各个类的`matches()`方法都返回true时才会通过判断

### @ConditionalOnBean
- `org.springframework.boot.autoconfigure.condition.ConditionalOnBean`
- 标注在方法上,表示若存在他注解的类的bean,那么就会再次创建这个bean
- 与`@ConditionalOnMissBean`相反

### @ConditionalOnMissBean
- `org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean`
- 标注在方法上,表示若存在他注解的类的bean,那么就不会再次创建这个bean
- 只能在`@Bean`注解的方法上使用,不能在`@Component`注解的方法上使用
- 可以进行参数传递

### @Configuration
- `org.springframework.context.annotation.Configuration`
- 标注在类上,表示这个类是Spring的配置类,相当于是一个xml文件

### @ConfigurationProperties(value)
- `org.springframework.boot.context.properties.ConfigurationProperties`
- 标注在类上,从配置文件中加载数据给类,填充对象的对应字段的数据
- 类中`getXXX`的XXX必须与配置文件中严格一致,否则会出异常
- value表示在配置文件中的前缀
- 该类需要注释`@Component`,即将该类添加至容器中
- 可以在pom.xml下添加`spring-boot-configuration-processor`依赖,从而在配置文件中编写时获得提示

### @Controller
- `org.springframework.stereotype.Controller`
- 标注在类上,表示当前类是一个控制器类,类下的所有方法返回的是视图(即页面或model)
- 一般可配合`@RequestBody`使用,使返回的是传给页面的数据,如json或xml

### @ControllerAdvice
- `org.springframework.web.bind.annotation.ControllerAdvice`
- 标注在类上,表示当前类是一个控制器通知类,用于将类下的方法应用于所有的控制器上
- 一般用于全控制器的异常处理,向主机发送消息

## E

### @EnableAutoConfiguration
- `org.springframework.boot.autoconfigure.EnableAutoConfiguration`
- 表示启用自动配置,SpringBoot实现自动化配置的核心注解

### @ExceptionHandler(Exception.class)
- `org.springframework.web.bind.annotation.ExceptionHandler`
- 标注在方法上,用于处理方法中抛出的异常
- 判断的异常类型由参数中的class决定
- 一般和`@ControllerAdvice`配合使用,用于捕获全句控制器的异常

## S

### @SpringBootApplication
- `org.springframework.boot.autoconfigure.SpringBootApplication`
- 标注在类上,表示这个类是SpringBoot的主配置类,通过运行该类的main方法来启动SpringBoot应用
- 这是一个组合注解,内部包含了`@EnableAutoConfiguration`,`@ComponentScan`,`@SpringBootConfiguration`

### @SpringBootConfiguration
- `org.springframework.boot.SpringBootConfiguration`
- 标注在类上,表示这个类是SpringBoot的配置类

## R

### @RequestBody
- `org.springframework.web.bind.annotation.RequestBody`
- 标注在方法上,表示将函数的返回值返回给页面
- 一般配合`@Controller`使用,或直接使用`@RestController`

### @RequestMapping
- `org.springframework.web.bind.annotation.RequestMapping`
- 标注在类或方法上,用来处理请求地址映射。在类上时,表示其方法都会以该地址作为父路径
- 参数:
  - value:请求的实际地址,可以是数组。是参数的默认值
  - method:请求的类型,如GET,POST,PUT,DELETE
  - consumes:(content-Type)指定请求处理的提交内容类型
  - produces:指定返回的内容类型
  - params:指定request中必须包含某些参数时,才会执行该方法
  - headers:指定request中必须包含的headers,才会执行该方法

### @RequestParam
- `org.springframework.web.bind.annotation.RequestParam`
- 标注在方法上,将请求中指定的参数值赋给方法中的形参
- 参数:
  - value:请求参数名,是参数的默认值
  - required:设置这个参数是否必须,默认为true。当参数必须时若无参数则会抛出异常
  - defaultValue:设置参数的默认值,当设置该值后,required变为false

### @RestController
- `org.springframework.web.bind.annotation.RestController`
- 标注在类上,相当于`@Controller` + `@RequestBody`,当类添加了该注解后,类下的方法的返回值会返回给浏览器
- 当返回json,xml或自定义的media type内容到页面时,需要使用`@RestController`或`@Controller` + `RequestBody`
- 使用这个注解后,就不能返回jsp或html页面了,视图解析器也无法解析jsp和html页面

## V

### @Value
- `org.springframework.beans.factory.annotation.Value`
- 两种用法:
  1. `@Value("${}")`
     - 标注在成员变量上,从properties中获取值
     - 例如:`@Value("${user.name})`即:将application.properties中user.name的值赋给被注解的变量
     - 这个方法无法为map或类等类型赋值
  2. `@Vaule("#{}")`
     - 标注在成员变量上,从bean获取值或赋常量值
     - 例①:`@Value("#{1}")`即:将1赋给被注解的变量
     - 例②:`@Value("#{user.name}")`即:将user.name的值赋给被注解的变量
     - 这个方法也可以将函数的返回值赋给成员变量
     - 需要两bean在同一容器中,或被调用的bean所在容器是调用bean所在容器的父容器才能获取到值

