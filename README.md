Charon
======

Javascript Date manipulation and parsing module.

Simplistic, tiny (~5KB gzip) and rather fast library inspired by moment.js and Carbon (PHP).
Can be used both as a node.js module and require.js module.

How to use
======

````js
define('app', ['charon'], function(charon) {

	// Creates new instance of charon with date set to crrent moment.
	var date = new charon();

	// Parsing will create new instance with set date and time.
	// In this case 12th of May, 2014 at current time (not at the beginning of the day).
	var dateP = new charon('2014-05-12 12:05:45');

	// Add one day to the instance turning it into '2014-05-13 12:05:45'.
	dateP.add(1, 'day');

	// Subtract 2 days turning it into '2014-05-11 12:05:45'.
	dateP.sub(2, 'day');
	// OR
	// dateP.sub(2, 'days');
	// OR
	// dateP.sub(2, 'days');

	// Set date to tomorrow - time will be set to the beginning of the day:
	// turning it into '2014-05-12 00:00:00'.
	dateP.tomorrow();
});
````

Format
======

Formatting charon date instance into the human-readable form.
You can either use `format` method without any arguments which will return
date in an ISO format or you can specify your own format.

````js

var date = new charon();
date.format(); // Will return date in an ISO format: '2014-03-12T15:12:22-08:00'.

date.format('{YYYY}-{MM}-{DD}'); // Specify your own format. Will return '2014-03-12'.
````

List of special symbols convertable with format:
* `S` milliseconds
* `SS` milliseconds with leading zeroes
* `s` seconds
* `ss` seconds with leading zero
* `m`  minutes
* `mm` minutes with leading zero
* `H` hours in AM/PM format
* `HH` hours in AM/PM format with leading zero
* `h` hours in 00-23 format
* `hh` hours in 00-23 format with leading zero
* `a` lower case form of meridiem (AM/PM)
* `A` meridiem in upper case format
* `D` day of month
* `DD` day of month with leading zero
* `DDD` day of year,
* `DDDD` day of year with leading zero
* `M` month - number starting from 1 to 12
* `MM` month number with leading zero 01 to 12
* `MMM` short name of the month
* `MMMM` long name of the month
* `w` day of week
* `ww` day of week with leading zero
* `www` short name of the weekday
* `wwww` long name of the weekday
* `W` week number in the year from 1 to 52 with locale dependancy
* `WW` week number in the year from 01 to 52
* `WWW` week number in the year from 1 to 52 without locate dependency
* `WWWW` week number in the year with leading zero from 01 to 52 without locate dependency
* `Y` short form of the year - 1995 = 95, 2014 = 14
* `YY` same as above
* `YYYY` full year
* `Z` timezone in a format +01:00 or -08:00
* `ZZ` timezone in a format +0100 -0800

Using list of symbols above, create formats like:

`{D} of {MMMM}, {YYYY}`  
`{DD} {MMMM}, {YYYY} - {HH}:{mm}`  
`{DD} {MMMM}, {YYYY} - {HH}:{mm} {Z}`  

Default ISO-8601 format for dates looks like that:
`{YYYY}-{MM}-{DD}T{hh}:{mm}:{ss}{Z}`

Formatting symols should always be wrapped in `{}`. Anything outside will be
treated as normal text and won't be formatted.

UTC Mode
======

Charon has a very useful feature when working with multiple timezones - UTC mode.
When this mode is enabled, current datetime object will be altered
to show UTC time without any timezone modifications.

Usually, UTC mode is used whenever you need to return correct datestring with `format`

````js
// Turn new instance into UTC date.
var date = new charon().utc();
// OR
var date = charon.utc();
// OR
var date = charon.utc('2014-05-13 12:05:45');

// To convert current UTC date to the current local time use `local`
date.local();
````

Diff
======

You can calculate difference between two dates in various units.

````js
var date1 = new charon();
var date2 = new charon().sub(5, 'days');

// Will return difference in milliseconds.
var diff = date1.diff(date2);

// Get difference in seconds.
var diffS = date1.diff(date2, 'seconds'); // Yuo can also use unit aliases such as 's' or 'second'

// Get difference in hours.
var diffH = date1.diff(date2, 'hours'); // Yuo can also use unit aliases such as 'h' or 'hour'
````

Besides getting difference in one unit type only, you can ask charon to return
an object containing all differences.

````js
var date1 = new charon();
var date2 = new charon().sub(5, 'days');

var diff = date1.diff(date2, 'all');
// That will return following object:
/**
	{
		// Object with rounded absolutely formatted numbers.
		relative: {
			S: 432000000, // Milliseconds
			s: 432000,    // Seconds
			m: 7200,      // Minutes
			h: 120,       // Hours
			d: 5,         // days
			M: 0,         // Months
			y: 0          // Years
		},
		// Strict difference be it posizive or negative numbers.
		strict: {
			S: 432000000,
			s: 432000,
			m: 7200,
			h: 120,
			d: 5,
			M: 0.16666...,
			y: 0.01369...
		}
	}
*/
````
