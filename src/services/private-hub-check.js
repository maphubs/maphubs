var Hub = require('../models/hub');
var log = require('./log');
var nextError = require('./error-response').nextError;
var apiDataError = require('./error-response').apiDataError;

var check = function(hub_id, user_id){
  return Hub.isPrivate(hub_id)
  .then((isPrivate) => {
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
      user_id = req.session.user.maphubsUser.id;
    }

    var hub_id;
    if(req.params.hub_id){
      hub_id = req.params.hub_id;
    }else if(req.body.hub_id){
      hub_id = req.body.hub_id;
    }else if(req.params.hub){
      hub_id =  req.params.hub;
    }else if(req.params.hubid){
      hub_id = req.params.hubid;
    }else{
     if(view){
       res.redirect('/notfound');
     }else{
       apiDataError(res, 'not found');
     }
      
    }

    if(hub_id){
      check(hub_id, user_id)
      .then((allowed) => {
        if(allowed){
          return next;
        }else{
          log.warn('Unauthorized attempt to access hub: ' + hub_id);
          if(view){
            return res.redirect('/unauthorized');
          }else{
            return res.status(401).send({
              success: false,
              error: "Unauthorized"
            });
          }
        }
      })
      .asCallback((err, result) => {  
        if(err){
          throw err;
        }else if(typeof result === 'function'){
          result();
        }
      })
      .catch(nextError(next));
    }else{
      if(view){
       res.redirect('/notfound');
      }else{
        apiDataError(res, 'not found');
      }
    }
  };
};

module.exports = {

  check,
  middlewareView:  middleware(true),
  middleware: middleware(false)

};
