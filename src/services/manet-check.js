// @flow weak
var log = require('./log');
var local = require('../local');
var debug = require('../services/debug')('manet-check');
var dns = require('dns');
var url = require('url');
var Layer = require('../models/layer');
var Map = require('../models/map');

module.exports = function(allowForwardedIP: boolean){

return function(req: any, res: any, next: any){


  var user_id = -1;
  if(req.isAuthenticated && req.isAuthenticated() && req.session.user){
    user_id = req.session.user.id;
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
    
  var failure = function(){   
    return res.status(401).send("Unauthorized");
  };

  var success = function(){
    next();
  };

  var manetCheck = function(){
    //determine if this is the manet screenshot service

    //first check the cookie
    if(req.cookies) debug(JSON.stringify(req.cookies));
    if(!req.cookies || !req.cookies.manet || req.cookies.manet !== local.manetAPIKey){
      log.error('Manet Cookie Not Found');
      return failure();
    }

    //then check the IP
    var ip = req.connection.remoteAddress;
    var forwardedIP = req.headers['x-forwarded-for'];
    log.info('RemoteAddress:' + ip);
    log.info('x-forwarded-for:' + forwardedIP);
    var manetUrl: string = local.manetUrl;
    if(process.env.OMH_MANET_IP) {
       if(process.env.OMH_MANET_IP !== ip){
          //remoteAddress doesn't match
          if(allowForwardedIP && forwardedIP){
            //check forwarded address
            if(process.env.OMH_MANET_IP !== forwardedIP){
              log.error('Unauthenticated screenshot request, manet IP does not match');
              log.error('Expected IP:' + process.env.OMH_MANET_IP);
              return failure();
            }
          }else{
            log.error('Unauthenticated screenshot request, manet IP does not match');
            log.error(`Expected IP: ${process.env.OMH_MANET_IP}`);
            return failure();
          }
        }
        //IP Check passes
        return success();

    }else{
      var parsedUrl: Object = url.parse(manetUrl);
      var manetHost: string = parsedUrl.hostname;
      return dns.lookup(manetHost, (err: Error, addresses: any) => {
        if(err){
          log.error(err);
          return failure();
        }else if(!addresses){
          log.error("Failed to lookup manet addresses");
          return failure();
        }else{
          log.info('valid manet addresses:', addresses);
          if(!addresses.includes(ip)
          && !addresses.includes(forwardedIP) ){
            log.error('Unauthenticated screenshot request, manet IP does not match');
            return failure();
          }
        }

        //IP Check passes
        return success();

      });
    }
  };

  if(layer_id){
    //check if the layer is private
    Layer.getLayerByID(layer_id)
    .then((layer) => {
      //if layer is private, 
      if(layer.private){
        if(req.isAuthenticated && req.isAuthenticated()){
          // if there is a user session, the user must be allowed to edit
          layer.allowedToModify(layer_id, user_id)
          .then((allowed) => {
            if(allowed){
              return success();
            }else{
              log.error('Unauthenticated screenshot request, not authorized to view private layer: ' + layer_id);
              return failure();
            }
          });
          }else{
            // else private but no session = check for manet
            manetCheck();
          }
      }else{
        // else not private = allow if login not required, or login required and authenticated
        if(!local.requireLogin || (req.isAuthenticated && req.isAuthenticated())){
          return success();
        }else {
          //check for manet
          manetCheck();
        }
      }
    });
   }else if(map_id){
     Map.getMap(map_id)
     .then((map) => {
       if(map.private){
         if(req.isAuthenticated && req.isAuthenticated()){
           map.allowedToModify(map_id, user_id)
            .then((allowed) => {
              if(allowed){
                return success();
              }else{
                log.error('Unauthenticated screenshot request, not authorized to view private map: ' + map_id);
                return failure();
              }
            });
         }else{
            // else private but no session = check for manet
            manetCheck();
          }
       }else{
        // else not private = allow if login not required, or login required and authenticated
        if(!local.requireLogin || (req.isAuthenticated && req.isAuthenticated())){
          return success();
        }else {
          //check for manet
          manetCheck();
        }
      }
     });
   }else{
     if(!local.requireLogin || (req.isAuthenticated && req.isAuthenticated())){
          return success();
        }else {
          //check for manet
          manetCheck();
        }
   }
  
};
};
