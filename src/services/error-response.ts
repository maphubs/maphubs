const log = require('@bit/kriscarle.maphubs-utils.maphubs-utils.log')

module.exports = {
  apiError(res: any, code: number, userMessage?: string): (err: Error) => void {
    return function (err: Error) {
      log.error(err)

      //TODO: capture Sentry error

      let message = ''

      if (process.env.NODE_ENV === 'production') {
        if (userMessage) {
          message = userMessage
        } else {
          message = 'Server Error'
        }
      } else {
        if (err.message) {
          message = err.message
        } else {
          message = err.toString()
        }
      }

      res.status(code).send({
        success: false,
        error: message
      })
    }
  },

  nextError(next: (...args: Array<any>) => any): (err: Error) => void {
    return function (err: Error) {
      log.error(err)
      next(err)
    }
  },

  apiDataError(res: any, msg: string = 'Bad Request: required data not found') {
    res.status(400).send({
      success: false,
      error: msg
    })
  },

  notAllowedError(res: any, type: string = '') {
    res.status(400).send({
      success: false,
      error: 'Not allowed to modify ' + type
    })
  },

  logRethrow(): (err: Error) => any {
    return function (err: Error) {
      log.error(err)
      throw err
    }
  }
}
