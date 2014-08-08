/**
 * Simple javascript Date manipulation, parsing and printing library.
 * version 0.2.0
 * Kane Cohen [KaneCohen@gmail.com] | https://github.com/KaneCohen
 * @preserve
 */
(function(undefined) {

	'use strict';

	var hasModule = (typeof module !== 'undefined' && module.exports),
			localOffset = (new Date()).getTimezoneOffset()*60*1000,
	    i,
	    msFactor = {
	     	millisecond: 1,
	     	second: 1e3,
	     	minute: 6e4,
	     	hour:   36e5,
	     	day:    864e5,
	     	week:   6048e5,
	     	month:  2592e6,
	     	year:   31536e6
	    },
	    unitAliases = {
	    	ms: 'millisecond',
	    	milliseconds: 'millisecond',
	    	seconds: 'second',
	    	s:  'second',
	    	minutes: 'minute',
	    	m:  'minute',
	    	hours: 'hour',
	    	h:  'hour',
	    	days: 'day',
	    	d:  'day',
	    	weeks: 'week',
	    	w:  'week',
	    	months: 'month',
	    	M:  'month',
	    	years: 'year',
	    	y: 'year',
	    	Y:  'year'
	    },
			defaults = {
	    	_d:   null, // Main holder of our Date object.
	    	_utcMode: false,
	    	_maxDiff: 2592000, // At which point stop using ago and use formatting. 30 days.
	    	_offset: localOffset,
	    	_lang: 'en'
	    },
			// Default language object.
			languages = {
	    	en: {
	    		relativeTime: {
	    			prefixAgo: null,
	    			prefixFromNow: null,
	    			suffixAgo: 'ago',
	    			suffixFromNow: 'from now',
	    			seconds: 'just now',
	    			minute: '{prefix} [a minute] {suffix}',
	    			minutes: '{prefix} {diff} [minutes] {suffix}',
	    			hour: '{prefix} [an hour] {suffix}',
	    			hours: '{prefix} {diff} [hours] {suffix}',
	    			day: '{prefix} [a day] {suffix}',
	    			days: '{prefix} {diff} [days] {suffix}',
	    			month: '{prefix} [a month] {suffix}',
	    			months: '{prefix} [months] {diff}',
	    			year: '{prefix} [a year] {suffix}',
	    			years: '{prefix} {diff} [years] {suffix}',
	    			wordDelimiter: ' ',
	    			format: function(now, then) {
	    				if (now.year() === then.year()) {
	    					return '{D} {MMMM}';
	    				} else {
	    					return '{D} {MMMM} {YYYY}';
	    				}
	    			}
	    		},

	    		pluralizer: function(number) {
	    			return number == 1 ? 0 : 1;
	    		},

	    		calendar: {
	    			sameElse: '{D} {MMMM} {YYYY}',
	    			sameDay: 'Today at {hh}:{mm}',
	    			nextDay: 'Tomorrow at {hh}:{mm}',
	    			nextWeek: '{wwww} at {hh}:{mm}',
	    			lastDay: 'Yesterday at {hh}:{mm}',
	    			lastWeek: 'Last {wwww} at {hh}:{mm}'
	    		},

	    		week: {
	    			weekStart: 0, // First day of the week. 0 - Sunday in USA. Set to 1 for Monday.
	    			yearStart: 4  // First thursday of the year indicates first week of the year.
	    		},

	    		weekdays: function(day, format, brief) {
	    			brief || (brief = false);
	    			var weekdays = {
	    				nominative: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Satruday', 'Sunday'],
	    				brief: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
	    			};
	    			if (brief) {
	    				return weekdays.brief[day];
	    			}
	    			return weekdays.nominative[day];
	    		},

	    		months: function(month, format, brief) {
	    			brief || (brief = false);
	    			var months = {
	    				nominative: [null, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	    				brief: [null, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
	    			};
	    			if (brief) {
	    				return months.brief[month];
	    			}
	    			return months.nominative[month];
	    		}
	    	}
	    },
	    parseUnits = {
	    	S: 'Milliseconds', s: 'Seconds',
	    	m: 'Minutes',
	    	H: 'Hours', h: 'Hours',
	    	D: 'Date',
	    	M: 'Month',
	    	Y: 'FullYear',
	    	Z: 'Timezone'
	    },
	    formatRegex = /{(\w+)}/gi,
	    // ISO 8601 regex.
	    // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
	    isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
	    isoFormats = {
	    	dates: [
	    			['{YYYY}-{MM}-{DD}', /\d{4}-\d{2}-\d{2}/],
	    			['{YYYY}-{DDD}', /\d{4}-\d{3}/]
	    	],
	    	times: [
	    			['{HH}:{mm}:{ss}', /(T| )\d\d:\d\d:\d\d/],
	    			['{HH}:{mm}', /(T| )\d\d:\d\d/],
	    			['{HH}', /(T| )\d\d/]
	    	]
	    },
	    timezoneRegex = /Z|[\+\-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z
	    timezoneSplitRegex = /([\+\-]|\d\d)/gi,
	    wordToken = "[0-9]*['a-z\\u00A0-\\u05FF\\u0700-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]+|[\\u0600-\\u06FF\\/]+(\\s*?[\\u0600-\\u06FF]+){1,2}",
	    regexMap = {
	    	S: /\d{1,3}/,
	    	SS: /\d{3}/,
	    	s: /\d{1,2}/,
	    	ss: /\d{2}/,
	    	m: /\d{1,2}/,
	    	mm: /\d{2}/,
	    	H: /\d{1,2}/,
	    	HH: /\d{2}/,
	    	h: /\d{1,2}/,
	    	hh: /\d{2}/,
	    	a: /am|pm/,
	    	A: /AM|PM/,
	    	D: /\d{1,2}/,
	    	DD: /\d{2}/,
	    	DDD: /\d{1,3}/,
	    	DDDD: /\d{3}/,
	    	M: /\d{1,2}/,
	    	MM: /\d{2}/,
	    	MMM: /\w{2}/,
	    	MMMM: wordToken,
	    	w: /\d{1}/,
	    	ww: /\d{2}/,
	    	www: wordToken,
	    	wwww: wordToken,
	    	W: /\d{1,2}/,
	    	WW: /\d{2}/,
	    	WWW: /\d{1,2}/,
	    	WWWW: /\d{2}/,
	    	Y: /\d{2}/,
	    	YY: /\d{2}/,
	    	YYYY: /\d{4}/,
	    	Z: /Z|[\+\-]\d\d:?\d\d/,
	    	ZZ: /Z|[\+\-]\d\d:?\d\d/
	    };


	function trim(string) {
		return string.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '');
	}

	function extend(target, source) {
		for(var key in source) {
			if(source.hasOwnProperty(key)) {
				target[key] = source[key];
			}
		}
		return target;
	}

	function absRound(v) {
		return Math.abs(Math.round(v));
	}

	function pad(value, length, character) {
		var output = String(value);
		if (typeof character === 'undefined') {
			character = '0';
		}
		while (output.length < length) {
			output = character + output;
		}
		return output;
	}

	function padRight(value, length, character) {
		var output = String(value);
		if (typeof character === 'undefined') {
			character = '0';
		}
		while (output.length < length) {
			output = output + character;
		}
		return output;
	}

	function resetTime(date) {
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		return date;
	}

	function getWeek(crn, date, absolute) {
		var yearStart, week, day;
		absolute || (absolute = false);
		date = new Date(date);
		if (crn._utcMode) {
			date.setMilliseconds(localOffset);
		}
		date.setHours(0,0,0);
		day = crn.lang().week.weekStart === 0 ? date.getDay() : date.getDay() || 7;
		// Set to correct yearStart. Thursday for US.
		if (absolute) {
			yearStart = new Date(date.getFullYear(), 0, 1);
			date.setDate(date.getDate() + crn.lang().week.yearStart - day);
			week = Math.floor((date-yearStart+1) / 6048e5);
		} else {
			date.setDate(date.getDate() + crn.lang().week.yearStart - day);
			yearStart = new Date(date.getFullYear(), 0, 1);
			week = Math.ceil((date-yearStart+1) / 6048e5);
		}
		return week;
	}

	function getWeekday(crn, date) {
		if (crn._utcMode) {
			date.setMilliseconds(localOffset);
		}
		return (date.getDay() + 7 - crn.lang().week.weekStart) % 7;
	}

	function getDayOfYear(crn, date) {
		date = new Date(date);
		if (crn._utcMode) {
			date.setMilliseconds(localOffset);
		}
		var day = date.getDate();
		var year = date.getFullYear();
		// Set first day and the last day.
		var fd = new Date(year, 0, 1, 12, 0, 0),
				ld = new Date(year, date.getMonth(), day, 12, 0, 0);
		return Math.round((ld - fd) / 864e5) + 1;
	}

	function getDaysInMonth(month, year) {
		return new Date(year, month, 0).getDate();
	}

	function parseDateInput(crn, input, format) {
		if (input instanceof Date) {
			return new Date(input);
		} else if (input instanceof Charon) {
			return new Date(input.toDate());
		} else if (typeof input === 'string') {
			return parseDateString(crn, input, format);
		} else if (typeof input === 'number') {
			return new Date(input);
		} else if (Array.isArray(input)) {
			return parseDateArray(crn, input, format);
		} else {
			return new Date();
		}
	}

	function mapFormat(format) {
		var matches = format.match(formatRegex);
		var map = {format: [], regex: [], groups: []};
		if (matches) {
			matches.forEach(function(tag, k) {
				tag = /\w+/.exec(tag)[0];
				map.format[k] = tag;
				map.regex[k] = regexMap[tag];
				map.groups[k] = parseUnits[tag[0]] || null;
			});
		}
		return map;
	}

	function parseISO(crn, string) {
		var matches = isoRegex.exec(string), format = '', l = matches.length;

		if (matches[0]) {
			for (i = 0, l = isoFormats.dates.length; i < l; i++) {
				if (isoFormats.dates[i][1].exec(string)) {
					format = isoFormats.dates[i][0] + (matches[6] || ' ');
					break;
				}
			}
			for (i = 0, l = isoFormats.times.length; i < l; i++) {
				if (isoFormats.times[i][1].exec(string)) {
					format += isoFormats.times[i][0];
					break;
				}
			}
		}
		if (string.match(timezoneRegex)) {
			format += '{Z}';
		}
		return parseDateFormat(crn, string, format);
	}

	function parseDateFormat(crn, string, format) {
		var map = mapFormat(format);
		return applyFormatMap(crn, string, map);
	}

	function applyFormatMap(crn, string, map) {
		var position = 0,
		    offset = null,
		    date = new Date(),
		    remainder,
		    method,
		    value,
		    rm,
		    om,
		    k;

		if (! map.format) return null;

		// Start with 00:00:00 time.
		resetTime(date);

		for (k in map.format) {
			remainder = string.substr(position);
			rm = remainder.match(map.regex[k]);
			if (rm) {
				value = rm[0];
				method = 'set'+map.groups[k];
				position += remainder.indexOf(value) + String(value).length;
				if (method == 'setTimezone') {
					om = value.match(timezoneSplitRegex);
					offset = (om[1] * 60 * 60) + (om[2] * 60);
					offset = om[0] == '-' ? -offset : offset;
					// Compare user offset and date offset.
				} else {
					if (method == 'setMonth') {
						// Months start from 0, so we have to decrease it.
						value--;
					}
					date[method](value);
				}
			}
		}
		if (offset !== null) {
			return new Date(date.getTime() - (localOffset + (offset*60*1000)));
		} else if (crn._utcMode) {
			// If no offset and we are in utc mode, compensate.
			return new Date(date.getTime() - localOffset);
		}
		return date;
	}

	function parseDateString(crn, string, format) {
		// If format not set, try most often used formats.
		if (typeof format === 'undefined') {
			return parseISO(crn, string);
		}
		return parseDateFormat(crn, string, format);
	}

	function parseDateArray(crn, arr) {
		var d = [0, 0, 0, 0, 0, 0, 0];
		d = d.map(function(v, k) { return arr[k] || v; });
		var date = new Date(d[0], d[1], d[2], d[3], d[4], d[5], d[6]);
		if (crn._utcMode) {
			return new Date(date.getTime() - localOffset);
		}
		return date;
	}

	function Charon(input, format) {
		extend(this, defaults);
		this._d = parseDateInput(this, input, format);
	}

	Charon.prototype = {

		// Time from Charon.date relative to now.
		// If "then" is set, current Charon instance will be compared to "then".
		fromNow: function(then, format) {
			if (typeof then === 'undefined') {
				then = new Charon();
			} else {
				then = new Charon(then);
			}
			var diff = this.diff(then, 'all');
			var r = diff.relative;
			var l = this.lang().relativeTime;
			var negative = diff.strict.s < 0 ? true : false;
			if (r.s < this._maxDiff) {
				return r.s < 45 && this.humanize(l.seconds, r.s, negative) ||
					r.s < 90 && this.humanize(l.minute, 1, negative) ||
					r.m < 45 && this.humanize(l.minutes, r.m, negative) ||
					r.m < 90 && this.humanize(l.hour, 1, negative) ||
					r.h < 24 && this.humanize(l.hours, r.h, negative) ||
					r.h < 42 && this.humanize(l.day, 1, negative) ||
					r.d < 31 && this.humanize(l.days, r.d, negative) ||
					r.M < 12 && this.humanize(l.months, r.m, negative) ||
					r.y < 1.5 && this.humanize(l.year, r.y, negative) ||
					r.y > 1.5 && this.humanize(l.years, r.y, negative) ||
					this.humanize(l.years, r.y, negative);
			} else {
				format || (format = l.format);
				if (typeof format === 'function') {
					format = format(this, then);
				}
				return this.format(format);
			}
		},

		// Ger difference between two dates in units.
		diff: function(date, units, absolute) {
			units || (units);
			units = unitAliases[units] || units;
			if (typeof absolute === 'undefined') absolute = true;

			var then = parseDateInput(this, date);
			var output;
			var S = (this._d.getTime() - then.getTime()),
			    s = S / 1000,
			    m = s / 60,
			    h = m / 60,
			    d = h / 24,
			    M = d / 30,
			    y = d / 365;
			switch (units) {
				case 'second':
					output = s;
					break;
				case 'minute':
					output = m;
					break;
				case 'hour':
					output = h;
					break;
				case 'day':
					output = d;
					break;
				case 'month':
					output = M;
					break;
				case 'year':
					output = y;
					break;
				case 'all':
					return {
						relative: {
							S: absRound(S),
							s: absRound(s),
							m: absRound(m),
							h: absRound(h),
							d: absRound(d),
							M: absRound(M),
							y: absRound(y)
						},
						strict: {
							S: S,
							s: s,
							m: m,
							h: h,
							d: d,
							M: M,
							y: y
						}
					};
				default:
					output = S;
					break;
			}
			return absolute ? Math.abs(Math.round(output)) : output;
		},

		humanize: function(string, n, negative) {
			var l = this.lang().relativeTime;

			string = this.choice(string, n);

			var prefix = negative ? l.prefixAgo : l.prefixFromNow;
			var suffix = negative ? l.suffixAgo : l.suffixFromNow;
			var replacement = this.format(string.replace(/{diff}/i, n).replace(/{prefix}/i, prefix || '').replace(/{suffix}/i, suffix || ''));
			return trim(replacement);
		},

		// If needed with locle, pick singular|plural varian.
		// Put choice in square brackets: [second|seconds].
		choice: function(string, n) {
			var matches = string.match(/\[(.+)\]/);
			if (! matches) {
				return string;
			}
			var words = matches[1].split('|');
			var word = words.length > 1 ? words[this.lang().pluralizer(n)] : words[0];
			string = string.replace(matches[0], word);
			return string;
		},

		// Format is following ISO-8601 standart description.
		format: function(format) {
			format || (format = '{YYYY}-{MM}-{DD}T{hh}:{mm}:{ss}{Z}');
			var self = this,
			    output = format,
			    d = this._d;

			var l = this.lang();
			var matches = format.match(formatRegex);
			if (matches) {
				if (this._utcMode) {
					// Use date clone only when we are in utcMode.
			    d = new Date(this._d);
					d.setMilliseconds(localOffset);
				}
				matches.forEach(function(tag) {
					var v = /\w+/.exec(tag)[0], pre, past, tz;
					if (v[0] === 'Z') {
						var offset = self._utcMode ? 0 : d.getTimezoneOffset();
						tz = offset > 0 ? '-' : '+';
						tz += Math.abs(offset) < 6000 ? '0' : '';
						tz = padRight(tz + Math.abs(offset/60), 5);
					}
					var o;
					switch(v) {
						case 'S':
							o = d.getMilliseconds() / 10;
							break;
						case 'SS':
							o = d.getMilliseconds() / 100;
							break;
						case 'SSS':
							o = d.getMilliseconds();
							break;
						case 's':
						case 'ss':
							o = d.getSeconds();
							break;
						case 'm':
						case 'mm':
							o = d.getMinutes();
							break;
						case 'H':
						case 'HH':
							var hours = d.getHours();
							var hoursAMPM = hours > 11 ? hours%12 : hours;
							o = String(hoursAMPM === 0 ? 12 : hoursAMPM);
							break;
						case 'h':
						case 'hh':
							o = d.getHours();
							break;
						case 'a':
							o = d.getHours() > 11 ? 'pm' : 'am';
							break;
						case 'A':
							o = d.getHours() > 11 ? 'PM' : 'AM';
							break;
						case 'D':
						case 'DD':
							o = String(d.getDate());
							break;
						case 'DDD':
						case 'DDDD':
							o = String(self.dayOfYear());
							break;
						case 'M':
						case 'MM':
							o = String(d.getMonth()+1);
							break;
						case 'MMM':
							o = l.months(d.getMonth()+1, format, true);
							break;
						case 'MMMM':
							o = l.months(d.getMonth()+1, format);
							break;
						case 'w':
						case 'ww':
							o = getWeekday(self, d);
							break;
						case 'www':
							o = l.weekdays(getWeekday(self, d), format, true);
							break;
						case 'wwww':
							o = l.weekdays(getWeekday(self, d), format);
							break;
						case 'W':
						case 'WW':
							o = String(getWeek(self, d));
							break;
						case 'WWW':
						case 'WWWW':
							o = String(getWeek(self, d, true));
							break;
						case 'Y':
						case 'YY':
							o = String(d.getFullYear()).substring(2);
							break;
						case 'YYYY':
							o = String(d.getFullYear());
							break;
						case 'Z':
							o = [tz.slice(0,3), ':', tz.slice(3)].join('');
							break;
						case 'ZZ':
							o = tz;
							break;
					}
					// Apply padding.
					switch(v) {
						case 'SS':
						case 'DDDD':
							o = pad(o, 3);
							break;
						case 'ss':
						case 'mm':
						case 'HH':
						case 'hh':
						case 'DD':
						case 'MM':
						case 'ww':
						case 'WW':
						case 'WWW':
							o = pad(o, 2);
							break;
					}

					if (typeof format === 'function') {
						format = format(o) || format;
					}
					if (typeof format === 'string') {
						pre = output.slice(0, output.indexOf(tag));
						past = output.slice(output.indexOf(tag) + tag.length);
						output = pre + o + past;
					}
				});
			}
			return output;
		},

		calendar: function() {
			var diff = this.diff(new Charon().startOf('day'), 'days', false),
				format = diff < -6 ? 'sameElse' :
				diff < -1 ? 'lastWeek' :
				diff < 0 ? 'lastDay' :
				diff < 1 ? 'sameDay' :
				diff < 2 ? 'nextDay' :
				diff < 7 ? 'nextWeek' : 'sameElse';
			return this.format(this.lang().calendar[format]);
		},

		startOf: function(units) {
			switch (units) {
				case 'year':
					this._d.setMonth(0);
					// Fall through.
				case 'month':
					this._d.setDate(1);
					// Fall through.
				case 'week':
					this.weekday(0);
					// Fall through.
				case 'day':
					this._d.setHours(0);
					// Fall through.
				case 'hour':
					this._d.setMinutes(0);
					// Fall through.
				case 'minute':
					this._d.setSeconds(0);
					// Fall through.
				case 'second':
					this._d.setMilliseconds(0);
					break;
				default:
					break;
			}
			return this;
		},

		endOf: function(units) {
			return this.startOf(units).add(1, units).sub(1, 'ms');
		},

		add: function(amount, units) {
			this._d.setMilliseconds(this._d.getMilliseconds() + this.duration(amount, units));
			return this;
		},

		sub: function(amount, units) {
			this._d.setMilliseconds(this._d.getMilliseconds() - this.duration(amount, units));
			return this;
		},

		duration: function(amount, units) {
			units || (units = 'ms');
			return amount * (msFactor[units] || msFactor[unitAliases[units]]);
		},

		isValid: function() {
			return !! this._d;
		},

		// Parse given input with default formats or with a given format.
		parse: function(input, format) {
			this._d = parseDateInput(this, input, format);
			return this;
		},

		get: function(units) {
			units || (units = 'ms');
			units = unitAliases[units] || units;
			var _d = new Date(this._d);
			if (this._utcMode && units !== 'time') {
				_d.setMilliseconds(localOffset);
			}
			switch (units) {
				case 'millisecond':
					return _d.getMilliseconds();
				case 'second':
					return _d.getSeconds();
				case 'minute':
					return _d.getMinutes();
				case 'hour':
					return _d.getHours();
				case 'day':
					return _d.getDay();
				case 'date':
					return _d.getDate();
				case 'month':
					return _d.getMonth();
				case 'year':
					return _d.getFullYear();
				default:
					return _d.getTime();
			}
			return _d.getTime();
		},

		set: function(units, amount) {
			switch (units) {
				case 'millisecond':
					return this.milliseconds(amount);
				case 'second':
					return this.seconds(amount);
				case 'minute':
					return this.minutes(amount);
				case 'hour':
					return this.hours(amount);
				case 'date':
					return this.date(amount);
				case 'month':
					return this.month(amount);
				case 'year':
					return this.year(amount);
			}
			return this;
		},

		// Refresh instance to current moment.
		now: function() {
			this._d = new Date();
			return this;
		},

		// Get or set javascript timestamp.
		timestamp: function(input) {
			var timestamp = this.get('time');
			return input == null ? timestamp : this.add(input - timestamp, 'ms');
		},

		// Get or set time via unix timestamp.
		unix: function(input) {
			return input == null ? Math.floor(this.timestamp() / 1000) : this.timestamp(input * 1000);
		},

		milliseconds: function(input) {
			var ms = this.get('ms');
			return input == null ? ms : this.add(input - ms, 'ms');
		},

		ms: function(input) {
			return this.milliseconds(input);
		},

		seconds: function(input) {
			var seconds = this.get('s');
			return input == null ? seconds : this.add(input - seconds, 's');
		},

		minutes: function(input) {
			var minutes = this.get('m');
			return input == null ? minutes : this.add(input - minutes, 'm');
		},

		hours: function(input) {
			var hours = this.get('hours');
			return input == null ? hours : this.add(input - hours, 'h');
		},

		// Get or set day of week.
		day: function(input) {
			var day = this.get('day');
			return input == null ? day : this.add(input - day, 'd');
		},

		// Get or set day of month. If date exceeds current month number of days
		// it'll propagate to the next month.
		date: function(input) {
			var date = this.get('date');
			if (input == null) {
				return date;
			} else {
				var daysInMonth = Math.min(this.date(), getDaysInMonth(this.year(), input));
				var diff = daysInMonth - date;
				diff >= 0 ? this._d.setDate(input) : this.endOf('month').add(diff, 'd');
				return this;
			}
		},

		// Get or set week. Day of the week and time stays the same.
		week: function(input, absolute) {
			var week = getWeek(this, this._d, absolute);
			return input == null ? week : this.add((input - week) * 7, 'd');
		},

		// Get or set day of the week. Uses locaale settings.
		weekday: function(input) {
			var weekday = getWeekday(this, this._d);
			return input == null ? weekday : this.add(input - weekday, 'd');
		},

		// Get or set day of the week in the ISO format. 1 is Monday, 7 is Sunday.
		isoWeekday: function(input) {
			// If Sunday, change to 7.
			// If using to set day, then sunday should belong to the last week.
			return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
		},

		// Get or set day of the year.
		dayOfYear: function(input) {
			var day = getDayOfYear(this, this._d);
			return input == null ? day : this.add(input - day, 'd');
		},

		// Get or set month.
		month: function(input) {
			if (input == null) {
				return this.get('month');
			} else {
				// Pick last day of month if current day is larger.
				var dayOfMonth = Math.min(this.date(), getDaysInMonth(this.year(), input));
				this._d.setMonth(input, dayOfMonth);
				return this;
			}
		},

		year: function(input) {
			var year = this.get('year');
			return input == null ? year : this.add(input - year, 'y');
		},

		toDate: function() {
			return this._d;
		},

		yesterday: function() {
			return this.sub(1, 'd').startOf('day');
		},

		today: function() {
			return this.startOf('day');
		},

		tomorrow: function() {
			return this.add(1, 'd').startOf('day');
		},

		utc: function() {
			this._utcMode = true;
			return this;
		},

		isUTC: function() {
			return this._utcMode;
		},

		local: function() {
			this._utcMode = false;
			return this;
		},

		clone: function() {
			return new Charon(this._d);
		},

		lang: function(key, object) {
			if (key && languages[key]) {
				this._lang = key;
				return languages[key];
			} else if (key && ! languages[key] && object) {
				this._lang = key;
				languages[key] = object;
			} else {
				return languages[this._lang] || languages.en;
			}
		}

	};

	extend(Charon, {
		now: function() {
			return new Charon();
		},

		unix: function(timestamp) {
			return new Charon(timestamp * 1000);
		},

		yesterday: function() {
			return new Charon().yesterday();
		},

		today: function() {
			return new Charon().today();
		},

		tomorrow: function() {
			return new Charon().tomorrow();
		},

		utc: function(input, format) {
			return new Charon().utc().parse(input, format);
		},

		lang: function(key, language) {
			if (! languages[key] && language) {
				// Set new language if it's not cached and we provided language object.
				languages[key] = language;
				defaults._lang = key;
			} else if (! languages[key] && ! language) {
				// Try to load new language wit
				try {
					require('../lang/' + key);
				} catch (err) { }
			} else {
				defaults._lang = key;
			}
			return defaults._lang;
		}
	});

	// CommonJS module is defined.
	if (hasModule) {
		module.exports = Charon;
	} else if (typeof define === 'function' && define.amd) {
		define('charon', function() {
			return Charon;
		});
	}

}).call(this);
