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

  app.post('/admin/searchindex/create', csrfProtection, (req, res) => {  
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.maphubsUser.id;
    Admin.checkAdmin(user_id).then(isAdmin => {
      if(isAdmin){
        return SearchIndex.initIndex().then(() =>{
          return res.send({success: true});
        });
      }else{
        return res.status(401).send();
      }
    }).catch(apiError(res, 200));
  });

  app.post('/admin/searchindex/delete', csrfProtection, (req, res) => {  
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.maphubsUser.id;
    Admin.checkAdmin(user_id).then(isAdmin => {
      if(isAdmin){
        return SearchIndex.deleteIndex().then(() =>{
          return res.send({success: true});
        });
      }else{
        return res.status(401).send();
      }
    }).catch(apiError(res, 200));
  });

  app.post('/admin/searchindex/rebuild/features', csrfProtection, (req, res) => {  
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.maphubsUser.id;
    knex.transaction((trx) => {
      return Admin.checkAdmin(user_id, trx).then(isAdmin => {
        if(isAdmin){
          return SearchIndex.rebuildFeatures(trx).then(() =>{
            return res.send({success: true});
          });
        }else{
          return res.status(401).send();
        }
      });
    }).catch(apiError(res, 200));
  });


};
