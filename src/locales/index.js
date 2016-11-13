module.exports = {
  en: require('./en.json'),
  fr: require('./fr.json'),
  es: require('./es.json'),
  it: require('./it.json'),

  getLocaleString(locale, text){
    if(this[locale] && this[locale][text]){
      return this[locale][text];
    }
    return text;
  }
};
