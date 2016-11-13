var debug = require('./debug')('clientError');

module.exports = {

  checkClientError(res, err, cb, onSuccess){
    if(err && res && res.body && res.body.error){
      debug(res.body.error);
      cb(res.body.error);
    }else if(err){
      debug(err.message);
      cb(err.message);
    }else if (res && res.body && res.body.success !== undefined && res.body.success == false){
      if(res.body.error){
        debug(res.body.error);
        cb(res.body.error);
      } else {
        debug('unknown error');
        cb('unknown error');
      }
    }else if(res.body.error){
      debug(res.body.error);
      cb(res.body.error);
    }else if(res.body.success){
      onSuccess(cb);
    }else { //assume success if no error code and no success flag is provided
      onSuccess(cb);
    }
  }
};
