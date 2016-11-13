var csrfProtection = require('csurf')({cookie: false});

module.exports = function(app) {
  app.get('/about', csrfProtection, function(req, res) {
    res.render('about', {
      title: req.__('About') + ' - ' + MAPHUBS_CONFIG.productName,
      mailchimp: true,
      props: {},
      req
    });
  });

  app.get('/terms', csrfProtection, function(req, res) {
    res.render('terms', {
      title: req.__('Terms') + ' - ' + MAPHUBS_CONFIG.productName,
      props: {},
      req
    });
  });

  app.get('/privacy', csrfProtection, function(req, res) {
    res.render('privacy', {
      title: req.__('Privacy') + ' - ' + MAPHUBS_CONFIG.productName,
      props: {},
      req
    });
  });

};
