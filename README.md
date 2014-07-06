Charon
======

Javascript Date manipulation and parsing module.

Simplistic, tiny (3.9KB gzip) and rather fast library inspired by moment.js and Carbon.
Can be used both as a node.js module and require.js module.

How to use
======

````js
defind('app', ['charon'], function(charon) {

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
// Will return date in an ISO format: '2014-03-12T15:12:22-08:00'.
date.format();

// Or you can specify your own format. Will return '2014-03-12'.
date.format('{YYYY}-{MM}-{DD}');

````

List if special symbols convertable with format:
* S  // milliseconds - 123
* SS // milliseconds with leading zeroes - 008
* s  // seconds
* ss // seconds with leading zero
* m  // minutes,
* mm // minutes with leading zero
* H  // hours in AM/PM format
* HH // hours in AM/PM format with leading zero
* h  // hours in 00-23 format
* hh // hours in 00-23 format with leading zero
* a  // lower case form of meridiem (AM/PM)
* A  // meridiem in upper case format
* D    // day of month
* DD   // day of month with leading zero
* DDD  // day of year,
* DDDD // day of year with leading zero
* M    // month - number starting from 1 to 12
* MM   // month number with leading zero 01 to 12
* MMM  // short name of the month
* MMMM // long name of the month
* w    // day of week
* ww   // day of week with leading zero
* www:  // short name of the weekday
* wwww: // long name of the weekday
* W:    // week number in the year from 1 to 52 with locale dependancy
* WW    // week number in the year from 01 to 52
* WWW   // week number in the year from 1 to 52 without locate dependency
* WWWW  // week number in the year with leading zero from 01 to 52 without locate dependency
* Y     // short form of the year - 1995 = 95, 2014 = 14
* YY    // same as above
* YYYY  // full year
* Z     // timezone in a format +01:00 or -08:00
* ZZ    // timezone in a format +0100 -0800

Using list of symbols above, create formats like:

`{D} of {MMMM}, {YYYY}`
`{DD} {MMMM}, {YYYY} - {HH}:{mm}`
`{DD} {MMMM}, {YYYY} - {HH}:{mm} {Z}`

Default ISO-8601 format for dates looks like that:
`{YYYY}-{MM}-{DD}T{hh}:{mm}:{ss}{Z}`

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
