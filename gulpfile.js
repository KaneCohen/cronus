var gulp = require('gulp'),
    uglify = require('gulp-uglifyjs'),
    nodeunit = require('gulp-nodeunit-runner'),
    jshint = require('gulp-jshint'),
    fs = require('fs');

gulp.task('test', function() {
  gulp.src('./test/charon/tests.js')
    .pipe(nodeunit());
});

gulp.task('uglify', function() {
  try {
    fs.unlinkSync('./lib/charon.min.js');
  } catch(err) { }

  gulp.src('./lib/charon.js')
    .pipe(uglify('charon.min.js', {
      mangle: true,
      compress: {
        dead_code: false
      },
      output: {
        ascii_only: true,
        comments: /^!|@preserve|@license|@cc_on/i
      },
      report: 'min',
    }))
    .pipe(gulp.dest('./lib/'));
});

gulp.task('lint', function() {
  return gulp.src('./lib/charon.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});
