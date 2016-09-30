var config = require('../clientconfig');

module.exports = function(app) {
  app.get('/about', function(req, res) {
    res.render('about', {
      title: req.__('About') + ' - ' + config.productName,
      mailchimp: true,
      props: {},
      req
    });
  });

  app.get('/terms', function(req, res) {
    res.render('terms', {
      title: req.__('Terms') + ' - ' + config.productName,
      props: {},
      req
    });
  });

  app.get('/privacy', function(req, res) {
    res.render('privacy', {
      title: req.__('Privacy') + ' - ' + config.productName,
      props: {},
      req
    });
  });

  app.get('/get-started/explore', function(req, res) {
    res.render('explore', {
      title: req.__('Explore') + ' - ' + config.productName,
      props: {},
      req
    });
  });

};
