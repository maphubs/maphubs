// @flow
var User = require('../../models/user');
var apiError = require('../../services/error-response').apiError;
var nextError = require('../../services/error-response').nextError;
var apiDataError = require('../../services/error-response').apiDataError;
var local = require('../../local');

var csrfProtection = require('csurf')({cookie: false});

module.exports = function(app: any) {

if(local.useLocalAuth){
  app.get('/user/profile', csrfProtection, (req, res, next) => {

    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.redirect('/login');
    }
    var user_id = req.session.user.maphubsUser.id;
    User.getUser(user_id)
      .then((user) => {
        res.render('usersettings', {title: req.__('User Profile') + ' - ' + MAPHUBS_CONFIG.productName, props: {user}, req});
      }).catch(nextError(next));
  });


  app.get('/user/pendingconfirmation', csrfProtection, (req, res, next) => {

    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.redirect('/login');
    }
    var user_id = req.session.user.maphubsUser.id;
    User.getUser(user_id)
      .then((user) => {
        res.render('pendingconfirmation', {title: req.__('Pending Confirmation') + ' - ' + MAPHUBS_CONFIG.productName, props: {user}, req});   
      }).catch(nextError(next));
  });


  app.post('/api/user/resendconfirmation', csrfProtection, (req, res) => {

    //must be logged in
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var uid = req.user.id;

    User.sendConfirmationEmail(uid, req.__)
    .then(() => {
        res.status(200).send({success:true});
    }).catch(apiError(res, 500));

  });

}else{
  //auth0 config

  app.get('/user/profile', csrfProtection, (req, res, next) => {

    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.redirect('/login');
    }

    var user = {
      username: req.session.user._json.username,
      email: req.session.user._json.email,
      picture: req.session.user._json.picture
    };

    res.render('auth0profile', {title: req.__('User Profile') + ' - ' + MAPHUBS_CONFIG.productName, props: {user}, req});
  });

}

  app.get('/api/user/search/suggestions', (req, res) => {
    if (!req.query.q) {
      apiDataError(res);
      return;
    }
    var q = req.query.q;
    User.getSearchSuggestions(q)
      .then((result) => {
        var suggestions = [];
        result.forEach((user) => {
          suggestions.push({key: user.id, value:user.display_name});
        });
        res.send({
          suggestions
        });
      }).catch(apiError(res, 500));

  });

};
