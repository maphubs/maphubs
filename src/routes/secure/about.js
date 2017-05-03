//@flow
var csrfProtection = require('csurf')({cookie: false});

module.exports = function(app: any) {
  app.get('/about', csrfProtection, (req, res) => {
    return res.render('about', {
      title: req.__('About') + ' - ' + MAPHUBS_CONFIG.productName,
      mailchimp: true,
      props: {},
      req
    });
  });

  app.get('/terms', csrfProtection, (req, res) => {
    return res.render('terms', {
      title: req.__('Terms') + ' - ' + MAPHUBS_CONFIG.productName,
      props: {},
      req
    });
  });

  app.get('/privacy', csrfProtection, (req, res) => {
    return res.render('privacy', {
      title: req.__('Privacy') + ' - ' + MAPHUBS_CONFIG.productName,
      props: {},
      req
    });
  });

};
