// @flow
var User = require('../../models/user');
var Admin = require('../../models/admin');
var passport = require('passport');
var log = require('../../services/log');
var debug = require('../../services/debug')('routes/user');
var apiError = require('../../services/error-response').apiError;
var nextError = require('../../services/error-response').nextError;
var apiDataError = require('../../services/error-response').apiDataError;
var PasswordUtil = require('../../services/password-util');
//var request = require('superagent-bluebird-promise');
var local = require('../../local');
var csrfProtection = require('csurf')({cookie: false});

var mailchimp;
if(!local.mapHubsPro){
  var Mailchimp = require('mailchimp-api-v3');
  mailchimp = new Mailchimp(local.MAILCHIMP_API_KEY);
}


module.exports = function(app: any) {




if(local.useLocalAuth) {
  app.get('/user/passwordreset/:key', csrfProtection, (req, res) => {
    var passreset = req.params.key;
    return res.render('passwordreset', {title: req.__('Password Reset') + ' - ' + MAPHUBS_CONFIG.productName, props: {passreset}, req});
  });

  app.get('/signup', csrfProtection, (req, res) => {
    if(local.requireLogin || local.requireInvite){
      return res.redirect('/login');
    }else{
      return res.render('signup', {title: req.__('Sign Up') + ' - ' + MAPHUBS_CONFIG.productName, props: {}, req});
    }
  });

  app.get('/signup/invite/:key', csrfProtection, (req, res, next) => {

    var inviteKey = req.params.key;
    if(inviteKey){
      Admin.checkInviteKey(inviteKey)
      .then((valid) => {
        if(valid){
          return Admin.useInvite(inviteKey)
          .then((email) => {
            return res.render('signup', {title: req.__('Sign Up') + ' - ' + MAPHUBS_CONFIG.productName, props: {email, lockEmail: true, inviteKey}, req});
          });
        }else{
          return res.render('error', {
            title: req.__('Invalid Key'),
            props: {
              title: req.__('Invite Key Invalid'),
              error: req.__('The key used was invalid or has already been used. Please contact an administrator.'),
              url: req.url
            },
            req
          });
        }
      }).catch(nextError(next));
    }else{
      return res.redirect('/login');
    }
  });


  app.get('/user/emailconfirmation/:key', csrfProtection, (req, res, next) => {

    var key = req.params.key;

    User.checkEmailConfirmation(key)
    .then((valid) => {
      return res.render('emailconfirmation', {title: req.__('Email Confirmed') + ' - ' + MAPHUBS_CONFIG.productName, props: {valid}, req});
    }).catch(nextError(next));
  });

  //API endpoints

  app.post('/api/user/updatepassword', csrfProtection, (req, res) => {
    var data = req.body;
    if (req.isAuthenticated && req.isAuthenticated()) {
      //logged in, confirm that the requested user matches the session user
      var user_id = req.session.user.maphubsUser.id;
      if(!data.user_id || user_id !== data.user_id){
        res.status(401).send("Unauthorized");
        return;
      }
      PasswordUtil.updatePassword(data.user_id, data.password, true, req.__)
      .then(() => {
        res.status(200).send({success:true});
      }).catch(apiError(res, 200));
    }else {
      User.getUserWithResetKey(data.pass_reset)
      .then((user) => {
        if(user){
          PasswordUtil.updatePassword(user.id, data.password, true, req.__)
          .then(() => {
            res.status(200).send({success:true});
          }).catch(apiError(res, 200));
        } else {
          log.error('Missing or Invalid Reset Key: ' + data.pass_reset);
          res.status(200).send({success:false, error: 'The reset link has expired or may have already been used. Please go to Forgot Password and request another reset.'});
        }
      }).catch(apiError(res, 200));
    }
  });




 

  app.post('/api/user/forgotpassword', csrfProtection, (req, res) => {
    var data = req.body;
    PasswordUtil.forgotPassword(data.email, req.__)
    .then(() => {
      res.status(200).send({success:true});
    }).catch(apiError(res, 200));

  });


  app.post('/api/user/checkusernameavailable', csrfProtection, (req, res) => {
    var data = req.body;
    if (data && data.username) {
      User.checkUserNameAvailable(data.username)
        .then((result) => {
          res.status(200).send({
            success: true,
            available: result
          });
        }).catch(apiError(res, 200));
    } else {
      apiDataError(res);
    }
  });


  app.post('/api/user/signup', csrfProtection, (req, res, next) => {
    var data = req.body;

    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if((local.requireLogin || local.requireInvite) && !data.inviteKey){
      log.warn(`Unauthorized signup attempt from IP: ${ip} Email: ${data.email}`);
      return res.status(401).send(req.__('Unauthorized'));
    }
    if(data.email && data.name && data.username && data.password){
    //create user
    User.getUserByEmail(data.email).then((user) => {
      if(user){
        res.status(200).send({success:false, error: req.__('Email address already exists')});
        return;       
      }else{     
    return User.createUser(data.email, data.name, data.username, ip)
    .then((user_id) => {
    //set password
      return PasswordUtil.updatePassword(user_id, data.password, false, req.__)
      .then(() => {
        return User.sendConfirmationEmail(user_id, req.__)
          .then(() => {
            return User.sendNewUserAdminEmail(user_id)
            .then(() => {
              //automatically login the user to their new account
              passport.authenticate('local', (err, user, info) => {
                debug(info);
                if (err) { return next(err); }
                if (!user) { return res.redirect('/login'); }
                req.logIn(user, (err) => {
                  if (err) { return next(err); }
                  //save the user to the session
                  req.session.user = {
                    id: req.user.id,
                    display_name: req.user.display_name,
                    username: req.user.display_name,
                    email:  req.user.email
                  };

                  if(mailchimp && data.joinmailinglist){
                    log.info(`adding to mailing list: ${data.email}`);
                    mailchimp.post({
                        path: '/lists/' + local.MAILCHIMP_LIST_ID + '/members',
                        body: {
                          "email_address": data.email,
                          "status": "subscribed"
                        }
                      }, (err) => {
                        if(err){
                          log.error(err);
                          res.status(200).send({success:false, error: err});
                        }else{
                          res.status(200).send({success:true});
                        }
                      });
                  }else{
                    res.status(200).send({success:true});
                  }
                });
              })(req, res, next);

          });
        });
      });
      });
      }
    }).catch(apiError(res, 200));
    }else{
      apiDataError(res);
    }

  });

}else{
  //auth0 user actions
  app.get('/signup', csrfProtection, (req, res) => {
    if(local.requireLogin || local.requireInvite){
      return res.redirect('/login');
    }else{
      res.render('auth0login', {
      title: req.__('Sign Up') + ' - ' + MAPHUBS_CONFIG.productName,
      auth0: true,
      allowSignUp: !local.requireInvite,
      props: {
        AUTH0_CLIENT_ID: local.AUTH0_CLIENT_ID,
        AUTH0_DOMAIN: local.AUTH0_DOMAIN,
        AUTH0_CALLBACK_URL: local.AUTH0_CALLBACK_URL,
        initialScreen: 'signUp'
      }, req
    });
    }
  });

  app.get('/forgotpassword', csrfProtection, (req, res) => {
    res.render('auth0login', {
      title: req.__('Forget Password') + ' - ' + MAPHUBS_CONFIG.productName,
      auth0: true,
      allowSignUp: !local.requireInvite,
      props: {
        AUTH0_CLIENT_ID: local.AUTH0_CLIENT_ID,
        AUTH0_DOMAIN: local.AUTH0_DOMAIN,
        AUTH0_CALLBACK_URL: local.AUTH0_CALLBACK_URL,
        initialScreen: 'forgotPassword'
      }, req
    });
  });
}


 app.post('/api/user/setlocale', (req, res) => {
    var data = req.body;
    if(data.locale){
      req.session.locale = data.locale;
      req.setLocale(data.locale);
    }
    res.status(200).send({success: true});

  });

  app.post('/api/user/mailinglistsignup', csrfProtection, (req, res) => {
    var data = req.body;
    if(data.email){
      mailchimp.post({
          path: '/lists/' + local.MAILCHIMP_LIST_ID + '/members',
          body: {
            "email_address": data.email,
            "status": "subscribed"
          }
        }, (err) => {
          if(err){
            log.error(err);
            res.status(200).send({success:false, error: err});
          }else{
            res.status(200).send({success:true});
          }
        });
    }else{
      apiDataError(res);
    }

  });

  //can be used to dynamically check for login status, so should be public
  app.all('/api/user/details/json', (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(200).send({loggedIn: false, user: null});
      return;
    }else{
      var user_id = req.session.user.maphubsUser.id;
      User.getUser(user_id)
        .then((user) => {
          //remove sensitive content if present
          delete user.pass_crypt;
          delete user.pass_salt;
          delete user.creation_ip;
          return Admin.checkAdmin(user_id)
          .then((admin) => {
            user.admin = admin;
            res.status(200).send({loggedIn: true, user});
        });
        }).catch(apiError(res, 200));
    }
  });



};
