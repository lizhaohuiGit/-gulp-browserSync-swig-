var gulp = require('gulp');
var browserSync = require('browser-sync');
var plugins = require('gulp-load-plugins')();

gulp.task('style', function () {
    gulp.src('./assets/sass/*.scss')
        .pipe(plugins.plumber({
            errorHandler: function(err) {
                console.log(err);
                this.emit('end') }
        }))
        .pipe(plugins.sass({
            outputStyle: 'compressed'
        }))
        .pipe(plugins.autoprefixer())
        .pipe(gulp.dest('./dist/css'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('script', function () {
    return gulp.src('./assets/js/**/*.js')
        .pipe(plugins.plumber({
            errorHandler: function(err) {
                console.log(err);
                this.emit('end') }
        }))
        .pipe(plugins.uglify())
        .pipe(gulp.dest('./dist/js'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('template', function () {
    gulp.src('./assets/views/**/*.html')
        .pipe(plugins.swig({defaults: { cache: false }}))
        .pipe(gulp.dest('./dist/views'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('static', function () {
    gulp.src(['./assets/images*/**/*', './assets/fonts*/**/*']).pipe(gulp.dest('./dist/'))
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
    gulp.watch('./assets/sass/**/*.scss',['style']);
    gulp.watch('./assets/views/**/*.html',['template']);
    gulp.watch('./assets/js/**/*.js',['script']);
    gulp.watch(['./assets/images*/**/*', './assets/fonts*/**/*'],['static']);
    browserSync.reload();
});

gulp.task('default', ['static', 'script', 'style', 'template', 'watch'], function () {
    gulp.start('server');
});
