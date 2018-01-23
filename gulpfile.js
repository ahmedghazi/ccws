var gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  plumber = require('gulp-plumber'),
  livereload = require('gulp-livereload'),
  
  rename        = require('gulp-rename'),
  //autoprefixer  = require('gulp-autoprefixer'),
  //minifycss     = require('gulp-minify-css'),
  concat      = require('gulp-concat'),
  uglify = require('gulp-uglify'),

  sass = require('gulp-ruby-sass');

gulp.task('sass', function () {
  return sass('./public/css/**/*.scss')
    .pipe(gulp.dest('./public/css'))
    .pipe(livereload());
});

gulp.task('scripts', function() {
    gulp.src(['./public/js/*.js'])
      .pipe(concat('functions.js'))
      .pipe(rename({suffix: '.min'}))
      //.pipe(stripDebug())//remove logs
      //.pipe(uglify())
      .pipe(gulp.dest('./public/js'));
});

gulp.task('watch', function() {
  gulp.watch('./public/css/*.scss', ['sass']);
  gulp.watch('./public/js/*.js', ['scripts']);
});

gulp.task('develop', function () {
  livereload.listen();
  nodemon({
    script: 'app.js',
    ext: 'js coffee jade',
    stdout: false
  }).on('readable', function () {
    this.stdout.on('data', function (chunk) {
      if(/^Express server listening on port/.test(chunk)){
        livereload.changed(__dirname);
      }
    });
    this.stdout.pipe(process.stdout);
    this.stderr.pipe(process.stderr);
  });
});

gulp.task('default', [
  'sass',
  'scripts',
  'develop',
  'watch'
]);
