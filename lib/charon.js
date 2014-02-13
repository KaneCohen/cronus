(function(undefined) {

	var hasModule = (typeof module !== 'undefined' && module.exports);

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
		value = new String(value);
		if (character == undefined) {
			character = '0';
		}
		return new Array((length - value.length) + 1).join(character) + value;
	}

	function padRight(value, length, character) {
		value = new String(value);
		if (character == undefined) {
			character = '0';
		}
		return value + (new Array((length - value.length) + 1).join(character));
	}

	function getWeek(crn, date, absolute) {
		var yearStart, week, day;
		absolute || (absolute = false);
		date = new Date(date);
		date.setHours(0,0,0);
		day = crn.lang.week.weekStart === 0 ? date.getDay() : date.getDay() || 7;
		// Set to correct yearStart. Thursday for US.
		if (absolute) {
			yearStart = new Date(date.getFullYear(), 0, 1);
			date.setDate(date.getDate() + crn.lang.week.yearStart - day);
			week = Math.floor((date-yearStart+1) / 6048e5);
		} else {
			date.setDate(date.getDate() + crn.lang.week.yearStart - day);
			yearStart = new Date(date.getFullYear(), 0, 1);
			week = Math.ceil((date-yearStart+1) / 6048e5);
		}
		return week;
	}

	function getWeekday(crn, date) {
		return (date.getDay() + 7 - crn.lang.week.weekStart) % 7;
	}

	function getDayOfYear(crn, date) {
		var day = date.getDate();
		var year = date.getFullYear();
		// Set first day and the last day.
		var fd = new Date(year, 0, 1, 12, 0, 0),
				ld = new Date(year, date.getMonth(), day, 12, 0, 0);
		return Math.round((ld - fd) / 864e5) + 1;
	}

	function parseDateInput(crn, input, format) {
		if (input instanceof Date) {
			return new Date(input);
		} else if (input instanceof charon) {
			return new Date(input.toDate());
		} else if (typeof input === 'string') {
			return parseDateString(crn, input, format);
		} else if (typeof input === 'number') {
			return new Date(input);
		} else {
			return new Date();
		}
	}

	function parseDateString(crn, string, format) {
		var formats,
				date,
				key;
		var units = {
			S: 'Milliseconds', s: 'Seconds',
			m: 'Minutes',
			H: 'Hours', h: 'Hours',
			D: 'Date',
			M: 'Month',
			Y: 'FullYear'
		};
		var regs = {
			Z: '(\\+|-)[0-9:]{4,5}',
			ZZ: '(\\+|-)[0-9:]{4,5}'
		};
		// If format not set, try most often used formats.
		if (typeof format === 'undefined') {
			// Try predefined formats
			formats = [
				'{YYYY}-{MM}-{DD}T{hh}:{mm}:{ss}{ZZ}',
				'{YYYY}-{MM}-{DD}T{hh}:{mm}:{ss}{Z}',
				'{YYYY}-{MM}-{DD}T{hh}:{mm}:{ss}',
				'{YYYY}-{MM}-{DD} {hh}:{mm}:{ss}'
			];

			for (key in formats) {
				date = parseDateString(crn, string, formats[key]);
				if (date) return date;
			}

			// Nothing worked. Try Date parser.
			date = new Date(Date.parse(string));
			if (date) {
				// Compensate for local time. Addition, since new Date already applied offset once.
				return new Date(date.getTime() + (date.getTimezoneOffset()*60*1000));
			}
		}

		date = new Date;
		var matches = format.match(/{\w+}/g),
				position = 0,
				offset = null,
				remainder,
				chars,
				reg,
				tag,
				rm;

		if (! matches) {
			return null;
		}

		for (key in matches) {
			tag = matches[key];
			chars = tag.match(/\w+/)[0];
			remainder = string.substr(position);
			reg = new RegExp(regs[chars] || '\\d+');
			rm = remainder.match(reg);
			if (rm) {
				value = remainder.match(reg)[0];
				position += remainder.indexOf(value)+String(value).length;
				// Deal with timezone.
				if (chars[0] == 'Z') {
					offset = parseInt(value.match(/\d+/g).join(''));
					// Get a proper time based on the string.
					offset = (parseInt(parseInt(offset, 10)/100, 10)*60) + ((parseInt(offset, 10)/100) - (parseInt(parseInt(offset, 10)/100, 10)));
					offset = value[0] == '-' ? -offset : offset;
					// Compare user offset and date offset.
				}
				if (typeof units[chars[0]] !== 'undefined') {
					var method = 'set'+units[chars[0]];
					// Months start from 0, so we have to decrease it.
					if (method == 'setMonth') {
						value--;
					}
					date[method](value);
				}
			} else {
				return null;
			}
		}

		if (offset !== null) {
			return new Date(date.getTime() - ((date.getTimezoneOffset()*60*1000) + (offset*60*1000)));
		} else if (crn.utcMode) {
			// If no offset and we are in utc mode, compensate.
			return new Date(date.getTime() - (date.getTimezoneOffset()*60*1000));
		}
		return date;
	}

	function charon(date, format) {
		this._d = parseDateInput(this, date, format);
		return this;
	}

	charon.prototype = {
		_d:   null, // Main holder of our Date object.
		utcMode: false,

		maxDiff: 2592000, // At which point stop using ago and use formatting. 30 days.

		msfactor: {
			millisecond: 1,
			second: 1e3,
			minute: 6e4,
			hour:   36e5,
			day:    864e5,
			week:   6048e5,
			month:  2592e6,
			year:   31536e6
		},

		unitAliases: {
			ms: 'millisecond',
			s:  'second',
			m:  'minute',
			h:  'hour',
			d:  'day',
			w:  'week',
			M:  'month',
			Y:  'year'
		},

		// Default language object.
		lang: {
			relativeTime: {
				prefixAgo: null,
				prefixFromNow: null,
				suffixAgo: 'ago',
				suffixFromNow: 'from now',
				seconds: 'just now',
				minute: '{prefix} [a minute] {suffix}',
				minutes: '{prefix} {diff} [minutes] {suffix}',
				hour: '{prefix} [hour] {suffix}',
				hours: '{prefix} {diff} [hours] {suffix}',
				day: '{prefix} [a day] {suffix}',
				days: '{prefix} {diff} [days] {suffix}',
				month: '{prefix} [a month] {suffix}',
				months: '{prefix} [months] {diff}',
				year: '{prefix} [a year] {suffix}',
				years: '{prefix} {diff} [years] {suffix}',
				wordDelimiter: ' ',
				format: '{D} {MMMM} {YYYY}'
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
					accusative: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Satruday', 'Sunday'],
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
					accusative: [null, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
					brief: [null, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
				};
				if (brief) {
					return months.brief[month];
				}
				return months.nominative[month];
			}
		},

		// Time from charon.date relative to now.
		// If "then" is set, current charon instance will be compared to "then".
		fromNow: function(then) {
			if (typeof then === 'undefined') {
				then = new Date;
			} else {
				then = parseDateInput(this, then);
			}
			var diff = this.diff(then, 'all');
			var r = diff.relative;
			var l = this.lang.relativeTime;
			var negative = diff.strict.s < 0 ? true : false;
			if (r.s < this.maxDiff) {
				return r.s < 45 && this.humanize(l.seconds, r.s, negative) ||
					r.s < 90 && this.humanize(l.minute, 1, negative) ||
					r.i < 45 && this.humanize(l.minutes, r.i, negative) ||
					r.i < 90 && this.humanize(l.hour, 1, negative) ||
					r.h < 24 && this.humanize(l.hours, r.h, negative) ||
					r.h < 42 && this.humanize(l.day, 1, negative) ||
					r.d < 30 && this.humanize(l.days, r.d, negative) ||
					r.d < 365 && this.humanize(l.year, 1, negative) ||
					r.y < 1.5 && this.humanize(l.years, r.y, negative) ||
					this.humanize(l.years, r.y, negative);
			} else {
				return this.format(l.format);
			}
		},

		// Ger difference between two dates in units.
		diff: function(date, unit, absolute) {
			if (typeof absolute === 'undefined') absolute = true;

			var then = parseDateInput(this, date);
			var diff = (this._d.getTime() - then.getTime()) / 1000;
			var output = diff;
			var s = diff;
			var i = s/60;
			var h = i/60;
			var d = h/24;
			switch (unit) {
				case 'seconds':
					output = s;
					break;
				case 'minutes':
					output = s/60;
					break;
				case 'hours':
					output = i/60;
					break;
				case 'days':
					output = h/24;
					break;
				case 'months':
					output = d/30;
					break;
				case 'years':
					output = d/365;
					break;
				case 'all':
					return {
						relative: {
							s: absRound(diff),
							i: absRound(s/60),
							h: absRound(i/60),
							d: absRound(h/24),
							m: absRound(d/30),
							y: absRound(d/365)
						},
						strict: {
							s: diff,
							i: s/60,
							h: i/60,
							d: h/24,
							m: d/30,
							y: d/365
						}
					};
				default:
					output = s;
					break;
			}
			return absolute ? Math.abs(Math.round(output)) : output;
		},

		humanize: function(string, n, negative) {
			l = this.lang.relativeTime;

			string = this.choice(string, n);

			var prefix = negative ? l.prefixAgo : l.prefixFromNow;
			var suffix = negative ? l.suffixAgo : l.suffixFromNow;
			var replacement = this.format(string.replace(/{diff}/i, n).replace(/{prefix}/i, prefix || '').replace(/{suffix}/i, suffix || ''));
			return replacement.replace(/^\s+|\s+$/g, '');
		},

		// If needed with locle, pick singular|plural varian.
		// Put choice in square brackets: [second|seconds].
		choice: function(string, n) {
			var matches = string.match(/\[(.+)\]/);
			if (! matches) {
				return string;
			}
			var words = matches[1].split('|');
			var word = words.length > 1 ? words[this.lang.pluralizer(n)] : words[0];
			string = string.replace(matches[0], word);
			return string;
		},

		// Format is following ISO-8601 standart description.
		format: function(format, date) {
			format || (format = '{YYYY}-{MM}-{DD}T{hh}:{mm}:{ss}{Z}');
			date || (date = this._d);
			if (this.utcMode) {
				date = new charon(date)
					.add('ms', this._d.getTimezoneOffset() * 60 * 1000)
					.toDate();
			}

			var milliseconds = date.getMilliseconds(),
					seconds   = date.getSeconds(),
					minutes   = date.getMinutes(),
					hours     = date.getHours(),
					weekday   = getWeekday(this, date),
					dayOfYear = String(this.dayOfYear()),
			    day       = String(date.getDate()),
					week      = String(getWeek(this, date)),
					weekFull  = String(getWeek(this, date, true)),
			    month     = String(date.getMonth()+1),
			    year      = String(date.getFullYear()),
					offset    = this.utcMode ? 0 : date.getTimezoneOffset();

			var meridiem = hours > 11 ? 'PM' : 'AM';
			var hoursAMPM = hours > 11 ? '0'+hours%12 : '0'+hours;
			hoursAMPM = String(hoursAMPM === 0 ? 12 : hoursAMPM);

			var timezone = offset > 0 ? '-' : '+';
			timezone += Math.abs(offset) < 6000 ? '0' : '';
			timezone = padRight(timezone + Math.abs(offset/60), 5);

			var l = this.lang;

			var chars = {
				S: milliseconds,
				SS: pad(milliseconds, 3),
				s: seconds,
				ss: pad(seconds, 2),
				m: minutes,
				mm: pad(minutes, 2),
				H: hoursAMPM,
				HH: hoursAMPM.slice(hoursAMPM.length-2),
				h: hours,
				hh: pad(hours, 2),
				a: meridiem.toLowerCase(),
				A: meridiem,
				D: day,
				DD: pad(day, 2),
				DDD: dayOfYear,
				DDDD: pad(dayOfYear, 3),
				M: month,
				MM: pad(month, 2),
				MMM: l.months(month, format, true),
				MMMM: l.months(month, format),
				w: weekday,
				ww: pad(weekday, 2),
				www: l.weekdays(weekday, format, true),
				wwww: l.weekdays(weekday, format),
				W: week,
				WW: pad(week, 2),
				WWW: weekFull,
				WWWW: pad(weekFull, 2),
				Y: parseInt(year.substring(2), 10),
				YY: year.substring(2),
				YYYY: year,
				Z: [timezone.slice(0,3), ':', timezone.slice(3)].join(''),
				ZZ: timezone
			};

			var ch, reg;
			for (var key in chars) {
				ch = chars[key];
				reg = new RegExp('{'+key+'}', 'g');
				if (typeof format === 'function') {
					format = format(ch) || format;
				}
				if (typeof format === 'string') {
					format = format.replace(reg, ch);
				}
			}
			return format;
		},

		calendar: function() {
			var diff = this.diff(new charon().startOf('day'), 'days', false),
				format = diff < -6 ? 'sameElse' :
				diff < -1 ? 'lastWeek' :
				diff < 0 ? 'lastDay' :
				diff < 1 ? 'sameDay' :
				diff < 2 ? 'nextDay' :
				diff < 7 ? 'nextWeek' : 'sameElse';
			return this.format(this.lang.calendar[format]);
		},

		startOf: function(units) {
			switch (units) {
				case 'year':
					this._d.setMonth(0);
				case 'month':
					this._d.setDate(1);
				case 'week':
				case 'day':
					this._d.setHours(0);
				case 'hour':
					this._d.setMinutes(0);
				case 'minute':
					this._d.setSeconds(0);
				case 'second':
					this._d.setMilliseconds(0);
					break;
				default:
					break;
			}
			if (units === 'week') {
				this.weekday(0);
			}
			return this;
		},

		endOf: function(units) {
			return this.startOf(units).add(units, 1).sub('millisecond', 1);
		},

		add: function(units, amount) {
			this._d.setMilliseconds(this._d.getMilliseconds() + this.duration(units, amount));
			return this;
		},

		sub: function(units, amount) {
			this._d.setMilliseconds(this._d.getMilliseconds() - this.duration(units, amount));
			return this;
		},

		duration: function(units, amount) {
			return amount * (this.msfactor[units] || this.msfactor[this.unitAliases[units]]);
		},

		isValid: function() {
			return !! this._d;
		},

		// Parse given input with default formats or with a given format.
		parse: function(input, format) {
			this._d = parseDateInput(this, input, format);
			return this;
		},

		// Refresh instance to current moment.
		now: function() {
			this._d = new Date();
			return this;
		},

		// Get or set javascript timestamp.
		timestamp: function(input) {
			var timestamp = this._d.getTime();
			return input == null ? timestamp : this.add('millisecond', input - timestamp);
		},

		// Get or set time via unix timestamp.
		unix: function(input) {
			return input == null ? Math.floor(this.timestamp() / 1000) : this.timestamp(input * 1000);
		},

		milliseconds: function(input) {
			var ms = this._d.getMilliseconds();
			return input == null ? ms : this.add('millisecond', input - ms);
		},

		ms: function(input) {
			return this.milliseconds(input);
		},

		seconds: function(input) {
			var seconds = this._d.getSeconds();
			return input == null ? seconds : this.add('second', input - seconds);
		},

		minutes: function(input) {
			var minutes = this._d.getMinutes();
			return input == null ? minutes : this.add('minute', input - minutes);
		},

		hours: function(input) {
			var hours = this._d.getHours();
			return input == null ? hours : this.add('hour', input - hours);
		},

		// Get or set day of week.
		day: function(input) {
			var day = this._d.getDay();
			return input == null ? day : this.add('day', input - day);
		},

		// Get or set day of month. If date exceeds current month number of days
		// it'll propagate to the next month.
		date: function(input) {
			var date = this._d.getDate();
			if (input == null) {
				return date;
			} else {
				var daysInMonth = Math.min(this.date(), daysInMonth(this.year(), input));
				var diff = daysInMonth - date;
				diff >= 0 ? this._d.setDate(input) : this.endOf('month').add('day', diff);
				return this;
			}
		},

		// Get or set week. Day of the week and time stays the same.
		week: function(input, absolute) {
			var week = getWeek(this, this._d, absolute);
			return input == null ? week : this.add('day', (input - week) * 7);
		},

		// Get or set day of the week. Uses locaale settings.
		weekday: function(input) {
			var weekday = getWeekday(this, this._d);
			return input == null ? weekday : this.add('day', input - weekday);
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
			return input == null ? day : this.add('day', input - day);
		},

		// Get or set month.
		month: function(input) {
			var dayOfMonth;
			if (input == null) {
				return this._d.getMonth();
			} else {
				// Pick last day of month if current day is larger.
				dayOfMonth = Math.min(this.date(), daysInMonth(this.year(), input));
				this._d.setMonth(input, dayOfMonth);
				return this;
			}
		},

		year: function(input) {
			var year = this._d.getFullYear();
			return input == null ? year : this.add('year', input - year);
		},

		toDate: function() {
			return this._d;
		},

		utc: function() {
			this.utcMode = true;
			return this;
		},

		clone: function() {
			return new charon(this._d);
		}

	};

	extend(charon, {
		now: function() {
			return new charon();
		},

		yesterday: function() {
			return new charon().sub('day', 1).startOf('day');
		},

		today: function() {
			return new charon().startOf('day');
		},

		tomorrow: function() {
			return new charon().add('day', 1).startOf('day');
		},

		utc: function(input) {
			return new charon().utc().parse(input);
		}
	});

	// CommonJS module is defined.
	if (hasModule) {
		module.exports = charon;
	} else if (typeof define === 'function' && define.amd) {
		define('charon', function() {
			return charon;
		});
	}

}).call(this);
