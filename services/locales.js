var i18n = null ;
if (typeof window === 'undefined') {
   i18n = require("../i18n");
 }
 var en = require('../locales/en.json');
 var fr = require('../locales/fr.json');
 var es = require('../locales/es.json');
module.exports = {
  en, fr, es,
  getLocaleString(locale, text){
    if(i18n){
      //use i18n package when running on the server
      i18n.setLocale(locale);
      return i18n.__(text);
    }else if(this[locale] && this[locale][text]){
      return this[locale][text];
    }
    return text;

  }
};
