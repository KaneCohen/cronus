define(['cronus', 'lang'], function(cronus, ru) {
  var run = function() {

    var d;
    // Use offset to compensate for user location.
    var off = new Date().getTimezoneOffset();
    var msOff = off*60;

    module("cronus", {

      setup: function() {
        d = new Date();
        cronus.lang('en');
      }

    });

    test("instantiation", 9, function() {
      var c = new cronus(d);

      var cc = new cronus();

      ok(c instanceof cronus);
      ok(c.toDate() instanceof Date);

      ok(cronus.today() instanceof cronus);
      ok(cronus.today().toDate() instanceof Date);

      ok(cronus.tomorrow() instanceof cronus);
      ok(cronus.tomorrow().toDate() instanceof Date);

      ok(cronus.yesterday() instanceof cronus);
      ok(cronus.yesterday().toDate() instanceof Date);

      var x = new cronus('1991-08-25');
      var y = new cronus();
      notEqual(x.unix(), y.unix());
    });

    test("language", 2, function() {
      cronus.lang('ru');
      var c = new cronus();
      equal(c._lang, 'ru');
      equal(c.lang().relativeTime.prefixFromNow, 'через');
    });

    test("timestamps", 2, function() {
      var c = new cronus(d);

      equal(c.timestamp(), d.getTime());
      equal(c.unix(), Math.floor(d.getTime()/1000));
    });

    test("date parsing", 7, function() {
      var c;

      // Simple date parseing. Will set inner date to 00:00:00 local.
      c = new cronus('1991-08-25');
      equal(c.unix() - msOff, 683078400);

      // Normal parsing with local timezone.
      // Compare unix timestamp, but with compensation for local offset.
      c = new cronus('1991-08-25 20:57:08');
      equal(c.unix() - msOff, 683153828);

      // Format parsing with local timezone.
      // Compare unix timestamp, but with compensation for local offset.
      c = new cronus('1991-08-25 20:57:08', '{YYYY}-{MM}-{DD} {HH}:{mm}:{ss}');
      equal(c.unix() - msOff, 683153828);

      c = new cronus('1991-08-25T20:57:08');
      equal(c.unix() - msOff, 683153828);

      // Create in UTC format - timezone compensation is automatic.
      c = cronus.utc('1991-08-25T20:57:08');
      equal(c.unix(), 683153828);

      // Parse in normal mode with 0 offset and convert to UTC.
      c = new cronus('1991-08-25T20:57:08+00:00');
      equal(c.utc().unix(), 683153828);

      // Parse in UTC mode and check unix timesamp.
      c = cronus.utc('1991-08-25 20:57:08');
      equal(c.unix(), 683153828);
    });

    test("startOf method", 4, function() {
      var c = new cronus(d);

      d.setMilliseconds(0);
      equal(c.startOf('second').timestamp(), d.getTime());
      d.setSeconds(0);
      equal(c.startOf('minute').timestamp(), d.getTime());
      d.setMinutes(0);
      equal(c.startOf('hour').timestamp(), d.getTime());
      d.setHours(0);
      equal(c.startOf('day').timestamp(), d.getTime());
    });

    test("fromNow method", 8, function() {
      var now = new cronus(new Date());
      equal(now.fromNow(), 'just now');

      var fiveMinAgo = new cronus(new Date().getTime() - (5 * 60 * 1000));
      equal(fiveMinAgo.fromNow(), '5 minutes ago');

      var fourtyFourMinAgo = new cronus(new Date().getTime() - (44 * 60 * 1000));
      equal(fourtyFourMinAgo.fromNow(), '44 minutes ago');

      var fourtyFiveMinAgo = new cronus(new Date().getTime() - (45 * 60 * 1000));
      equal(fourtyFiveMinAgo.fromNow(), 'an hour ago');

      var twentyHoursAgo = new cronus(new Date().getTime() - (20 * 60 * 60 * 1000));
      equal(twentyHoursAgo.fromNow(), '20 hours ago');

      var twentyFourHoursAgo = new cronus(new Date().getTime() - (24 * 60 * 60 * 1000));
      equal(twentyFourHoursAgo.fromNow(), 'a day ago');

      var twentyNineDaysAgo = new cronus(new Date().getTime() - (29 * 24 * 60 * 60 * 1000));
      equal(twentyNineDaysAgo.fromNow(), '29 days ago');

      var thirtyOneDaysAgo = new cronus(new Date(2000, 6, 6).getTime() - (31 * 24 * 60 * 60 * 1000));
      var date = thirtyOneDaysAgo.format('{D} {MMMM} {YYYY}');
      equal(thirtyOneDaysAgo.fromNow(), date);
    });

    test("test day methods", 4, function() {
      var yesterday = new Date(2014, 6, 3, 0, 0, 0);
      var tomorrow = new Date(2014, 6, 5, 0, 0, 0);

      var c = new cronus('2014-07-04 12:05:45');
      equal(c.yesterday().timestamp(), yesterday.getTime());

      var c2 = new cronus('2014-07-04 12:05:45');
      equal(c2.tomorrow().timestamp(), tomorrow.getTime());

      var c3 = new cronus('2014-07-04 12:05:45');
      yesterday = new Date(2014, 6, 3, 12, 5, 45);
      equal(c3.sub(1, 'day').timestamp(), yesterday.getTime());

      var c4 = new cronus('2014-07-04 12:05:45');
      in10Days = new Date(2014, 6, 14, 12, 5, 45);
      equal(c4.add(10, 'days').timestamp(), in10Days.getTime());
    });

    test("getters and setters", 6, function() {
      var c = new cronus();

      c.year(2014);
      c.month(10);
      c.date(11);
      c.minutes(17);
      c.seconds(43);
      c.milliseconds(11);

      equal(c.year(), 2014);
      equal(c.month(), 10);
      equal(c.date(), 11);
      equal(c.minutes(), 17);
      equal(c.seconds(), 43);
      equal(c.milliseconds(), 11);
    });

    test("add with short", 6, function() {
      var c = new cronus();

      c.year(2014);
      c.month(10);
      c.date(11);
      c.minutes(17);
      c.seconds(43);
      c.milliseconds(11);

      equal(c.add(1, 'y').year(), 2015);
      equal(c.add(1, 'M').month(), 11);
      equal(c.add(2, 'd').date(), 13);
      equal(c.add(5, 'm').minutes(), 22);
      equal(c.add(10, 's').seconds(), 53);
      equal(c.add(100, 'ms').milliseconds(), 111);
    });

    test("add with long singular", 6, function() {
      var c = new cronus();

      c.year(2014);
      c.month(10);
      c.date(11);
      c.minutes(17);
      c.seconds(43);
      c.milliseconds(11);

      equal(c.add(1, 'year').year(), 2015);
      equal(c.add(1, 'month').month(), 11);
      equal(c.add(2, 'day').date(), 13);
      equal(c.add(5, 'minute').minutes(), 22);
      equal(c.add(10, 'second').seconds(), 53);
      equal(c.add(100, 'millisecond').milliseconds(), 111);
    });

    test("add with long plural", 6, function() {
      var c = new cronus();

      c.year(2014);
      c.month(10);
      c.date(11);
      c.minutes(17);
      c.seconds(43);
      c.milliseconds(11);

      equal(c.add(1, 'years').year(), 2015);
      equal(c.add(1, 'months').month(), 11);
      equal(c.add(2, 'days').date(), 13);
      equal(c.add(5, 'minutes').minutes(), 22);
      equal(c.add(10, 'seconds').seconds(), 53);
      equal(c.add(100, 'milliseconds').milliseconds(), 111);
    });

    test("subtract with short", 6, function() {
      var c = new cronus();

      c.year(2011);
      c.month(6);
      c.date(11);
      c.minutes(17);
      c.seconds(43);
      c.milliseconds(11);

      equal(c.sub(1, 'y').year(), 2010);
      equal(c.sub(1, 'M').month(), 5);
      equal(c.sub(2, 'd').date(), 9);
      equal(c.sub(5, 'm').minutes(), 12);
      equal(c.sub(10, 's').seconds(), 33);
      equal(c.sub(5, 'ms').milliseconds(), 6);
    });

    test("subtract with long singular", 6, function() {
      var c = new cronus();

      c.year(2011);
      c.month(6);
      c.date(11);
      c.minutes(17);
      c.seconds(43);
      c.milliseconds(11);

      equal(c.sub(1, 'year').year(), 2010);
      equal(c.sub(1, 'month').month(), 5);
      equal(c.sub(2, 'day').date(), 9);
      equal(c.sub(5, 'minute').minutes(), 12);
      equal(c.sub(10, 'second').seconds(), 33);
      equal(c.sub(5, 'millisecond').milliseconds(), 6);
    });

    test("subtract with long plural", 6, function() {
      var c = new cronus();

      c.year(2011);
      c.month(6);
      c.date(11);
      c.minutes(17);
      c.seconds(43);
      c.milliseconds(11);

      equal(c.sub(1, 'years').year(), 2010);
      equal(c.sub(1, 'months').month(), 5);
      equal(c.sub(2, 'days').date(), 9);
      equal(c.sub(5, 'minutes').minutes(), 12);
      equal(c.sub(10, 'seconds').seconds(), 33);
      equal(c.sub(5, 'milliseconds').milliseconds(), 6);
    });

  };

  return {run: run};
});
