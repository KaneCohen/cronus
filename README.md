Charon
======

Javascript Date manipulation and parsing module.

Simplistic, tiny (3.9KB gzip) and rather fast library inspired by moment.js.
Can be used both as a node.js module and require.js module.

How to use
======

````js
defind('app', ['charon'], function(charon) {

	// Creates new instance of charon with date set to crrent moment.
	var date = new charon();

	// Parsing will create new instance with set date and time.
	// In this case 12th of May, 2014 at current time (not at the beginning of the day).
	var dateP = new charon('2014-05-12');

});

````
