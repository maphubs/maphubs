var Layer = require('../models/layer');
var log = require('./log');
var nextError = require('./error-response').nextError;
var apiDataError = require('./error-response').apiDataError;

var check = function(layer_id, user_id){
  return Layer.isPrivate(layer_id)
  .then((isPrivate) => {
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
      user_id = req.session.user.maphubsUser.id;
    }
    var layer_id, shortid;
    if(req.params.layer_id){
      layer_id = parseInt(req.params.layer_id || '', 10);
    }else if(req.body.layer_id){
      layer_id = req.body.layer_id;
    }else if(req.params.id){
      layer_id =  parseInt(req.params.id || '', 10);
    }else{
      if(req.params.shortid){
        shortid = req.params.shortid;
      }else{
        apiDataError(res, 'Unable to determine layer_id');
      }
      
    }
    if(shortid){
      Layer.getLayerByShortID(shortid)
    .then((layer) => {
      return check(layer.layer_id, user_id)
      .then((allowed) => {
        if(allowed){
          return next;
        }else{
          log.warn('Unauthorized attempt to access layer: ' + layer_id);
          if(view){
            return res.redirect('/unauthorized');
          }else{
            return res.status(401).send({
              success: false,
              error: "Unauthorized"
            });
          }
        }
      });
    })
    .asCallback((err, result) => {  
        if(err){
          throw err;
        }else if(typeof result === 'function'){
          result();
        }
      })
    .catch(nextError(next));
    }else if(layer_id && Number.isInteger(layer_id) && layer_id > 0){
      check(layer_id, user_id)
      .then((allowed) => {
        if(allowed){
          return next;
        }else{
          log.warn('Unauthorized attempt to access layer: ' + layer_id);
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
      apiDataError(res, 'missing or invalid layer id');
    }
  };
};

module.exports = {
  check,
  middlewareView: middleware(true),
  middleware: middleware(false)
};
