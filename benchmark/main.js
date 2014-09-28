require.config({
  paths: {
    charon: '../lib/charon',
    moment: 'http://momentjs.com/downloads/moment',
    benchmark: 'vendor/benchmark'
  },
  shim: {
    benchmark: {
      exports: 'Benchmark'
    }
  }
});

require(['charon', 'moment', 'benchmark'], function(charon, moment, Benchmark) {

  function log(message) {
    var el = document.createElement('div');
    el.innerHTML = message;
    document.body.appendChild(el);
  }

  function runTests(tests, k) {
    k || (k = 0);
    if (tests[k]) {
      runTest(tests[k], function() {
        if (k < tests.length) {
          log('------');
          runTests(tests, k+1);
        }
      });
    }
  }

  function runTest(test, next) {
    test(next);
  }

  var tests = [];

  tests.push(function(next) {
    var suite = new Benchmark.Suite();
    suite.add('Charon#format', function() {
      var d = new charon().format('{YYYY}-{MM}-{DD}');
    })
    .add('Moment#format', function() {
      var d = new moment().format('YYYY-MM-DD');
    })
    .on('cycle', function(e) {
      log(String(e.target));
    })
    .on('complete', function() {
      log('Fastest is ' + this.filter('fastest').pluck('name'));
      next();
    })
    .run({'async': true});
  });


  tests.push(function(next) {
    var suite = new Benchmark.Suite();
    suite.add('Charon#basicParsing', function() {
      var d = new charon('1991-08-25');
    })
    .add('Moment#basicParsing', function() {
      var d = new moment('1991-08-25');
    })
    .on('cycle', function(e) {
      log(String(e.target));
    })
    .on('complete', function() {
      log('Fastest is ' + this.filter('fastest').pluck('name'));
      next();
    })
    .run({'async': true});
  });


  tests.push(function(next) {
    var suite = new Benchmark.Suite();
    suite.add('Charon#parsingISO', function() {
      var d = new charon('1991-08-25 12:02:04');
    })
    .add('Moment#parsingISO', function() {
      var d = new moment('1991-08-25 12:02:04');
    })
    .on('cycle', function(e) {
      log(String(e.target));
    })
    .on('complete', function() {
      log('Fastest is ' + this.filter('fastest').pluck('name'));
      next();
    })
    .run({'async': true});
  });


  tests.push(function(next) {
    var suite = new Benchmark.Suite();
    suite.add('Charon#parsingISOTZ', function() {
      var d = new charon('1991-08-25 12:02:04+01:00');
    })
    .add('Moment#parsingISOTX', function() {
      var d = new moment('1991-08-25 12:02:04+01:00');
    })
    .on('cycle', function(e) {
      log(String(e.target));
    })
    .on('complete', function() {
      log('Fastest is ' + this.filter('fastest').pluck('name'));
      next();
    })
    .run({'async': true});
  });


  tests.push(function(next) {
    var suite = new Benchmark.Suite();
    suite.add('Charon#add', function() {
      var d = new charon('1991-08-25 12:02:04+01:00').add(5, 'days');
    })
    .add('Moment#add', function() {
      var d = new moment('1991-08-25 12:02:04+01:00').add(5, 'days');
    })
    .on('cycle', function(e) {
      log(String(e.target));
    })
    .on('complete', function() {
      log('Fastest is ' + this.filter('fastest').pluck('name'));
      next();
    })
    .run({'async': true});
  });

  runTests(tests);

});
