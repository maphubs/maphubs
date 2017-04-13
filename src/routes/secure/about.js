var csrfProtection = require('csurf')({cookie: false});
var Page = require('../../models/page');
var nextError = require('../../services/error-response').nextError;

module.exports = function(app) {
  app.get('/about', csrfProtection, function(req, res, next) {
    Page.getPageConfigs(['footer']).then(function(pageConfigs: Object){
      var footerConfig = pageConfigs['footer'];
      res.render('about', {
        title: req.__('About') + ' - ' + MAPHUBS_CONFIG.productName,
        mailchimp: true,
        props: {footerConfig},
        req
      });
    }).catch(nextError(next));
  });

  app.get('/terms', csrfProtection, function(req, res, next) {
    Page.getPageConfigs(['footer']).then(function(pageConfigs: Object){
      var footerConfig = pageConfigs['footer'];
      res.render('terms', {
        title: req.__('Terms') + ' - ' + MAPHUBS_CONFIG.productName,
        props: {footerConfig},
        req
      });
    }).catch(nextError(next));
  });

  app.get('/privacy', csrfProtection, function(req, res, next) {
    Page.getPageConfigs(['footer']).then(function(pageConfigs: Object){
      var footerConfig = pageConfigs['footer'];
      res.render('privacy', {
        title: req.__('Privacy') + ' - ' + MAPHUBS_CONFIG.productName,
        props: {footerConfig},
        req
      });
    }).catch(nextError(next));
  });

};
