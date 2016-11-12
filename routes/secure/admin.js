/* @flow weak */

var Admin = require('../../models/admin');
var csrfProtection = require('csurf')({cookie: false});

module.exports = function(app) {

  app.get('/admin/invite', csrfProtection, function(req, res) {
    //check if logged in use is an admin

    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.redirect('/login');
    }
    var user_id = req.session.user.id;
    Admin.checkAdmin(user_id).then(function(allowed){
      if(allowed){
        res.render('adminuserinvite', {title: req.__('Invite User') + ' - ' + MAPHUBS_CONFIG.productName, props: {}, req});
      }else{
        return res.redirect('/login');
      }
    });

  });

  app.post('/admin/invite/send', csrfProtection, function(req, res) {
    //check if logged in use is an admin
    var data = req.body;
    if (req.isAuthenticated && req.isAuthenticated()) {
      //logged in, confirm that the requested user matches the session user
      var user_id = req.session.user.id;
      if(!data.user_id || user_id != data.user_id){
        return res.status(401).send("Unauthorized");
      }
    }
    return res.status(401).send("Unauthorized");

  });


};
