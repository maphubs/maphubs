//@flow
const local = require('../../local');
module.exports = function(app: any) {

  app.get('/logout', (req, res) => {
    req.logout();
    delete req.session.user;
    req.session.destroy(() => {
      if(local.requireLogin){
        res.redirect('/login');
      }else{
        res.redirect('/');
      }
    });
  });
};