const csrfProtection = require('csurf')({cookie: false});
const login = require('connect-ensure-login');
const Admin = require('../../models/admin');
const Page = require('../../models/page');
const nextError = require('../../services/error-response').nextError;
const apiError = require('../../services/error-response').apiError;
const apiDataError = require('../../services/error-response').apiDataError;
const isAuthenticated = require('../../services/auth-check');

module.exports = function(app) {

  app.get('/page/edit/:id', csrfProtection, login.ensureLoggedIn(), async (req, res, next) => {
    try{
      const user_id = req.session.user.maphubsUser.id;
      const page_id = req.params.id.toLowerCase();

      if(await Admin.checkAdmin(user_id)){
        const pageConfigs = await Page.getPageConfigs([page_id]);
        const pageConfig = pageConfigs[page_id];
        return res.render('pageedit', {
          title: req.__('Edit Page') + ' - ' + MAPHUBS_CONFIG.productName,
          props: {page_id, pageConfig}, req});
      }else{
        return res.redirect('/unauthorized');
      }
    }catch(err){nextError(next)(err);}
  });

  app.post('/api/page/save', csrfProtection, isAuthenticated, async (req, res) => {
    try{
      const data = req.body;
      if(data && data.page_id && data.pageConfig) {
        if(await Admin.checkAdmin(req.user_id)){
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