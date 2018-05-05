// @flow
const log = require('./log')
const Raven = require('raven')
module.exports = {

  apiError (res: any, code: number, userMessage?: string) {
    return function (err: Error) {
      log.error(err)
      if (Raven && Raven.isSetup && Raven.isSetup()) {
        Raven.captureException(err)
      }

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
      res.status(code).send({success: false, error: message})
    }
  },

  nextError (next: Function) {
    return function (err: Error) {
      log.error(err)
      next(err)
    }
  },

  apiDataError (res: any, msg: string = 'Bad Request: required data not found') {
    res.status(400).send({
      success: false,
      error: msg
    })
  },

  notAllowedError (res: any, type: string = '') {
    res.status(400).send({
      success: false,
      error: 'Not allowed to modify ' + type
    })
  },

  logRethrow () {
    return function (err: Error) {
      log.error(err)
      throw (err)
    }
  }
}
