var gulp = require('gulp');
var browserSync = require('browser-sync');
var plugins = require('gulp-load-plugins')();
var assetsPath = './assets/';    // 资源路径
var distPath = './dist/';    // 生成文件路径
var filePath = {
    sass: assetsPath + 'sass/*.scss',
    js: assetsPath + 'js/**/*.js',
    views: assetsPath + 'views/**/*.html',
    images: assetsPath + 'images*/**/*',
    fonts: assetsPath + 'fonts*/**/*',
    rev: distPath + 'rev/'
};
var env = process.env.NODE_ENV || 'dev';
var isProduction = env === 'production';


gulp.task('style', function () {
    return gulp.src(filePath.sass)
        .pipe(plugins.plumber({
            errorHandler: function(err) {
                this.emit('end') }
        }))
        .pipe(plugins.sass({
            outputStyle: 'compressed'
        }))
        .pipe(plugins.autoprefixer())
        .pipe(plugins.if( isProduction, plugins.rev() ))
        .pipe(gulp.dest(distPath + 'css'))
        .pipe(plugins.if( isProduction, plugins.rev.manifest() ))
        .pipe(plugins.if(isProduction, gulp.dest(filePath.rev + 'css') ));
});

gulp.task('script', function () {
    return gulp.src(filePath.js)
        .pipe(plugins.plumber({
            errorHandler: function(err) {
                this.emit('end') }
        }))
        .pipe(plugins.if( isProduction, plugins.rev() ))
        .pipe(plugins.uglify())
        .pipe(gulp.dest(distPath + 'js'))
        .pipe(plugins.if( isProduction, plugins.rev.manifest() ))
        .pipe(plugins.if(isProduction, gulp.dest(filePath.rev + 'js') ));
});

gulp.task('template', function () {
    return gulp.src(filePath.views)
        .pipe(plugins.swig({defaults: { cache: false }}))
        .pipe(gulp.dest(distPath + 'views'));
});

gulp.task('fonts', function () {
    var src = gulp.src(filePath.fonts);
    src = isProduction ?
        src.pipe(plugins.if( isProduction, plugins.rev() ))
        : src;
    return src.pipe(gulp.dest(distPath))
        .pipe(plugins.if( isProduction, plugins.rev.manifest() ))
        .pipe(plugins.if(isProduction, gulp.dest(filePath.rev + 'fonts') ));
});

gulp.task('images', function () {
    var src = gulp.src(filePath.images);
    src = isProduction ? src
        .pipe(plugins.imagemin({
            optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true //类型：Boolean 默认：false 无损压缩jpg图片
        }))
        .pipe(plugins.if( isProduction, plugins.rev() ))
        : src;
    return src.pipe(gulp.dest(distPath))
        .pipe(plugins.if( isProduction, plugins.rev.manifest() ))
        .pipe(plugins.if(isProduction, gulp.dest(filePath.rev + 'image') ));
});

gulp.task('server', function () {
    browserSync.init({
        open: false,
        server: {
            baseDir: [".", "./dist/views"],
            index: "/dist/views/home/index.html",
            directory:false
        },
        port: 9000
    });
    console.log('App (dev) is going to be running on http://localhost:9000 (by browsersync).');
});

gulp.task('watch', function () {
    gulp.watch(assetsPath + '**/*', ['reload']);
});

gulp.task('clean', function() {
    return gulp.src(distPath).pipe(plugins.clean());
});

gulp.task('reload', ['build'], function() {
    browserSync.reload();
});

gulp.task('build', ['images', 'fonts', 'script', 'style', 'template'], function() {
    var src = gulp.src(['./dist/rev/**/*.json', './dist/views*/**', './dist/css*/**']);
    //- 读取 rev-manifest.json 文件以及需要进行文件替换
    return isProduction ?
        src.pipe(plugins.revCollector())
            .pipe(gulp.dest(distPath))
        : src;
});

gulp.task('default', ['build', 'watch'], function () {
    gulp.start('server');
});
