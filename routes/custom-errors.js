/* @flow weak */

module.exports = function(app) {

  app.get('/unauthorized', function (req, res) {
    res.render('error', {code: 401, req});
  });

  app.get('/notfound', function (req, res) {
    res.render('error', {code: 404, req});
  });

};
