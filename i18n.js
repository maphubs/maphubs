var debug = require('./services/debug')('i18n');
var i18n = require("i18n");
i18n.configure({
    locales:['en', 'fr', 'es', 'it'],
    directory: __dirname + '/locales',
    defaultLocale: 'en',
    extension: '.json',
    logErrorFn(msg) {
        debug(msg);
    }
});

module.exports = i18n;
