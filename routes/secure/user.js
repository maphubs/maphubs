/* @flow weak */

var User = require('../../models/user');

var apiError = require('../../services/error-response').apiError;
var nextError = require('../../services/error-response').nextError;
var apiDataError = require('../../services/error-response').apiDataError;

var csrfProtection = require('csurf')({cookie: false});

module.exports = function(app) {


  app.get('/user/settings', csrfProtection, function(req, res, next) {

    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.redirect('/login');
    }
    var user_id = req.session.user.id;
    User.getUser(user_id)
      .then(function(user){
        res.render('usersettings', {title: req.__('User Settings') + ' - ' + MAPHUBS_CONFIG.productName, props: {user}, req});
      }).catch(nextError(next));
  });


  app.get('/user/pendingconfirmation', csrfProtection, function(req, res, next) {

    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.redirect('/login');
    }
    var user_id = req.session.user.id;
    User.getUser(user_id)
      .then(function(user){
        res.render('pendingconfirmation', {title: req.__('Pending Confirmation') + ' - ' + MAPHUBS_CONFIG.productName, props: {user}, req});
      }).catch(nextError(next));
  });


  app.post('/api/user/resendconfirmation', csrfProtection, function(req, res) {

    //must be logged in
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var uid = req.user.id;

    User.sendConfirmationEmail(uid)
    .then(function(){
        res.status(200).send({success:true});
    }).catch(apiError(res, 500));

  });

  app.get('/api/user/search/suggestions', function(req, res) {
    if (!req.query.q) {
      apiDataError(res);
      return;
    }
    var q = req.query.q;
    User.getSearchSuggestions(q)
      .then(function(result) {
        var suggestions = [];
        result.forEach(function(user) {
          suggestions.push({key: user.id, value:user.display_name});
        });
        res.send({
          suggestions
        });
      }).catch(apiError(res, 500));

  });

};
