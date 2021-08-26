import Debug from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'

const debug = Debug('clientError')

const checkClientError = ({
  res,
  err,
  onError,
  onSuccess
}: {
  res: { body?: { error?: string } }
  err: Error
  onError?: (error?: Error | string) => void
  onSuccess?: () => void
}): void => {
  if (err) {
    if (res) {
      if (res.body?.error) {
        debug.error(res.body.error)
        if (onError) onError(res.body.error)
      }
    } else {
      if (err.message) {
        debug.log(err.message)
        if (onError) onError(err.message)
      } else {
        debug.error(err.toString())
        if (onError) onError(err.toString())
      }
    }
  } else if (res.body?.error) {
    debug.error(res.body.error)
    if (onError) onError(res.body.error)
  } else {
    // assume success if no error code and no success flag is provided
    if (onSuccess) onSuccess()
  }
}
export { checkClientError }
