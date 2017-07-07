// @flow
var passport = require('passport');
var local = require('../../local');
var csrfProtection = require('csurf')({cookie: false});
//var log = require('../../services/log');
var urlencode = require('urlencode');

module.exports = function(app: any) {

  function checkReturnTo(req, res, next) {
    var returnTo = req.query['returnTo'];
    if (returnTo) {
      // Maybe unnecessary, but just to be sure.
      req.session = req.session || {};
      
      // Set returnTo to the absolute path you want to be redirect to after the authentication succeeds.
      req.session.returnTo = urlencode.decode(returnTo);
    }
    next();
  }

  //User login and account endpoints
if(local.useLocalAuth){
  app.get('/login', checkReturnTo, csrfProtection, (req, res) => {
    
    var showSignup = true;
    if(local.requireLogin || local.requireInvite){
      showSignup = false;
    }
    res.render('login', {
      title: req.__('Login') + ' - ' + MAPHUBS_CONFIG.productName,
      props: {
        name: MAPHUBS_CONFIG.productName,
        showSignup
      },
      req
    });
  });

  app.get('/login/failed', checkReturnTo, csrfProtection, (req, res) => {
    res.render('login', {
      title: req.__('Login') + ' - ' + MAPHUBS_CONFIG.productName,
      props: {
        name: MAPHUBS_CONFIG.productName,
        failed: true
      }, req
    });
  });
  app.post('/login', csrfProtection, passport.authenticate('local', {failureRedirect: '/login/failed'}), (req, res) => {

    //save the user to the session
    req.session.user = {
      id: req.user.id,
      display_name: req.user.display_name,
      username: req.user.display_name,
      email: req.user.email,
      maphubsUser: req.user
    };

    return res.redirect(req.session.returnTo || '/');

  });
}else{
  //Auth0
  app.get('/login', checkReturnTo,
  (req, res) => {
    res.render('auth0login', {
      title: req.__('Login') + ' - ' + MAPHUBS_CONFIG.productName,
      auth0: true,
      allowSignUp: !local.requireInvite,
      props: {
        AUTH0_CLIENT_ID: local.AUTH0_CLIENT_ID,
        AUTH0_DOMAIN: local.AUTH0_DOMAIN,
        AUTH0_CALLBACK_URL: local.AUTH0_CALLBACK_URL
      }, req
    });
  });

  // Perform the final stage of authentication and redirect to '/user'
  app.get('/callback',
  passport.authenticate('auth0', {failureRedirect: '/login/failed'}),
  (req, res) => {

    req.session.user = req.user;
    if(req.session.returnTo === '/public/auth0login.css'){
      req.session.returnTo = '';
    }

    res.redirect(req.session.returnTo || '/');
  });

  app.get('/login/failed', (req, res) => {
    res.render('auth0error', {
      title: req.__('Login Failed') + ' - ' + MAPHUBS_CONFIG.productName,
      props: {
        requireInvite: local.requireInvite,
        adminEmail: local.adminEmail
      }, req
    });
  });
}

};
