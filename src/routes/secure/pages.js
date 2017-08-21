var csrfProtection = require('csurf')({cookie: false});
var login = require('connect-ensure-login');
var Admin = require('../../models/admin');
var Page = require('../../models/page');
var nextError = require('../../services/error-response').nextError;
var apiError = require('../../services/error-response').apiError;
var apiDataError = require('../../services/error-response').apiDataError;

module.exports = function(app) {

  app.get('/page/edit/:id', csrfProtection, login.ensureLoggedIn(), async (req, res, next) => {
    try{
      const user_id = req.session.user.maphubsUser.id;
      const page_id = req.params.id.toLowerCase();

      if(await Admin.checkAdmin(user_id)){
        const pageConfigs = await Page.getPageConfigs([page_id]);
        var pageConfig = pageConfigs[page_id];
        return res.render('pageedit', {
          title: req.__('Edit Page') + ' - ' + MAPHUBS_CONFIG.productName,
          props: {page_id, pageConfig}, req});
      }else{
        return res.redirect('/unauthorized');
      }
    }catch(err){nextError(next)(err);}
  });

  app.post('/api/page/save', csrfProtection, async (req, res) => {
    try{
    if(!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    const user_id = req.session.user.maphubsUser.id;
    const data = req.body;
    if(data && data.page_id && data.pageConfig) {
      if(await Admin.checkAdmin(user_id)){
        const result = await Page.savePageConfig(data.page_id, data.pageConfig);
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
      }else{
        return res.status(401).send();
      }
    } else {
      apiDataError(res);
    }
    }catch(err){apiError(res, 200)(err);}
  });

};
