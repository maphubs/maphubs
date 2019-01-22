// @flow
const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('clientError')

module.exports = {

  checkClientError (res: Object, err: Object, cb: Function, onSuccess: Function) {
    if (err) {
      if (res) {
        if (res.body && res.body.error) {
          debug.error(res.body.error)
          cb(res.body.error)
        }
      } else {
        if (err.message) {
          debug.log(err.message)
          cb(err.message)
        } else {
          debug.error(err.toString())
          cb(err.toString())
        }
      }
    } else if (res) {
      if (res.body) {
        if (res.body.error) {
          debug.error(res.body.error)
          cb(res.body.error)
        } else if (res.body.success) {
          onSuccess(cb)
        } else {
        // assume success if no error code and no success flag is provided
          onSuccess(cb)
        }
      } else {
      // assume success if no error code and no success flag is provided
        onSuccess(cb)
      }
    } else {
      // assume success if no error code and no success flag is provided
      onSuccess(cb)
    }
  }
}
