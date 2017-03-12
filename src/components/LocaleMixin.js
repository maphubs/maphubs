var Locales = require('../services/locales');

var LocaleMixin = {
  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },
};

module.exports = LocaleMixin;