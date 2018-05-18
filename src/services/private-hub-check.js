const Hub = require('../models/hub')
const log = require('./log')
const nextError = require('./error-response').nextError
const apiDataError = require('./error-response').apiDataError
const asyncHandler = require('express-async-handler')

const check = async (hub_id, user_id) => {
  if (await Hub.isPrivate(hub_id)) {
    if (user_id <= 0) {
      return false // don't hit the db again if we know the user isn't valid
    } else {
      return Hub.allowedToModify(hub_id, user_id)
    }
  } else {
    return true
  }
}

const middleware = function (view) {
  return asyncHandler(async (req, res, next) => {
    try {
      let user_id = -1
      if (req.isAuthenticated && req.isAuthenticated() && req.session.user) {
        user_id = req.session.user.maphubsUser.id
      }

      let hub_id
      if (req.params.hub_id) {
        hub_id = req.params.hub_id
      } else if (req.body.hub_id) {
        hub_id = req.body.hub_id
      } else if (req.params.hub) {
        hub_id = req.params.hub
      } else if (req.params.hubid) {
        hub_id = req.params.hubid
      } else {
        if (view) {
          res.redirect('/notfound')
        } else {
          apiDataError(res, 'not found')
        }
      }

      if (hub_id) {
        if (await check(hub_id, user_id)) {
          next()
        } else {
          log.warn('Unauthorized attempt to access hub: ' + hub_id)
          if (view) {
            res.redirect('/unauthorized')
          } else {
            res.status(401).send({
              success: false,
              error: 'Unauthorized'
            })
          }
        }
      } else {
        if (view) {
          res.redirect('/notfound')
        } else {
          apiDataError(res, 'not found')
        }
      }
    } catch (err) { nextError(next)(err) }
  })
}

module.exports = {

  check,
  middlewareView: middleware(true),
  middleware: middleware(false)

}
