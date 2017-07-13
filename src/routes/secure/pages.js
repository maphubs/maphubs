var csrfProtection = require('csurf')({cookie: false});
var login = require('connect-ensure-login');
var Admin = require('../../models/admin');
var Page = require('../../models/page');
var nextError = require('../../services/error-response').nextError;
var apiError = require('../../services/error-response').apiError;
var apiDataError = require('../../services/error-response').apiDataError;

module.exports = function(app) {

  app.get('/page/edit/:id', csrfProtection, login.ensureLoggedIn(), (req, res, next) => {

    var user_id = req.session.user.maphubsUser.id;
    var page_id = req.params.id.toLowerCase();

    Admin.checkAdmin(user_id).then((isAdmin) => {
      if(isAdmin){
        return Page.getPageConfigs([page_id]).then((pageConfigs) => {
          var pageConfig = pageConfigs[page_id];
          return res.render('pageedit', {
            title: req.__('Edit Page') + ' - ' + MAPHUBS_CONFIG.productName,
            props: {page_id, pageConfig}, req});
          });
        }else{
          return res.redirect('/unauthorized');
        }
    }).catch(nextError(next));
  });

  app.post('/api/page/save', csrfProtection, (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.maphubsUser.id;
    var data = req.body;
    if (data && data.page_id && data.pageConfig) {
      Admin.checkAdmin(user_id).then((isAdmin) => {
        if(isAdmin){
          return Page.savePageConfig(data.page_id, data.pageConfig)
            .then((result) => {
              if (result && result === 1) {
                return res.send({
                  success: true
                });
              } else {
                return res.send({
                  success: false,
                  error: "Failed to Save Page"
                });
              }
            });
        }else{
          return res.status(401).send();
        }
      }).catch(apiError(res, 200));
    } else {
      apiDataError(res);
    }
  });

};
