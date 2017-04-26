//@flow
var local = require('../../local');
module.exports = function(app: any) {

  app.get('/logout', (req, res) => {
    req.logout();
    delete req.session.user;
    if(local.requireLogin){
      res.redirect('/login');
    }else{
      res.redirect('/');
    }
  });
};