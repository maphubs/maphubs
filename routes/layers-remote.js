var Layer = require('../models/layer');
var login = require('connect-ensure-login');
var Group = require('../models/group');

var apiError = require('../services/error-response').apiError;
var nextError = require('../services/error-response').nextError;
var apiDataError = require('../services/error-response').apiDataError;
var notAllowedError = require('../services/error-response').notAllowedError;


module.exports = function(app) {


  app.get('/createremotelayer', login.ensureLoggedIn(), function(req, res, next) {

    var user_id = req.session.user.id;

    Group.getGroupsForUser(user_id)
    .then(function(result){
      res.render('createremotelayer', {title: req.__('Remote Layer') + ' - MapHubs', props: {groups: result}, req});
    }).catch(nextError(next));

  });

  app.post('/api/layer/create/remote', function(req, res) {

    if (!req.isAuthenticated || !req.isAuthenticated()
        || !req.session || !req.session.user) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }

    var user_id = req.session.user.id;
    if(req.body.group_id && req.body.layer && req.body.host){
      Group.allowedToModify(req.body.group_id, user_id)
      .then(function(allowed){
        if(allowed){
          return Layer.createRemoteLayer(req.body.group_id, req.body.layer, req.body.host, user_id)
          .then(function(result){
            if(result){
              res.send({success:true, layer_id: result[0]});
            }else {
              res.send({success:false, error: "Failed to Create Layer"});
            }
          });
        }else{
          notAllowedError(res, 'layer');
        }
      }).catch(apiError(res, 500));
    }else{
      apiDataError(res);
    }

  });


};
