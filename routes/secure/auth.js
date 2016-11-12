/* @flow weak */
module.exports = function(app) {

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

};
