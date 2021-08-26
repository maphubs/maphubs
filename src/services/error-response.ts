import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'

const apiError = (
  res: any,
  code: number,
  userMessage?: string
): ((err: Error) => void) => {
  return function (err: Error) {
    log.error(err)

    //TODO: capture Sentry error

    let message = ''

    if (process.env.NODE_ENV === 'production') {
      message = userMessage ? userMessage : 'Server Error'
    } else {
      message = err.message ? err.message : err.toString()
    }

    res.status(code).send({
      success: false,
      error: message
    })
  }
}

const nextError = (
  next: (...args: Array<any>) => any
): ((err: Error) => void) => {
  return function (err: Error) {
    log.error(err)
    next(err)
  }
}

const apiDataError = (
  res: any,
  msg = 'Bad Request: required data not found'
): void => {
  res.status(400).send({
    success: false,
    error: msg
  })
}

const notAllowedError = (res: any, type = ''): void => {
  res.status(400).send({
    success: false,
    error: 'Not allowed to modify ' + type
  })
}

const logRethrow = (): ((err: Error) => any) => {
  return function (err: Error) {
    log.error(err)
    throw err
  }
}
export { apiError, nextError, apiDataError, notAllowedError, logRethrow }
