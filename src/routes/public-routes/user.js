// @flow
var User = require('../../models/user');
var Admin = require('../../models/admin');
var Group = require('../../models/group');
var log = require('../../services/log');
var apiError = require('../../services/error-response').apiError;
var nextError = require('../../services/error-response').nextError;
var apiDataError = require('../../services/error-response').apiDataError;
var local = require('../../local');
var csrfProtection = require('csurf')({cookie: false});

var mailchimp;
if(!local.mapHubsPro){
  var Mailchimp = require('mailchimp-api-v3');
  mailchimp = new Mailchimp(local.MAILCHIMP_API_KEY);
}


module.exports = function(app: any) {


 app.get('/signup/invite/:key', csrfProtection, (req, res, next) => {

    var inviteKey = req.params.key;
    if(inviteKey){
      Admin.checkInviteKey(inviteKey)
      .then((valid) => {
        if(valid){
          return Admin.useInvite(inviteKey)
          .then((email) => {
            return res.render('auth0invite', {
              title: req.__('Invite Confirmed') + ' - ' + MAPHUBS_CONFIG.productName, 
              props: {
                email, 
                inviteKey,
                AUTH0_CLIENT_ID: local.AUTH0_CLIENT_ID,
                AUTH0_DOMAIN: local.AUTH0_DOMAIN,
                AUTH0_CALLBACK_URL: local.AUTH0_CALLBACK_URL
              }, 
              req});
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

  app.get('/signup', csrfProtection, (req, res) => {
    if(local.requireLogin || local.requireInvite){
      return res.redirect('/login');
    }else{
      res.render('auth0login', {
      title: req.__('Sign Up') + ' - ' + MAPHUBS_CONFIG.productName,
      props: {
        AUTH0_CLIENT_ID: local.AUTH0_CLIENT_ID,
        AUTH0_DOMAIN: local.AUTH0_DOMAIN,
        AUTH0_CALLBACK_URL: local.AUTH0_CALLBACK_URL,
        initialScreen: 'signUp',
        allowSignUp: !local.requireInvite,
        allowLogin: false
      }, req
    });
    }
  });

  app.get('/forgotpassword', csrfProtection, (req, res) => {
    res.render('auth0login', {
      title: req.__('Forgot Password') + ' - ' + MAPHUBS_CONFIG.productName,
      props: {
        AUTH0_CLIENT_ID: local.AUTH0_CLIENT_ID,
        AUTH0_DOMAIN: local.AUTH0_DOMAIN,
        AUTH0_CALLBACK_URL: local.AUTH0_CALLBACK_URL,
        initialScreen: 'forgotPassword',
        allowSignUp: false
      }, req
    });
  });

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
  app.all('/api/user/details/json', async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(200).send({loggedIn: false, user: null});
      return;
    }else{
      try {
      var user_id = req.session.user.maphubsUser.id;

      const user = await User.getUser(user_id);

      //remove sensitive content if present
      delete user.pass_crypt;
      delete user.pass_salt;
      delete user.creation_ip;
      //add session content
      if(req.session.user && req.session.user._json){
        user.username = req.session.user._json.username;
        user.picture = req.session.user._json.picture;
      }

      const groups = await Group.getGroupsForUser(user_id);
      user.groups = groups;
          
      const admin = await Admin.checkAdmin(user_id);
      user.admin = admin;

      return res.status(200).send({loggedIn: true, user});

      }catch(err){apiError(res, 200)(err);}
    }
  });



};
