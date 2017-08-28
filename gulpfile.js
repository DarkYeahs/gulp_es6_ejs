const gulp = require('gulp');
//  es6转es5
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
// 重命名文件插件
const rename = require('gulp-rename');
//  md5生成
const md5 = require('md5');
// css文件压缩插件
const cssnano = require('gulp-cssnano');
//  文件合并插件
const concat = require('gulp-concat');
//  浏览器启动工具
//  const browserify = require('browserify');
//  将Browserify的bundle()的输出转换为Gulp可用的vinyl（一种虚拟文件格式）流
const source = require('vinyl-source-stream');
//  将scss编译成css
const sass = require('gulp-sass')
//  静态服务器
const browserSync = require('browser-sync').create();
//  请求代理
var proxyMiddleware = require('http-proxy-middleware');

const reload = browserSync.reload
//  在控制台log错误信息
const gutil = require('gulp-util')
//  gulp数据处理插件
const data = require('gulp-data')
//  ejs模板处理插件
const ejs = require('gulp-ejs')
//  文件读取模块
const fs = require('fs');
//  路径处理模块
const path = require('path');
//  语法检测模块
const eslint = require('gulp-eslint');
//  处理错误异常抛出模块
const plumber = require('gulp-plumber');
//  记录错误模块以及错误信息
let errItem = [], errMsg = []

/**
 * [getFiles 获取文件列表]
 * @param  {[String]} src [获取文件夹目录]
 * @param  {[String]} ext    [文件后缀名]
 * @return {[Array]}  fileList       [文件列表]
 */
let getFiles = (src, ext = '') => {
  let fileList = []
  let files = fs.readdirSync(src);
  files.forEach((filename) => {
    let fullname = path.join(src,filename);
    let stats = fs.statSync(fullname);
    if (stats.isFile()) {
      if (ext && path.extname(fullname) !== ext) return
      fileList.push(fullname)
    }
    else {
      let itemFiles = fs.readdirSync(fullname);
      itemFiles.forEach((itemFilename) => {
        if (itemFilename === 'modules') return
        let itemFullname = path.join(fullname,itemFilename);
        let itemStats = fs.statSync(itemFullname);
        if (itemStats.isFile()) {
          if (ext && path.extname(itemFullname) !== ext) return
          fileList.push(itemFullname)
        }
      })
    }
  });
  return fileList;
}

// 模版合并
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
        //  捕获编译ejs模板错误，防止报错导致进程退出
        .pipe(ejs().on('error', function(err) {
            gutil.log(err);
            this.emit('end');
        }))
        .pipe(rename({dirname: ''}))
        //  在development环境下生成html文件，在build环境下生成ftl文件
        .pipe(rename({extname: process.env.NODE_ENV == 'build' ? '.ftl' : '.html'}))
        .pipe(gulp.dest('dist/html'));
});
// 编译并压缩js
gulp.task('convertJS', () => {
  let entrie = getFiles('./src/js')
  entrie.forEach((item) => {
    gulp.src(item)
      .pipe(babel({
        "presets": ['es2015'],
        "plugins": [
          ["transform-es2015-classes", {"loose": true}],
          "transform-es2015-object-super",
        ]
      }))
      .pipe(uglify())
      .pipe(gulp.dest('dist/js'))
  })
  return gulp
});
//  语法检测模块
gulp.task('eslint', () => {
  let entrie = getFiles('./src/js')
  entrie.forEach((item) => {
    gulp.src(item)
      //  捕获以及收集eslint任务下的错误信息，以及防止错误抛出导致进程退出
      .pipe(plumber({
        errorHandler: function(err) {
          errItem.push(item)
          errMsg.push(err)
        }
      }))
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError())
  })
  return true
});
//  对eslint任务中捕获的错误信息进行检测以及显示在相应的页面上
gulp.task('checkError', function() {
  //  setTimeout执行是为了防止ejs文件编译完成后文件尚未写入完成
  setTimeout(function() {
    var allErrMsg = []
    errItem.forEach(function(item, index) {
      var errItemMsg = errMsg[index]
      allErrMsg.push('<p style="padding-left:30px; margin: 15px 0; font-size: 20px;">错误文件:' + item + '</p>')
      allErrMsg.push('<p style="padding-left:30px; margin: 15px 0; font-size: 20px;">错误信息:</p>')
      for (let i in errItemMsg) {
        let msg = errItemMsg[i]
        if (typeof msg === 'string') allErrMsg.push('<p style="padding-left:45px; margin: 15px 0; font-size: 20px;">' + i + ':' + msg + '</p>')
      }
    })
    allErrMsg = allErrMsg.join('')
    allErrMsg = '<div style="position: absolute; left: 0;top: 0;width: 100%;min-height: 100%;background-color: rgba(0, 0, 0, 0.6);color: #fff;z-index: 100000;">' + allErrMsg + '</div></html>'
    errItem.forEach(function(item) {
      let nameString = path.basename(item)
      let name = nameString.split('.')
      let modules = name && name[0]
      let url = 'dist/html/' + modules + '.html'
      let flag = fs.existsSync(url);
      let file = null
      if (flag) {
        file = fs.readFileSync(url, 'utf8')
        file = file.replace('</html>', allErrMsg)
        fs.writeFileSync(url, file, 'utf8');
      }
      else {
          console.log("没有该文件")
      }
    });
    //  防止浏览器刷新成功后看到的是上一次编译的结果
    setTimeout(function() {
      reload()
    }, 1000)
  }, 500)
})
//  在完成checkError任务后清空错误模块列表以及错误信息列表
gulp.task('finishCheck', function() {
  errItem = []
  errMsg = []
})
// gulp.task('errHandle', ['ejs'], function () {
//   setTimeout(function () {
//     let nameString = path.basename(errItem)
//     let name = nameString.split('.')
//     let modules = name && name[0]
//     let url = 'dist/html/' + modules + '.html'
//     let flag = fs.existsSync(url);
//     let file = null
//     if (flag) {
//       let errorMsg = []
//       file = fs.readFileSync(url, 'utf8')
//       for (let i in errMsg) {
//         if (typeof errMsg[i] === 'string') errorMsg.push('<p style="margin: 15px 0; font-size: 20px;">' + i + ':' + errMsg[i] + '</p>')
//       }
//       errorMsg = errorMsg.join('')
//       errorMsg = '<div style="position: absolute; left: 0;top: 0;width: 100%;min-height: 100%;height: auto;padding-left: 30px; background-color: rgba(0, 0, 0, 0.6);color: #fff;z-index: 100000;">' + errorMsg + '</div></html>'

