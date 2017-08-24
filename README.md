>最近因为团队前后端开发耦合过高，前端开发经常因为后端开发而出现阻塞现象，所以最近基于Gulp搭建了一套开发流程，使得前端开发能够不受后端开发因素而出现开发阻塞现象。项目目录如下

```
.
├── dist                            编译文件所在目录
├── gulpfile.js                     项目搭建文件
├── package.json                    
└── src                             
    ├── assets                      项目公共的静态资源文件
    ├── js
    |   ├── modules                 js模块文件
    |   ├── common.scss             js公共文件
    |   └── index                   index页面的js文件
    ├── scss
    |   ├── modules                 scss模块文件
    |   ├── common.scss             scss公共文件
    |   └── index                   index页面的scss文件
    ├── css
    |   ├── common.css              common.scss编译后的公共文件
    |   └── index.css               index页面的scss文件编译后的结果
    └── template
        ├── _global                 全局的公有模块
        ├── _partical               各个模块文件
        ├── global.json             全局的配置文件
        └── modules
            └── index               index模块管理
                ├── index.ejs       配置index页面
                └── index.json      index页面的配置文件

```
>如上面目录所示，搭建的开发的流程中，主要提供了以下几个功能
> 1. ejs模板引擎的使用（PS:[想了解ejs以及其使用的可以点击这里](https://segmentfault.com/a/1190000004286562)）
```
gulp.task('ejs', function(){
    var res = gulp.src('src/templates/modules/**/*.html')
        .pipe(data(function (file) {
            var filePath = file.path;
            // global.json 全局数据，页面中直接通过属性名调用
            return Object.assign(JSON.parse(fs.readFileSync('src/templates/global.json')), {
                // local: 每个页面对应的数据，页面中通过 local.属性 调用
                local: JSON.parse(fs.readFileSync( path.join(path.dirname(filePath), path.basename(filePath, '.html') + '.json'))),
                hash: new Date().getTime()
            })
        }))
        .pipe(ejs().on('error', function(err) {
            gutil.log(err);
            this.emit('end');
        }))
        .pipe(rename({dirname: ''}));
        if (process.env.NODE_ENV == 'build') {
          res.pipe(rename({extname: '.ftl'}))
            .pipe(gulp.dest('dist/html'));
        }
        else {
          res.pipe(gulp.dest('dist/html'));
        }
        return res;
});
```
>通过使用gulp-ejs模块对指定目录下的ejs文件进行编译，通过全局配置的global.json以及相应目录下的同名json文件对ejs进行数据渲染，在开发环境中生成html文件并在本地服务器上进行预览操作，在生产环境则按照格式生成freemark模板文件（因前后端未分离原因）。
> 2. es6语法的使用
```
gulp.task('convertJS', () => {
  let entrie = getFiles('./src/js')
  entrie.forEach((item) => {
    gulp.src(item)
      .pipe(babel({
        presets: ['es2015']
      }))
      .pipe(uglify())
      .pipe(gulp.dest('./dist/js'))
  })
  return gulp
});
```
> 首先通过自己写的一个脚本获取到js文件列表，在通过gulp-babel模块按照es2015的规则将es6的语法转换成es5的语法，然后对转换后的代码通过gulp-uglify模块进行代码压缩最终输出到dist/js目录下面

> 3. scss的编译
```
gulp.task('scss:compile', () => {
  let entries = getFiles('./src/scss')
  entries.forEach((item) => {
    gulp.src(item)
        .pipe(sass())
        .pipe(gulp.dest('src/css'))
  })
  return gulp
})
```
>因为写css过于繁琐所以使用了scss来进行预编译css，加快开发的速度，同时规范css的编写。  
>这里是使用了gulp-sass模块进行scss的预编译，将scss编译成css
> 4. 请求代理的转发

```
gulp.task('browser-sync', function() {
    var files = [
       'dist/*.html',
       'dist/css/*.css',
       'dist/js/*.js'
    ];
    var proxyData = proxyMiddleware('/api', {
        target: 'https://api.douban.com',
        headers: {
            host:'api.douban.com'
        },
        pathRewrite: {
            '^/api' : '/'     // rewrite path 
        }
      });
    var proxyResource = proxyMiddleware(['/scripts', '/themes', '/company', '/source'], {
      target: 'http://172.20.132.182:8021',
      headers: {
        host: '172.20.132.182:8021'
      }
    })
    var proxyLogin = proxyMiddleware(['/login', '/userlogin', '/checkCaptcha'], {
      target: 'http://172.20.132.182:8021',
      headers: {
        host: '172.20.132.182:8021'
      },
      pathRewrite: {
        '^/login': '/'
      }
    })
   browserSync.init({
     server: {
        baseDir: "dist/",
        middleware: [proxyData, proxyResource, proxyLogin]

    }
   });
});
```
> 这里使用了browser-sync模块进行本地服务器的搭建，同时通过配置middleware对根路径下的/login', '/userlogin', '/checkCaptcha，'/scripts', '/themes', '/company', '/source'的请求转发到远程服务器上从而克服浏览器对于跨域请求的bug
