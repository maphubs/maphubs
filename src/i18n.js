var debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('i18n')
var i18n = require('i18n')
i18n.configure({
  locales: ['en', 'fr', 'es', 'it', 'pt', 'id'],
  directory: './src/locales',
  defaultLocale: 'en',
  extension: '.json',
  logErrorFn (msg) {
    debug.log(msg)
  }
})

module.exports = i18n
