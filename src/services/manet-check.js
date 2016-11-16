var log = require('./log');
var local = require('../local');


module.exports = function(setCors=false, allowForwardedIP=false){

return function(req, res, next){

  var failure = function(){
    if(setCors) res.header('Access-Control-Allow-Origin', local.host);
    return res.status(401).send("Unauthorized");
  };
  var success = function(){
    if(setCors) res.header('Access-Control-Allow-Origin', '*');
    next();
  };

  if(!local.requireLogin){
    return success();
  }

  if(req.isAuthenticated && req.isAuthenticated()){
    //allow authenticated request, but since this a require user restrict CORS
    if(setCors) res.header('Access-Control-Allow-Origin', local.host);
    next();
  }else{
    //determine if this is the manet screenshot service

    //first check the cookie
    if(!req.cookies || !req.cookies.manet || req.cookies.manet !== local.manetAPIKey){
      log.error('Manet Cookie Not Found');
      return failure();
    }

    //then check the IP
    var ip = req.connection.remoteAddress;
    var forwardedIP = req.headers['x-forwarded-for'];
    log.error('RemoteAddress:' + ip);
    log.error('x-forwarded-for:' + forwardedIP);
    var manetUrl = local.manetUrl;
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
            log.error('Expected IP:' + process.env.OMH_MANET_IP);
            return failure();
          }
        }
        //IP Check passes
        return success();

    }else{
      var manetHost = require('url').parse(manetUrl).hostname;
      return require('dns').lookup(manetHost, function(err, addresses) {
        if(err){
          log.error(err);
          return failure();
        }else if(!Array.isArray(addresses)){
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
  }
};
};
