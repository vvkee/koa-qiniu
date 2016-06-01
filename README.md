# koa-qiniu


>参数


```
const {
    bucket = 'your_bucket',
    ACCESS_KEY = 'your_qiniu_ACCESS_KEY',
    SECRET_KEY = 'your_qiniu_SECRET_KEY',
    baseUrl = 'your qiniu url',
    hash = false // 如果为true的时候，那么文件名会生成一串当前日期的时间戳
} = config
```

>读取

```
const fileInfo = await ctx.qiniu.files['你上传文件文件时的file_name']
```

>返回值

```
fileInfo = {
    hash: '',    // 七牛生成的hash
    key: '',     // 七牛上的文件名
    url: ''      // 文件访问路径
}
```
