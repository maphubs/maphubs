/* @flow weak */
var passport = require('passport');
var oauth = require('../../services/oauth');
var oauth2 = require('../../services/oauth2');
var local = require('../../local');
var csrfProtection = require('csurf')({cookie: false});
var log = require('../../services/log');

module.exports = function(app) {

  //User login and account endpoints

  app.get('/login', csrfProtection, function(req, res) {
    if(req.query.returnTo) {
      req.session.returnTo = req.query.returnTo;
    }
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

  app.get('/login/failed', csrfProtection, function(req, res) {
    res.render('login', {
      title: req.__('Login') + ' - ' + MAPHUBS_CONFIG.productName,
      props: {
        name: MAPHUBS_CONFIG.productName,
        failed: true
      }, req
    });
  });
  app.post('/login', csrfProtection, passport.authenticate('local', {failureRedirect: '/login/failed'}), function(req, res) {

    //save the user to the session
    req.session.user = {
      id: req.user.id,
      display_name: req.user.display_name
    };

    //if there is a return page redirect otherwise go to home
    var url = '/';
    if(req.query.returnTo) {
      url = req.query.returnTo;
      log.info('query returnTo: ' + url);
    }

    return res.redirect(url);

  });

  // GET /auth/openstreetmap
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  The first step in OpenStreetMap authentication will involve redirecting
  //   the user to openstreetmap.org.  After authorization, OpenStreetMap will redirect the user
  //   back to this application at /auth/openstreetmap/callback
  app.get('/auth/openstreetmap',
    passport.authenticate('openstreetmap'),
    function() {
      // The request will be redirected to OpenStreetMap for authentication, so this
      // function will not be called.
    });

  // GET /auth/openstreetmap/callback
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  If authentication fails, the user will be redirected back to the
  //   login page.  Otherwise, the primary route function function will be called,
  //   which, in this example, will redirect the user to the home page.
  app.get('/auth/openstreetmap/callback',
    passport.authenticate('openstreetmap', {
      successReturnToOrRedirect: '/',
      failureRedirect: '/login'
    })
  );

  app.get('/oauth2/authorize', oauth2.authorization);
  app.post('/oauth2/dialog/authorize/decision', oauth2.decision);

  app.get('/oauth/authorize', oauth.userAuthorization);
  app.post('/dialog/authorize/decision', oauth.userDecision);

  app.post('/oauth2/token', oauth2.token);

  app.post('/oauth/request_token', oauth.requestToken);
  app.post('/oauth/access_token', oauth.accessToken);

};