//       file = file.replace('</html>', errorMsg)
//       fs.writeFileSync(url, file, 'utf8');
//       setTimeout(function() {
//         reload()
//       }, 1000)
//     }
//     else {
//         console.log("没有该文件")
//     }
//   }, 1000)
// })
//  scss编译
gulp.task('scss:compile', () => {
  let entries = getFiles('./src/scss')
  entries.forEach((item) => {
    gulp.src(item)
        //  捕获编译scss错误，防止报错导致进程退出
        .pipe(sass().on('error', function (err) {
          gutil.log(err)
          this.emit('end');
        }))
        .pipe(gulp.dest('src/css'))
  })
  return gulp
})

// 合并并压缩css
gulp.task('convertCSS', function(){
  let entries = getFiles('./src/css')
  entries.forEach((item) => {
    gulp.src(item)
      .pipe(cssnano())
      .pipe(rename(function(path){
        path.basename += '.min';
      }))
      .pipe(gulp.dest('dist/css'));
  })
  return gulp
})

//  启动服务器以及代理设置
gulp.task('browser-sync', function() {
    var files = [
       'dist/*.html',
       'dist/css/*.css',
       'dist/js/*.js',
       'dist/js/**/*.js',
    ];
    // 反向代理百度图片在自己的页面上
    var proxyAdtime = proxyMiddleware('/img', {
        target: 'http://www.baidu.com',
        headers: {
            host:'www.baidu.com'
        }
      });
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
        middleware: [proxyAdtime, proxyData, proxyResource, proxyLogin]

    }
   });
});// 代理
// 监视文件变化，自动执行任务
gulp.task('watch', function(){
  gulp.watch('src/scss/*.scss', ['scss:compile', 'convertCSS', reload]);
  gulp.watch('src/scss/**/*.scss', ['scss:compile', 'convertCSS', reload]);
  gulp.watch('src/js/*.js', ['ejs', 'eslint', 'checkError', 'finishCheck', 'convertJS', reload]);
  gulp.watch('src/js/**/*.js', ['ejs', 'eslint', 'checkError', 'finishCheck', 'convertJS', reload]);
  gulp.watch('src/templates/**/*.*', ['ejs', reload]);
  gulp.watch('src/templates/*.html', ['ejs', reload]);
});


gulp.task('dev', ['ejs', 'eslint', 'checkError', 'finishCheck', 'convertJS', 'scss:compile', 'convertCSS', 'browser-sync', 'watch']);

gulp.task('build', ['ejs', 'eslint', 'checkError', 'finishCheck', 'convertJS', 'scss:compile', 'convertCSS'])
