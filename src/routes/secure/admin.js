//@flow
var Admin = require('../../models/admin');
var csrfProtection = require('csurf')({cookie: false});
var apiError = require('../../services/error-response').apiError;
var nextError = require('../../services/error-response').nextError;
var apiDataError = require('../../services/error-response').apiDataError;
var knex = require('../../connection');
//var log = require('../../services/log');

module.exports = function(app: any) {

  app.get('/admin/invite', csrfProtection, (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.redirect('/login');
    }
    var user_id = req.session.user.maphubsUser.id;
    Admin.checkAdmin(user_id).then((allowed) => {
      if(allowed){
        return res.render('adminuserinvite', {title: req.__('Invite User') + ' - ' + MAPHUBS_CONFIG.productName, props: {}, req});
      }else{
        return res.redirect('/login');
      }
    }).catch(nextError(next));

  });

  app.post('/admin/invite/send', csrfProtection, (req, res) => {
    //check if logged in use is an admin
    var data = req.body;
    if (req.isAuthenticated && req.isAuthenticated()) {
      var user_id = req.session.user.maphubsUser.id;
      Admin.checkAdmin(user_id).then((allowed) => {
        if(allowed){
          if (data && data.email) {
            return Admin.sendInviteEmail(data.email, req.__).then(() => {
              res.status(200).send({success:true});
            });
          }else{
            apiDataError(res);
          }
        }else{
            res.status(401).send("Unauthorized");
        }
      }).catch(apiError(res, 200));
    }else{
       res.status(401).send("Unauthorized");
    }
  });

   app.get('/admin/export/users', csrfProtection, (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.redirect('/login');
    }
    var user_id = req.session.user.maphubsUser.id;
    Admin.checkAdmin(user_id).then((allowed) => {
      if(allowed && MAPHUBS_CONFIG.enableUserExport){
        knex('users').select('id', 'email', 'email_valid', 'display_name')
        .then((users) =>{
          let userExport = [];
          users.forEach(user => {
            userExport.push(
              {
                "username": user.display_name,
                "email": user.email,
                "email_verified": user.email_valid,
                "app_metadata": {
                    "hosts": [
                      {
                        "host": MAPHUBS_CONFIG.host,
                        "user_id": user.id
                      }
                    ],
                    "signedUp": true
                },
              }
            );
          });
          res.status(200).send(userExport);
        });
      }else{
        return res.redirect('/login');
      }
    }).catch(nextError(next));

  });
};