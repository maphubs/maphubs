var csrfProtection = require('csurf')({cookie: false});
var login = require('connect-ensure-login');
var Admin = require('../../models/admin');
var elasticClient = require('../../services/elasticsearch');
var SearchIndex = require('../../models/search-index');
var nextError = require('../../services/error-response').nextError;
var apiError = require('../../services/error-response').apiError;
//var apiDataError = require('../../services/error-response').apiDataError;

module.exports = app => {

  app.get('/admin/searchindex', csrfProtection, login.ensureLoggedIn(), (req, res, next) => {

    var user_id = req.session.user.id;

    Admin.checkAdmin(user_id).then(isAdmin =>{
      if(isAdmin){ 
        return SearchIndex.indexExists().then(indexExistsResult => {
          let indexStatus = JSON.stringify(indexExistsResult);
          elasticClient.testClient(error =>{
            let connectionStatus = 'Active';
            if(error) connectionStatus = error;
            res.render('searchindexadmin', {
              title: req.__('Search Index Admin') + ' - ' + MAPHUBS_CONFIG.productName,
              props: {connectionStatus, indexStatus}, req
            });
          });
        });
              
        }else{
          res.redirect('/unauthorized');
        }
    }).catch(nextError(next));
  });

  app.post('/admin/searchindex/create', csrfProtection, (req, res) => {  
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    Admin.checkAdmin(user_id).then(isAdmin => {
      if(isAdmin){
        return SearchIndex.initIndex().then(() =>{
          res.send({success: true});
        });
      }else{
        res.status(401).send();
      }
    }).catch(apiError(res, 200));
  });

  app.post('/admin/searchindex/rebuild/features', csrfProtection, (req, res) => {  
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    Admin.checkAdmin(user_id).then(isAdmin => {
      if(isAdmin){
        return SearchIndex.rebuildFeatures().then(() =>{
          res.send({success: true});
        });
      }else{
        res.status(401).send();
      }
    }).catch(apiError(res, 200));
  });


};
