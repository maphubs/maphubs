import Debug from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'

const debug = Debug('clientError')

const checkClientError = (
  res: any,
  err: Error,
  cb: (error?: Error) => void,
  onSuccess: (cb: (err?: Error) => void) => void
): void => {
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
export { checkClientError }
