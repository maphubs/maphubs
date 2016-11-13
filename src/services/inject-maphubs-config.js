//this this is not the browser
if(process.env.APP_ENV !== 'browser'){
  global.MAPHUBS_CONFIG = require('../clientconfig');
}
