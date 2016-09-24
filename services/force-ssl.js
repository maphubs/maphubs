var forceSSL = require('express-force-ssl');
var local = require('../local');

if(process.env.NODE_ENV == 'production' && !local.mapHubsPro){
  module.exports = forceSSL;
}else{
  //return an empty middleware call
  module.exports = function(req, res, next){
    next();
  };
}
