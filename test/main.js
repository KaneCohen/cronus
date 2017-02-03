require.config({
  paths: {
    lang: '../lang/ru',
    cronus: '../lib/cronus',
    qunit: 'vendor/qunit'
  },
  shim: {
    qunit: {
      exports: 'QUnit',
      init: function() {
        QUnit.config.autoload = false;
        QUnit.config.autostart = false;
      }
    }
  }
});

require(['qunit', 'tests'], function(QUnit, tests) {
  tests.run();
  QUnit.load();
  QUnit.start();
});
