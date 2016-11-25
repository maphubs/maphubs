var log = require('./log');
module.exports = {

  apiError(res, code, userMessage){
    return function(err){
      log.error(err);
      if(typeof err === 'object'){
        err = JSON.stringify(err);
      }
      var message = '';
      if(process.env.NODE_ENV === 'production'){
        if(userMessage){
          message = userMessage;
        }else{
          message = res.__('Server Error');
        }      
      }else {
        message = err.toString();
      }
      res.status(code).send({success: false,error: message});
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
