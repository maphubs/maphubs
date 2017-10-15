//@flow
var Admin = require('../../models/admin');
var csrfProtection = require('csurf')({cookie: false});
var apiError = require('../../services/error-response').apiError;
var nextError = require('../../services/error-response').nextError;
var apiDataError = require('../../services/error-response').apiDataError;
var knex = require('../../connection');
//var log = require('../../services/log');

module.exports = function(app: any) {

  app.get('/admin/manage', csrfProtection, async (req, res, next) => {
    try {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.redirect('/login');
      }
      if(await Admin.checkAdmin(req.session.user.maphubsUser.id)){
        return res.render('adminuserinvite', {
          title: req.__('Manage Users') + ' - ' + MAPHUBS_CONFIG.productName, 
          props: {
            members: await Admin.getMembers()
          }, req});
      }else{
        return res.redirect('/login');
      }
    }catch(err){
      nextError(next)(err);
    }
  });

  app.post('/admin/invite/send', csrfProtection, async (req, res) => {
    try{
      var data = req.body;
      if (req.isAuthenticated && req.isAuthenticated()) {
        var user_id = req.session.user.maphubsUser.id;
        if(await Admin.checkAdmin(user_id)){
          if (data && data.email) {
              res.status(200).send({
                success:true, 
                key: await Admin.sendInviteEmail(data.email, req.__)
              });
          }else{
            apiDataError(res);
          }
        }else{
          res.status(401).send("Unauthorized");
        }
      }else{
        res.status(401).send("Unauthorized");
      }
    }catch(err){
      apiError(res, 200)(err);
    }
  });

  app.post('/admin/invite/deauthorize', csrfProtection, async (req, res) => {
    try{
      var data = req.body;
      if(req.isAuthenticated && req.isAuthenticated() &&
        await Admin.checkAdmin(req.session.user.maphubsUser.id)){
        if (data && data.email && data.key) {
          await Admin.deauthorize(data.email, data.key);
          res.status(200).send({success:true});
        }else{
          apiDataError(res);
        }
      }else{
        res.status(401).send("Unauthorized");
      }
    }catch(err){
      apiError(res, 200)(err);
    }
  });

   app.get('/admin/export/users', csrfProtection, (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.redirect('/login');
    }
    var user_id = req.session.user.maphubsUser.id;
    Admin.checkAdmin(user_id).then((allowed) => {
      if(allowed && MAPHUBS_CONFIG.enableUserExport){
        return knex('users').select('id', 'email', 'email_valid', 'display_name')
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
          return res.status(200).send(userExport);
        });
      }else{
        return res.redirect('/login');
      }
    }).catch(nextError(next));

  });
};