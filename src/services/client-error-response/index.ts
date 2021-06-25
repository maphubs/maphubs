const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')(
  'clientError'
)

module.exports = {
  checkClientError(
    res: Record<string, any>,
    err: Record<string, any>,
    cb: (...args: Array<any>) => any,
    onSuccess: (...args: Array<any>) => any
  ) {
    if (err) {
      if (res) {
        if (res.body?.error) {
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
    } else if (res.body?.error) {
      debug.error(res.body.error)
      cb(res.body.error)
    } else {
      // assume success if no error code and no success flag is provided
      onSuccess(cb)
    }
  }
}