(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['cronus'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('../index'));
  } else {
    root.returnExports = factory(root.cronus);
  }
}(this, function(cronus) {
  'use strict';
  return cronus.lang('ru', {
    relativeTime: {
      prefixAgo: null,
      prefixFromNow: 'через',
      suffixAgo: 'назад',
      suffixFromNow: '',
      seconds: '[только что]',
      minute: '{prefix} [минуту] {suffix}',
      minutes: '{prefix} {diff} [минуту|минуты|минут] {suffix}',
      hour: '{prefix} [час] {suffix}',
      hours: '{prefix} {diff} [час|часа|часов] {suffix}',
      day: '{prefix} [день] {suffix}',
      days: '{prefix} {diff} [день|дня|дней] {suffix}',
      month: '{prefix} [месяц] {suffix}',
      months: '{prefix} [месяц|месяцев|месяца] {diff}',
      year: '{prefix} [год] {suffix}',
      years: '{prefix} {diff} [год|года|лет] {suffix}',
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
      return ((number % 10 == 1) && (number % 100 != 11))
        ? 0
        : (((number % 10 >= 2) && (number % 10 <= 4) && ((number % 100 < 10) || (number % 100 >= 20))) ? 1 : 2);
    },

    calendar: {
      sameElse: '{D} {MMMM} {YYYY}',
      sameDay: 'Сегодня',
      nextDay: 'Завтра',
      nextWeek: function(day) {
        return day === 2 ? 'Во {DDDD} в {H}:{m}' : 'В {DDDD} в {H}:{m}';
      },
      lastDay: 'Вчера',
      lastWeek: function(day) {
        switch (Math.abs(day)) {
          case 0:
            return 'В прошлое {DDDD}';
          case 1:
          case 2:
          case 4:
            return 'В прошлый {DDD}';
          case 3:
          case 5:
          case 6:
            return 'В прошлую {DDD}';
        }
      }
    },

    week: {
      weekStart: 1, // First day of the week. 0 - Sunday in USA. Set to 1 for Monday.
      yearStart: 4  // First thursday of the year indicates first week of the year.
    },

    weekdays: function(day, format, brief) {
      var weekdays = {
        nominative: ['воскресенье' ,'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
        accusative: ['воскресенье', 'понедельник', 'вторник', 'среду', 'четверг', 'пятницу', 'субботу'],
        brief: ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']
      };
      if (brief) {
        return weekdays.brief[day];
      }
      nounCase = (/(прошлую|следующую)/).test(format) && (/{DDDD}/).test(format) ? 'accusative' : 'nominative';
      return weekdays[nounCase][day];
    },

    months: function(month, format, brief) {
      var months = {
        nominative: [null, 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
        accusative: [null, 'января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
        brief: [null, 'янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
      };
      if (brief) {
        return months.brief[month];
      }
      nounCase = (/\{(D|DD)\} \{MMMM\}/).test(format) ? 'accusative' : 'nominative';
      return months[nounCase][month];
    }
  });
}));
