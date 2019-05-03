
<img src="https://img.shields.io/crates/l/rustc-serialize/0.3.24.svg">


JavaScript原生实现的网页签名插件，支持横屏签名。

#### 说在前面
一直在用JSignature但是有的地方不太灵活，于是看了两天canvas的教程整了这个玩意。
可能会有一些bug，但是我还没发现，大家可以在Issue直接提给我。
后续会整个Vue版。 

东西没有什么难度，但是也希望大神们在各种情况下尊重我的劳动成果。

#### 如何使用
克隆仓库到本地，使用script标签引入signature.js或者signature.min.js

#### 配置
1. el 对应要绑定的canvas元素，只能是canvas，可以是id或者class(只取第一个匹配的DOM)。
2. lineWidth 笔画线条粗细，只支持字符串数字或数字，默认为5
3. lineColor 笔画颜色，只支持 HEX格式(如：#000000),默认为 #000000
4. overflow boolean, true 自动为body添加overflow = hidden属性，默认为true
5. background canvas背景颜色 只支持 HEX格式(如：#000000),默认为 #ffffff;

#### 实例化
```$xslt
var option = {
    el:'#canvas',
    lineWidth:6,
    lineColor:'#ff0000',
    overflow: true,
    background: '#38FFFF'
}
new Signature(option).create()
```

#### API
##### create()
```$xslt
new Signature(option).create()
根据option的配置规则生成签名画布，所有实例要想被创建，都必须在new后调用create()方法。
```

##### reset()
```$xslt
new Signature(option).reset()
重置画布内容
```

##### undo()
```$xslt
new Signature(option).undo()
后退一步操作
```
可以添加回调函数，用于撤销后要执行的操作
```$xslt
new Signature(option).undo(function(){
    console.log(1)
})
```


##### redo()
```$xslt
new Signature(option).redo()
前进一步操作
```
可以添加回调函数，用于前进后要执行的操作
```$xslt
new Signature(option).redo(function(){
    console.log(1)
})
```

##### getContentBase64()
```$xslt
new Signature(option).getContentBase64()
返回当前画布的base64数据
```

要在不旋转画布的情况下，强制获取横屏数据（现有数据角度转-90度）
```$xslt
new Signature(option).getContentBase64(true)
```

如果需要添加回调函数，就必须要输入第一个参数，如：
```$xslt
new Signature(option).getContentBase64(false,function(){
    console.log(1)
})
```

#### getBlob()
```$xslt
new Signature(option).getBlob()
获取当前画布数据的Blob对象。
```

#### getFile()
```$xslt
new Signature(option).getFile()
获取当前画布数据的File对象。
```
