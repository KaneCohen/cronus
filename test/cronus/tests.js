var cronus = require('../../lib/cronus.js');
var lang = require('../../lang/ru.js');

exports.cronus = {
  setUp: function(done) {
    cronus.lang('en');
    var off = new Date().getTimezoneOffset();
    this.msOff = off*60;

    done();
  },

  "instantiation": function(test) {
    test.expect(10);

    var c = new cronus();

    test.ok(c instanceof cronus, 'instance should be cronus');
    test.ok(c.toDate() instanceof Date, 'toDate method return should be instance of Date');

    test.ok(cronus.today() instanceof cronus, 'return should be instance of cronus');
    test.ok(cronus.today().toDate() instanceof Date, 'date should be instance of Date');

    test.ok(cronus.tomorrow() instanceof cronus, 'return should be instance of cronus');
    test.ok(cronus.tomorrow().toDate() instanceof Date, 'date should be instance of Date');

    test.ok(cronus.yesterday() instanceof cronus, 'return should be instance of cronus');
    test.ok(cronus.yesterday().toDate() instanceof Date, 'date should be instance of Date');

    var x = new cronus('1991-08-25');
    var y = new cronus();
    test.notEqual(x.unix(), y.unix(), 'two instance results should not be equal');

    c = new cronus([1991, 7, 25]);
    test.equal(c.unix() - this.msOff, 683078400, 'should return correct date when setting it via array');

    test.done();
  },

  "language": function(test) {
    test.expect(2);
    cronus.lang('ru');

    var c = new cronus();
    test.equal(c._lang, 'ru', 'Language should be set to russian');
    test.equal(c.lang().relativeTime.prefixFromNow, 'через', 'Language line should be set to translated one');

    test.done();
  },

  "timestamps": function(test) {
    test.expect(2);

    var d = new Date();
    var c = new cronus(d);

    test.equal(c.timestamp(), d.getTime(), 'Get Date timestamp (in milliseconds)');
    test.equal(c.unix(), Math.floor(d.getTime()/1000), 'Get unix timestamp');

    test.done();
  },

  "date parsing": function(test) {
    test.expect(7);

    // Simple date parsing. Will set inner date to 00:00:00 local.
    var c = new cronus('1991-08-25');
    test.equal(c.unix() - this.msOff, 683078400, 'Set date with simple Y-M-D string');

    // Normal parsing with local timezone.
    // Compare unix timestamp, but with compensation for local offset.
    c = new cronus('1991-08-25 20:57:08');
    test.equal(c.unix() - this.msOff, 683153828, 'Set date with ISO-like string');

    c = new cronus('1991-08-25T20:57:08');
    test.equal(c.unix() - this.msOff, 683153828, 'Set date with second ISO-like string');

    // Format parsing with local timezone.
    // Compare unix timestamp, but with compensation for local offset.
    c = new cronus('1991-08-25 20:57:08', '{YYYY}-{MM}-{DD} {HH}:{mm}:{ss}');
    test.equal(c.unix() - this.msOff, 683153828, 'Set date with custom format');

    // Create in UTC format - timezone compensation is automatic.
    c = cronus.utc('1991-08-25T20:57:08');
    test.equal(c.unix(), 683153828, 'Set date in UTC Mode');

    // Parse in normal mode with 0 offset and convert to UTC.
    c = new cronus('1991-08-25T20:57:08+00:00');
    test.equal(c.utc().unix(), 683153828, 'Set date in UTC mode with ISO string');

    // Parse in UTC mode and check unix timesamp.
    c = cronus.utc('1991-08-25 20:57:08');
    test.equal(c.unix(), 683153828, 'Set date in UTC mode with ISO-like string');

    test.done();
  },

  "startOf method": function(test) {
    test.expect(5);

    var d = new Date();
    var c = new cronus(d);
    d.setMilliseconds(0);
    test.equal(c.startOf('second').timestamp(), d.getTime(), 'Set to start of second');
    d.setSeconds(0);
    test.equal(c.startOf('minute').timestamp(), d.getTime(), 'Set to start of minute');
    d.setMinutes(0);
    test.equal(c.startOf('hour').timestamp(), d.getTime(), 'Set to start of hour');
    d.setHours(0);
    test.equal(c.startOf('day').timestamp(), d.getTime(), 'Set to start of day');

    var dw = new Date(1991, 7, 25);
    var cw = new cronus([1991, 7, 27]);
    test.equal(cw.startOf('week').timestamp(), dw.getTime(), 'should be correct when setting start of week');

    test.done();
  },

  "fromNow method": function(test) {
    test.expect(8);

    var now = new cronus(new Date());
    test.equal(now.fromNow(), 'just now', 'From now to now');

    var fiveMinAgo = new cronus(new Date().getTime() - (5 * 60 * 1000));
    test.equal(fiveMinAgo.fromNow(), '5 minutes ago', 'From noow to 5 minutes ago');

    var fourtyFourMinAgo = new cronus(new Date().getTime() - (44 * 60 * 1000));
    test.equal(fourtyFourMinAgo.fromNow(), '44 minutes ago', 'From now to 44 minutes ago');

    var fourtyFiveMinAgo = new cronus(new Date().getTime() - (45 * 60 * 1000));
    test.equal(fourtyFiveMinAgo.fromNow(), 'an hour ago', 'From now to 45 minutes ago');

    var twentyHoursAgo = new cronus(new Date().getTime() - (20 * 60 * 60 * 1000));
    test.equal(twentyHoursAgo.fromNow(), '20 hours ago', 'From now to 20 hours ago');

    var twentyFourHoursAgo = new cronus(new Date().getTime() - (24 * 60 * 60 * 1000));
    test.equal(twentyFourHoursAgo.fromNow(), 'a day ago', 'From now to 24 hours ago');

    var twentyNineDaysAgo = new cronus(new Date().getTime() - (29 * 24 * 60 * 60 * 1000));
    test.equal(twentyNineDaysAgo.fromNow(), '29 days ago', 'From now to 29 days ago');

    var thirtyOneDaysAgo = new cronus(new Date().getTime() - (31 * 24 * 60 * 60 * 1000));
    // Depending on the year - we either render with year or without.
    if (new Date().getMonth() > 0) {
      var date = thirtyOneDaysAgo.format('{D} {MMMM}');
    } else {
      var date = thirtyOneDaysAgo.format('{D} {MMMM} {YYYY}');
    }
    test.equal(thirtyOneDaysAgo.fromNow(), date, 'From now to 31 days ago');

    test.done();
  },

  "day methods": function(test) {
    test.expect(4);

    var yesterday = new Date('2014-07-03 00:00:00');
    var tomorrow = new Date('2014-07-05 00:00:00');

    var c = new cronus('2014-07-04 12:05:45');
    test.equal(c.yesterday().timestamp(), yesterday.getTime(), 'get yesterday');

    var c2 = new cronus('2014-07-04 12:05:45');
    test.equal(c2.tomorrow().timestamp(), tomorrow.getTime(), 'get tomorrow');

    var c3 = new cronus('2014-07-04 12:05:45');
    yesterday = new Date('2014-07-03 12:05:45');
    test.equal(c3.sub(1, 'day').timestamp(), yesterday.getTime(), 'yesterday via subtract');

    var c4 = new cronus('2014-07-04 12:05:45');
    in10Days = new Date('2014-07-14 12:05:45');
    test.equal(c4.add(10, 'days').timestamp(), in10Days.getTime(), 'in 10 days via add');

    test.done();
  },

  "getters and setters": function(test) {
    test.expect(6);

    var c = new cronus();
    c.year(2014);
    c.month(10);
    c.date(11);
    c.minutes(17);
    c.seconds(43);
    c.milliseconds(11);

    test.equal(c.year(), 2014, 'Get year');
    test.equal(c.month(), 10, 'Get month');
    test.equal(c.date(), 11, 'Get date');
    test.equal(c.minutes(), 17, 'Get minutes');
    test.equal(c.seconds(), 43, 'Get seconds');
    test.equal(c.milliseconds(), 11, 'Get milliseconds');

    test.done();
  },

  "add with short": function(test) {
    test.expect(6);

    var c = new cronus();
    c.year(2014);
    c.month(10);
    c.date(11);
    c.minutes(17);
    c.seconds(43);
    c.milliseconds(11);

    test.equal(c.add(1, 'y').year(), 2015);
    test.equal(c.add(1, 'M').month(), 11);
    test.equal(c.add(2, 'd').date(), 13);
    test.equal(c.add(5, 'm').minutes(), 22);
    test.equal(c.add(10, 's').seconds(), 53);
    test.equal(c.add(100, 'ms').milliseconds(), 111);

    test.done();
  },

  "add with long singular": function(test) {
    test.expect(6);

    var c = new cronus();
    c.year(2014);
    c.month(10);
    c.date(11);
    c.minutes(17);
    c.seconds(43);
    c.milliseconds(11);

    test.equal(c.add(1, 'year').year(), 2015);
    test.equal(c.add(1, 'month').month(), 11);
    test.equal(c.add(2, 'day').date(), 13);
    test.equal(c.add(5, 'minute').minutes(), 22);
    test.equal(c.add(10, 'second').seconds(), 53);
    test.equal(c.add(100, 'millisecond').milliseconds(), 111);

    test.done();
  },

  "add with long plural": function(test) {
    test.expect(6);

    var c = new cronus();
    c.year(2014);
    c.month(10);
    c.date(11);
    c.minutes(17);
    c.seconds(43);
    c.milliseconds(11);

    test.equal(c.add(1, 'years').year(), 2015, 'Add years');
    test.equal(c.add(1, 'months').month(), 11, 'Add months');
    test.equal(c.add(2, 'days').date(), 13, 'Add days');
    test.equal(c.add(5, 'minutes').minutes(), 22, 'Add minutes');
    test.equal(c.add(10, 'seconds').seconds(), 53, 'Add seconds');
    test.equal(c.add(100, 'milliseconds').milliseconds(), 111, 'Add milliseconds');

    test.done();
  },

  "subtract with short": function(test) {
    test.expect(6);

    var c = new cronus();
    c.year(2011);
    c.month(6);
    c.date(11);
    c.minutes(17);
    c.seconds(43);
    c.milliseconds(11);

    test.equal(c.sub(1, 'y').year(), 2010, 'Sub years');
    test.equal(c.sub(1, 'M').month(), 5, 'Sub months');
    test.equal(c.sub(2, 'd').date(), 9, 'Sub days');
    test.equal(c.sub(5, 'm').minutes(), 12, 'Sub minutes');
    test.equal(c.sub(10, 's').seconds(), 33, 'Sub seconds');
    test.equal(c.sub(5, 'ms').milliseconds(), 6, 'Sub milliseconds');

    test.done();
  },

  "subtract with long singular": function(test) {
    test.expect(6);

    var c = new cronus();
    c.year(2011);
    c.month(6);
    c.date(11);
    c.minutes(17);
    c.seconds(43);
    c.milliseconds(11);

    test.equal(c.sub(1, 'year').year(), 2010, 'Sub years');
    test.equal(c.sub(1, 'month').month(), 5, 'Sub months');
    test.equal(c.sub(2, 'day').date(), 9, 'Sub days');
    test.equal(c.sub(5, 'minute').minutes(), 12, 'Sub minutes');
    test.equal(c.sub(10, 'second').seconds(), 33, 'Sub seconds');
    test.equal(c.sub(5, 'millisecond').milliseconds(), 6, 'Sub milliseconds');

    test.done();
  },

  "subtract with long plural": function(test) {
    test.expect(6);

    var c = new cronus();
    c.year(2011);
    c.month(6);
    c.date(11);
    c.minutes(17);
    c.seconds(43);
    c.milliseconds(11);

    test.equal(c.sub(1, 'years').year(), 2010, 'Sub years');
    test.equal(c.sub(1, 'months').month(), 5, 'Sub months');
    test.equal(c.sub(2, 'days').date(), 9, 'Sub days');
    test.equal(c.sub(5, 'minutes').minutes(), 12, 'Sub minutes');
    test.equal(c.sub(10, 'seconds').seconds(), 33, 'Sub seconds');
    test.equal(c.sub(5, 'milliseconds').milliseconds(), 6, 'Sub milliseconds');

    test.done();
  },

  "clone": function(test) {
    test.expect(3);
    var c = new cronus();
    var cloned = c.clone();

    var cUTC = cronus.utc();
    var clonedUTC = cUTC.clone();

    test.equal(c.format(), cloned.format());
    test.equal(cUTC.format(), clonedUTC.format());
    test.notEqual(c.format(), clonedUTC.format());

    test.done();
  }

};
