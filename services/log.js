/* @flow weak */
var winston = require('winston');
var local = require('../local');
require('winston-loggly');

if(process.env.NODE_ENV == 'production' && !local.disableTracking){
  winston.add(winston.transports.Loggly, {
     token: local.LOGGLY_API_KEY,
     subdomain: "maphubs",
     tags: ["maphubs", local.ENV_TAG],
     json:true
  });
}else {
  winston.add(require('winston-daily-rotate-file'), {
    filename: 'logs/maphubs.log',
    datePattern: '.yy-MM-dd'
  });
}
module.exports = winston;




// Uncomment to use file logs
/*
winston.add(winston.transports.File, {
  filename: 'SOMEFILE.log',

  // this is 10 mb
  maxsize: 10000000
});
*/

// Uncomment to use rotating-day file logs
/*
winston.add(winston.transports.DailyRotateFile, {
  filename: 'SOMEFILE.log',

  // Rotate to a new log file every day.
  datePattern: '.yy-MM-dd'
});
*/
