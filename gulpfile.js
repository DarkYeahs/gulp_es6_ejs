const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
// 重命名文件插件
const rename = require('gulp-rename');
// css文件压缩插件
const cssnano = require('gulp-cssnano');
// 文件合并插件
const concat = require('gulp-concat');
// 浏览器启动工具
// const browserify = require('browserify');
// 将Browserify的bundle()的输出转换为Gulp可用的vinyl（一种虚拟文件格式）流
const source = require('vinyl-source-stream');
// 将scss编译成css
const sass = require('gulp-sass')
// 静态服务器
const browserSync = require('browser-sync').create();

var proxyMiddleware = require('http-proxy-middleware');

const server = require('gulp-devserver');

const reload = browserSync.reload

const gutil = require('gulp-util')
// gulp数据处理插件
const data = require('gulp-data')
// ejs模板处理插件
const ejs = require('gulp-ejs')
// 文件读取模块
const fs = require('fs');
const path = require('path');

// 读取文件夹下子文件列表
let getFiles = (src) => {
  let fileList = []
  let files = fs.readdirSync(src);
  files.forEach((filename) => {
    let fullname = path.join(src,filename);
    let stats = fs.statSync(fullname);
    if (stats.isFile()) {
      console.log(fullname)
      fileList.push(fullname)
    }
  });
  return fileList;
}

// 模版合并
gulp.task('ejs', function(){
    gulp.src('src/templates/*.html')
        .pipe(data(function (file) {
            var filePath = file.path;
            // global.json 全局数据，页面中直接通过属性名调用
            return Object.assign(JSON.parse(fs.readFileSync('src/templates/global.json')), {
                // local: 每个页面对应的数据，页面中通过 local.属性 调用
                local: JSON.parse(fs.readFileSync( path.join(path.dirname(filePath), path.basename(filePath, '.html') + '.json')))
            })
        }))
        .pipe(ejs().on('error', function(err) {
            gutil.log(err);
            this.emit('end');
        }))
        .pipe(gulp.dest('dist'));
});
// 编译并压缩js
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

gulp.task('scss:compile', () => {
  console.log('scss:compile start')
  let entries = getFiles('./src/scss')
  entries.forEach((item) => {
    gulp.src(item)
        .pipe(sass())
        .pipe(gulp.dest('src/css'))
  })
  return gulp
})

// 合并并压缩css
gulp.task('convertCSS', function(){
  return gulp.src('src/css/*.css')
    .pipe(cssnano())
    .pipe(rename(function(path){
      path.basename += '.min';
    }))
    .pipe(gulp.dest('dist/css'));
})
gulp.task('browser-sync', function() {
    var files = [
       'dist/*.html',
       'dist/css/*.css',
       'dist/js/*.js'
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
            '^/api' : '/',     // rewrite path 
        }
      });
   browserSync.init({
     server: {
        baseDir: "dist",
        middleware: [proxyAdtime, proxyData]

    }
   });
});// 代理
// 监视文件变化，自动执行任务
gulp.task('watch', function(){
  gulp.watch('src/scss/*.scss', ['scss:compile', 'convertCSS', reload]);
  gulp.watch('src/js/*.js', ['convertJS', reload]);
  gulp.watch('src/templates/**/*.*', ['ejs', reload]);
  gulp.watch('src/templates/*.html', ['ejs', reload]);
});

gulp.task('start', ['ejs', 'convertJS', 'scss:compile', 'convertCSS', 'browser-sync', 'watch']);