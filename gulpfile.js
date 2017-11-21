//导入工具包 require('node_modules里对应模块')
var gulp = require('gulp'),//本地安装gulp所用到的地方
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),//压缩js
    connect = require('gulp-connect');


// Load plugins
var $ = require('gulp-load-plugins')();

/* es6 */
gulp.task('es6', function() {

  return gulp.src('src/js/*.js')
    .pipe($.plumber())
    .pipe($.babel({
      presets: ['es2015']
    }))
      // .pipe(uglify())
      .pipe(connect.reload())  //自动刷新
    .pipe(gulp.dest('./dist/js'));
});
//html压缩
gulp.task('html',function(){
    gulp.src('src/app/*.html')

        .pipe(gulp.dest('./dist/app'));
});
//
gulp.task('json', function() {
    return gulp.src('src/*.json')
        .pipe(gulp.dest('./dist/'));
});

gulp.task('images', function() {
    return gulp.src('src/images/*.png')
        .pipe(gulp.dest('./dist/images'));
});

// 定义一个sass任务
gulp.task('sass', function () {
  return gulp.src('./src/css/*.scss')//任务针对的文件
    .pipe(sass().on('error', sass.logError))//任务调用的模块
    .pipe(gulp.dest('./dist/css'));//生成路径
});
// 开启热更新
gulp.task('connect', function () {
    connect.server({
        port:'3333',
        livereload: true
    });
});
//默认执行
gulp.task('dev',['sass','es6','html','json','connect','images','open'])

//监听任务
gulp.task('open', function () {
    gulp.watch('./src/css/*.scss', ['sass']);
    gulp.watch(['./src/js/*.js'], ['es6']);
    gulp.watch(['./src/app/*.html'], ['html']);
});

