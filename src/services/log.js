// @flow
const winston = require('winston');

winston.add(require('winston-daily-rotate-file'), {
  filename: 'logs/maphubs.log',
  datePattern: '.yy-MM-dd'
});

module.exports = winston;
