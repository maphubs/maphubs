const Locales = require('../services/locales');

const LocaleMixin = {
  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },
};

module.exports = LocaleMixin;