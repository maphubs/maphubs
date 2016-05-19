var forceSSL = require('express-force-ssl');

if(process.env.NODE_ENV == 'production'){
  module.exports = forceSSL;
}else{
  //return an empty middleware call
  module.exports = function(req, res, next){
    next();
  };
}
