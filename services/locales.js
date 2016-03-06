var i18n = null ;
if (typeof window === 'undefined') {
   i18n = require("../i18n");
 }

module.exports = {
  "en": require('../locales/en.json'),
  "fr": require('../locales/fr.json'),
  "es": require('../locales/es.json'),
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
