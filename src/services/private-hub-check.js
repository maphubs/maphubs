var Hub = require('../models/hub');
var log = require('./log');
var nextError = require('./error-response').nextError;
var apiDataError = require('./error-response').apiDataError;

var check = function(hub_id, user_id){
  return Hub.isPrivate(hub_id)
  .then(function(isPrivate){
    if(isPrivate){
      if(user_id <= 0){
        return false; //don't hit the db again if we know the user isn't valid
      }else{
        return Hub.allowedToModify(hub_id, user_id);
      }
    }else{
      return true;
    }
  });
};

var middleware = function(view) {
  return function(req, res, next){
    var user_id = -1;
    if(req.isAuthenticated && req.isAuthenticated() && req.session.user){
      user_id = req.session.user.id;
    }
    var hub_id;
    if(req.params.hub_id){
      hub_id = parseInt(req.params.hub_id || '', 10);
    }else if(req.body.hub_id){
      hub_id = req.body.hub_id;
    }else if(req.params.hub){
      hub_id =  parseInt(req.params.hub || '', 10);
    }else if(req.params.hubid){
      hub_id =  parseInt(req.params.hubid || '', 10);
    }else{
      apiDataError(res, 'Unable to determine hub_id');
    }

    if(hub_id){
      check(hub_id, user_id)
      .then(function(allowed){
        if(allowed){
          next();
        }else{
          log.warn('Unauthorized attempt to access hub: ' + hub_id);
          if(view){
            res.redirect('/unauthorized');
          }else{
            res.status(401).send({
              success: false,
              error: "Unauthorized"
            });
          }
        }
      }).catch(nextError(next));
    }else{
      apiDataError(res, 'missing or invalid hub_id');
    }
  };
};

module.exports = {

  check: check,
  middlewareView:  middleware(true),
  middleware: middleware(false)

};
