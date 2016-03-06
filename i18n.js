var log = require('./services/log');
var i18n = require("i18n");
i18n.configure({
    locales:['en', 'fr', 'es'],
    directory: __dirname + '/locales',
    defaultLocale: 'en',
    extension: '.json',
    logErrorFn(msg) {
        log.error(msg);
    }
});

module.exports = i18n;
