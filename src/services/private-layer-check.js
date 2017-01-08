var Layer = require('../models/layer');

var check = function(layer_id, user_id){
  return Layer.isPrivate(layer_id)
  .then(function(isPrivate){
    if(isPrivate){
      if(user_id <= 0){
        return false; //don't hit the db again if we know the user isn't valid
      }else{
        return Layer.allowedToModify(layer_id, user_id);
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

    if(layer_id && Number.isInteger(layer_id) && layer_id > 0){
      check(layer_id, user_id)
      .then(function(allowed){
        if(allowed){
          next();
        }else{
          log.warn('Unauthorized attempt to access layer: ' + layer_id);
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
      apiDataError(res, 'missing or invalid layer id');
    }
  };
};

module.exports = {

  check: check,
  middlewareView:  middleware(true),
  middleware: middleware(false)

};
