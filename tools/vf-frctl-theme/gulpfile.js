'use strict';

const gulp              = require('gulp');
const sass              = require('gulp-sass');
const sourcemaps        = require('gulp-sourcemaps');
const autoprefixer      = require('gulp-autoprefixer');
const sassGlob          = require('gulp-sass-glob');
const uglify            = require('gulp-uglify');
const browserify        = require('browserify');
const watchify          = require('watchify');
const babel             = require('babelify');
const source            = require('vinyl-source-stream');
const buffer            = require('vinyl-buffer');
const del               = require('del');

//
// JS
//
gulp.task('js', ['clean:js'], () => compileJS());
gulp.task('js:watch', () => compileJS(true));

gulp.task('clean:js', function() {
    return del(['./dist/js']);
});

//
// CSS
//
gulp.task('css', function() {
  return gulp.src('./assets/scss/*.scss')
    .pipe(sassGlob())
    .pipe(sass({
        includePaths: 'node_modules'
    }).on('error', sass.logError))
    .pipe(autoprefixer({
        browsers: ['last 5 versions']
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/css'));
});


gulp.task('css:clean', function() {
    return del(['./dist/css']);
});

gulp.task('css:watch', function () {
    gulp.watch('./assets/scss/**/*.scss', ['css']);
});

//
// Images
//
gulp.task('img', ['img:clean'], function() {
   gulp.src('./assets/img/**/*').pipe(gulp.dest('./dist/img'));
});

gulp.task('img:clean', function() {
    return del(['./dist/img']);
});

gulp.task('img:watch', function () {
    gulp.watch('./assets/img/**/*', ['img']);
});

//
// Task sets
//
gulp.task('watch', ['css:watch', 'js:watch', 'img:watch']);

gulp.task('default', ['css', 'js', 'img']);

//
// Utils
//
function compileJS(watch) {

    let bundler = browserify('./assets/js/vf-frctl-theme.js', {
        debug: true
    }).transform(babel, {
        presets: ["es2015"]
    });

    if (watch) {
        bundler = watchify(bundler);
        bundler.on('update', function () {
            console.log('Rebundling JS....');
            rebundle();
        });
    }

    function rebundle() {
        let bundle = bundler.bundle()
            .on('error', function (err) {
                console.error(err.message);
                // this.emit('end');
            })
            .pipe(source('vf-frctl-theme.js'))
            .pipe(buffer());

        if (!watch) {
            bundle.pipe(uglify());
        }

        bundle.pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./dist/js'));

        return bundle;
    }

    rebundle();
}
