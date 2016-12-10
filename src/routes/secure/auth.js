/* @flow weak */
var local = require('../../local');
module.exports = function(app) {

  app.get('/logout', function(req, res) {
    req.logout();
    delete req.session.user;
    if(local.requireLogin){
      res.redirect('/login');
    }else{
      res.redirect('/');
    }

  });

};
