/**
 * Created by ineyy on 23.04.2017.
 */
var gulp = require('gulp');
var watch = require('gulp-watch');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var mCss = require('gulp-minify-css');
var less = require('gulp-less');
var count = require('gulp-count');

var front_path = './src/agate-front/src/';

gulp.task('sass', function() {
    return watch([
        front_path + 'styling/sass/**/*.sass',
        front_path + 'styling/sass/*.sass'
    ], function() {
        gulp.src([
            front_path + 'styling/sass/**/*.sass',
            front_path + 'styling/sass/*.sass'
        ])
            .pipe(count('## sass files'))
            .pipe(sass({
                includePaths: require('bourbon').includePaths
            }).on('error', sass.logError))
            .pipe(concat('compass.min.css'))
            .pipe(gulp.dest(front_path + 'styling'));
    });
});

gulp.task('login', function() {
    var src = [
        front_path + 'styling/sass/login.sass'
    ];
    return watch(src, function() {
        gulp.src(src)
            .pipe(sass().on('error', sass.logError))
            .pipe(concat('login.min.css'))
            .pipe(gulp.dest(front_path + 'styling'));
    });
});

gulp.task('alib-js', function() {
    var src = [
        front_path + 'javascript/third_party/highlights.js',
        front_path + 'javascript/third_party/angular.js',
        front_path + 'javascript/third_party/chart.js',
        front_path + 'javascript/third_party/*.js'
    ];
    return watch(src, function() {
        gulp.src(src)
            .pipe(count('## alib js files'))
            .pipe(concat('alib.min.js'))
            //.pipe(uglify())
            .pipe(gulp.dest(front_path + 'javascript'));
    });
});

gulp.task('app-js', function() {
    var src = [
        front_path + 'javascript/app/app.js',
        front_path + 'javascript/app/**/*.js'
    ];
    return watch(src, function() {
        gulp.src(src)
            .pipe(count('## app js files'))
            .pipe(concat('app.min.js'))
            //.pipe(uglify())
            .pipe(gulp.dest(front_path + 'javascript'));
    });
});

gulp.task('default', ['sass', 'alib-js', 'app-js', 'login']);
