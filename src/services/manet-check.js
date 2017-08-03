// @flow weak
var log = require('./log');
var local = require('../local');
var debug = require('../services/debug')('manet-check');
var Layer = require('../models/layer');
var Map = require('../models/map');

var check = function(req){
    //determine if this is the manet screenshot service

    //first check the cookie
    if(req.cookies) debug.log(JSON.stringify(req.cookies));
    if(!req.cookies || !req.cookies.manet || req.cookies.manet !== local.manetAPIKey){
      log.error('Manet Cookie Not Found');
      return false;
    }else{
      return true;
    }
  };

var failure = function(res){   
    return res.status(401).send("Unauthorized");
  };

  var success = function(next){
    next();
  };

var middlewareCheck = function(req, res, next){
  if(check(req)){
    return success(next);
  }else{
    return failure(res);
  }
};

var middleware = function(req: any, res: any, next: any){


  var user_id = -1;
  if(req.isAuthenticated && req.isAuthenticated() && req.session.user){
    user_id = req.session.user.maphubsUser.id;
  }
  var layer_id, map_id;
  if(req.params.layer_id){
    layer_id = parseInt(req.params.layer_id || '', 10);
  }else if(req.body.layer_id){
    layer_id = req.body.layer_id;
  }else if(req.params.map_id){
    map_id = parseInt(req.params.map_id || '', 10);
  }else if(req.body.map_id){
    map_id = req.body.map_id;
  }
    
  if(layer_id){
    //check if the layer is private
    Layer.getLayerByID(layer_id)
    .then((layer) => {
      //if layer is private, 
      if(layer.private){
        if(req.isAuthenticated && req.isAuthenticated()){
          // if there is a user session, the user must be allowed to edit
          return layer.allowedToModify(layer_id, user_id)
          .then((allowed) => {
            if(allowed){
              return success(next);
            }else{
              log.error('Unauthenticated screenshot request, not authorized to view private layer: ' + layer_id);
              return failure(res);
            }
          });
          }else{
            // else private but no session = check for manet
            return middlewareCheck(req, res, next);
          }
      }else{
        // else not private = allow if login not required, or login required and authenticated
        if(!local.requireLogin || (req.isAuthenticated && req.isAuthenticated())){
          return success(next);
        }else {
          //check for manet
          return middlewareCheck(req, res, next);
        }
      }
    }).catch(err=>{
       log.error(err);
     });
   }else if(map_id){
     Map.getMap(map_id)
     .then((map) => {
       if(map.private){
         if(req.isAuthenticated && req.isAuthenticated()){
           return map.allowedToModify(map_id, user_id)
            .then((allowed) => {
              if(allowed){
                return success(next);
              }else{
                log.error('Unauthenticated screenshot request, not authorized to view private map: ' + map_id);
                return failure(res);
              }
            });
         }else{
            // else private but no session = check for manet
            return middlewareCheck(req, res, next);
          }
       }else{
        // else not private = allow if login not required, or login required and authenticated
        if(!local.requireLogin || (req.isAuthenticated && req.isAuthenticated())){
          return success(next);
        }else {
          //check for manet
          return middlewareCheck(req, res, next);
        }
      }
     }).catch(err=>{
       log.error(err);
     });
   }else{
     if(!local.requireLogin || (req.isAuthenticated && req.isAuthenticated())){
          return success(next);
        }else {
          //check for manet
         middlewareCheck(req, res, next);
        }
   }
  
};

module.exports = {
  middleware,
  check
};
