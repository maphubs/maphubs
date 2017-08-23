var Map = require('../models/map');
var log = require('./log');
var nextError = require('./error-response').nextError;
var apiDataError = require('./error-response').apiDataError;
var Promise = require('bluebird');
var check = async function(map_id, user_id){

  if(await Map.isPrivate(map_id)){
    if(user_id <= 0){
      return Promise.resolve(false); //don't hit the db again if we know the user isn't valid
    }else{
      return Promise.resolve(Map.allowedToModify(map_id, user_id));
    }
  }else{
    return Promise.resolve(true);
  }

};

var middleware = function(view) {
  return function(req, res, next){
    var user_id = -1;
    if(req.isAuthenticated && req.isAuthenticated() && req.session.user){
      user_id = req.session.user.maphubsUser.id;
    }
    var map_id;
    if(req.params.map_id){
      map_id = parseInt(req.params.map_id || '', 10);
    }else if(req.body.map_id){
      map_id = req.body.map_id;
    }else if(req.params.map){
      map_id =  parseInt(req.params.map || '', 10);
    }else if(req.params.id){
      map_id =  parseInt(req.params.id || '', 10);
    }else{
      apiDataError(res, 'Unable to determine hub_id');
    }

    if(map_id && Number.isInteger(map_id) && map_id > 0){
      check(map_id, user_id)
      .then((allowed) => {
        if(allowed){
          return next;
        }else{
          log.warn('Unauthorized attempt to access hub: ' + map_id);
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
      apiDataError(res, 'missing or invalid map_id');
    }
  };
};

module.exports = {

  check,
  middlewareView:  middleware(true),
  middleware: middleware(false)

};
