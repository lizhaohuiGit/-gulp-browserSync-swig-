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


gulp.task('style', function () {
    return gulp.src(filePath.sass)
        .pipe(plugins.plumber({
            errorHandler: function(err) {
                console.log(err);
                this.emit('end') }
        }))
        .pipe(plugins.sass({
            outputStyle: 'compressed'
        }))
        .pipe(plugins.autoprefixer())
        .pipe(plugins.rev())
        .pipe(gulp.dest(distPath + 'css'))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest(filePath.rev + 'css'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('script', function () {
    return gulp.src(filePath.js)
        .pipe(plugins.plumber({
            errorHandler: function(err) {
                console.log(err);
                this.emit('end') }
        }))
        .pipe(plugins.rev())
        .pipe(plugins.uglify())
        .pipe(gulp.dest(distPath + 'js'))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest(filePath.rev + 'js'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('template', function () {
    return gulp.src(filePath.views)
        .pipe(plugins.swig({defaults: { cache: false }}))
        .pipe(gulp.dest(distPath + 'views'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('fonts', function () {
    return gulp.src(filePath.fonts)
        .pipe(plugins.rev())
        .pipe(gulp.dest(distPath))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest(filePath.rev + 'fonts'))
});

gulp.task('images', function () {
    return gulp.src(filePath.images)
        .pipe(plugins.imagemin({
            optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true //类型：Boolean 默认：false 无损压缩jpg图片
        }))
        .pipe(plugins.rev())
        .pipe(gulp.dest(distPath))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest(filePath.rev + 'images'))
});

gulp.task('server', function () {
    browserSync.init({
        server: {
            baseDir: [".", "./dist/views"],
            index: "/dist/views/home/index.html",
            directory:false
        },
        port: 9000
    });
});

gulp.task('watch', function () {
    gulp.watch(filePath.sass, ['style']);
    gulp.watch(filePath.views, ['template']);
    gulp.watch(filePath.js, ['script']);
    gulp.watch(filePath.images, ['images']);
    gulp.watch(filePath.fonts, ['fonts']);
    browserSync.reload();
});

gulp.task('build', ['images', 'fonts', 'script', 'style', 'template'], function() {
    //- 读取 rev-manifest.json 文件以及需要进行文件替换
    return gulp.src(['./dist/rev/**/*.json', './dist/views*/**', './dist/css*/**'])
        .pipe(plugins.revCollector())
        .pipe(gulp.dest(distPath));
});

gulp.task('default', ['build', 'watch'], function () {
    gulp.start('server');
});
