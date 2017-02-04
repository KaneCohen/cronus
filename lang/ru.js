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
    formats: {
      LT: '{HH}:{mm}',
      LTS: '{HH}:{mm}:{ss}',
      L: '{DD}.{MM}.{YYYY}',
      l: '{D}.{M}.{YYYY}',
      LL: '{D} {MMMM} {YYYY}',
      ll: '{D} {MMM}. {YYYY}',
      LLL: '{D} {MMMM} {YYYY}, {HH}:{mm}',
      lll: '{D} {MMM}. {YYYY}, {HH}:{mm}',
      LLLL: '{wwww}, {D} {MMMM} {YYYY}, {HH}:{mm}',
      llll: '{www}, {D} {MMM}. {YYYY}, {HH}:{mm}'
    },

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

    meridiem: function(now, isLower) {
      var hours = now.hours();
      if (hours < 4) {
        return 'ночи';
      } else if (hours < 12) {
        return 'утра';
      } else if (hours < 17) {
        return 'дня';
      } else {
        return 'вечера';
      }
    },

    pluralizer: function(number) {
      return ((number % 10 === 1) && (number % 100 !== 11))
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
      weekStart: 1,
      yearStart: 4
    },

    weekdays: function(day, format, brief) {
      var weekdays = {
        nominative: ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье'],
        accusative: ['понедельник', 'вторник', 'среду', 'четверг', 'пятницу', 'субботу', 'воскресенье'],
        brief: ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']
      };
      if (brief) {
        return weekdays.brief[day];
      }
      var nounCase = (/(прошлую|следующую)/).test(format) && (/{DDDD}/).test(format) ? 'accusative' : 'nominative';
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
      var nounCase = (/\{(D|DD)\} \{MMMM\}/).test(format) ? 'accusative' : 'nominative';
      return months[nounCase][month];
    }
  });
}));
