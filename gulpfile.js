var gulp = require('gulp'),
    uglify = require('gulp-uglifyjs'),
    nodeunit = require('gulp-nodeunit-runner'),
    fs = require('fs');

gulp.task('test', function() {
  gulp.src('./test/cronus/tests.js')
    .pipe(nodeunit());
});

gulp.task('uglify', function() {
  try {
    fs.unlinkSync('./lib/cronus.min.js');
  } catch(err) { }

  gulp.src('./lib/cronus.js')
    .pipe(uglify('cronus.min.js', {
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
