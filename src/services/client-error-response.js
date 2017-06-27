// @flow
var debug = require('./debug')('clientError');

module.exports = {

  checkClientError(res: Object, err: Object, cb: Function, onSuccess: Function){
    if(err && res && res.body && res.body.error){
      debug.log(res.body.error);
      cb(res.body.error);
    }else if(err){
      debug.log(err.message);
      cb(err.message);
    }else if (res && res.body && res.body.success !== undefined && res.body.success === false){
      if(res.body.error){
        debug.log(res.body.error);
        cb(res.body.error);
      } else {
        debug.log('unknown error');
        cb('unknown error');
      }
    }else if(res.body.error){
      debug.log(res.body.error);
      cb(res.body.error);
    }else if(res.body.success){
      onSuccess(cb);
    }else { //assume success if no error code and no success flag is provided
      onSuccess(cb);
    }
  }
};
