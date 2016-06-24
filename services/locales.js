var i18n = null ;
if (process.env.APP_ENV !== 'browser') {
   i18n = require("../i18n");
 }
 var locales = require('../locales');
module.exports = {
  en:locales.en, 
  fr:locales.fr, 
  es:locales.es, 
  it:locales.it,
  getLocaleString(locale, text){
    if(i18n){
      //use i18n package when running on the server
      i18n.setLocale(locale);
      return i18n.__(text);
    }else{
      return locales.getLocaleString(locale, text);
    }
  }
};
