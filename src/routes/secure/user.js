// @flow
var User = require('../../models/user');
var apiError = require('../../services/error-response').apiError;
var apiDataError = require('../../services/error-response').apiDataError;

var csrfProtection = require('csurf')({cookie: false});

module.exports = function(app: any) {

  app.get('/user/profile', csrfProtection, (req, res) => {

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
        return res.send({
          suggestions
        });
      }).catch(apiError(res, 500));
  });

};
