var log = require('./log');
module.exports = {

  apiError(res, code){
    return function(err){
      log.error(err);
      if(typeof err === 'object'){
        err = JSON.stringify(err);
      }
      res.status(code).send({success: false,error: err.toString()});
    };
  },

  nextError(next){
    return function(err){
      log.error(err);
      next(err);
    };
  },

  apiDataError(res, msg = "Bad Request: required data not found"){
    res.status(400).send({
      success: false,
      error: msg
    });
  },

  notAllowedError(res, type = ""){
    res.status(400).send({
      success: false,
      error: "Not allowed to modify " + type
    });
  },

  logRethrow(){
    return function(err){
      log.error(err);
      throw(err);
    };
  }
};
