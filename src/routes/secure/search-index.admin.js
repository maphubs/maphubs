var csrfProtection = require('csurf')({cookie: false});
var login = require('connect-ensure-login');
var Admin = require('../../models/admin');
var elasticClient = require('../../services/elasticsearch');
var SearchIndex = require('../../models/search-index');
var nextError = require('../../services/error-response').nextError;
var apiError = require('../../services/error-response').apiError;
//var apiDataError = require('../../services/error-response').apiDataError;
var knex = require('../../connection');

module.exports = app => {

  app.get('/admin/searchindex', csrfProtection, login.ensureLoggedIn(), (req, res, next) => {

    var user_id = req.session.user.maphubsUser.id;

    Admin.checkAdmin(user_id).then(isAdmin =>{
      if(isAdmin){ 
        return SearchIndex.indexExists().then(indexExistsResult => {
          let indexStatus = JSON.stringify(indexExistsResult);
          return elasticClient.testClient(error =>{
            let connectionStatus = 'Active';
            if(error) connectionStatus = error;
            res.render('searchindexadmin', {
              title: req.__('Search Index Admin') + ' - ' + MAPHUBS_CONFIG.productName,
              props: {connectionStatus, indexStatus}, req
            });
          });
        });
              
        }else{
          return res.redirect('/unauthorized');
        }
    }).catch(nextError(next));
  });

  app.post('/admin/searchindex/create', csrfProtection, async (req, res) => {  
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    const user_id = req.session.user.maphubsUser.id;
    try{
      const isAdmin = await Admin.checkAdmin(user_id);
      if(isAdmin){
        await SearchIndex.initIndex();
        return res.send({success: true});
      }else{
        return res.status(401).send();
      }
    }catch(err){apiError(res, 200)(err);}
  });

  app.post('/admin/searchindex/delete', csrfProtection, async (req, res) => {  
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    const user_id = req.session.user.maphubsUser.id;
    try{
      const isAdmin = await Admin.checkAdmin(user_id);
      if(isAdmin){
        await SearchIndex.deleteIndex();
        return res.send({success: true});
      }else{
        return res.status(401).send();
      }
    }catch(err){apiError(res, 200)(err);}
  });

  app.post('/admin/searchindex/rebuild/features', csrfProtection, async (req, res) => {  
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    const user_id = req.session.user.maphubsUser.id;
    try{
      const isAdmin = await Admin.checkAdmin(user_id);
      if(isAdmin){
        await SearchIndex.rebuildFeatures();
        return res.send({success: true});
      }else{
        return res.status(401).send();
      }
    }catch(err){apiError(res, 200)(err);}
  });


};
