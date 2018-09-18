// @flow
var winston = require('winston')
require('winston-daily-rotate-file')

var hostname = process.env.HOSTNAME || 'local'

var fileTransport = new (winston.transports.DailyRotateFile)({
  filename: `logs/maphubs-${hostname}-%DATE%.log`,
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
})

var logger = winston.createLogger({
  transports: [
    fileTransport,
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
})

module.exports = logger
