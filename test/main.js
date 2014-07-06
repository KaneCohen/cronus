require.config({
	paths: {
		charon: '../lib/charon.min',
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
