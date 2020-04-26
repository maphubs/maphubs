const Map = require('../models/map')
const log = require('@bit/kriscarle.maphubs-utils.maphubs-utils.log')
const nextError = require('./error-response').nextError
const apiDataError = require('./error-response').apiDataError
const asyncHandler = require('express-async-handler')

const check = async (map_id, user_id) => {
  if (await Map.isPrivate(map_id)) {
    if (user_id <= 0) {
      return false // don't hit the db again if we know the user isn't valid
    } else {
      return Map.allowedToModify(map_id, user_id)
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
      let map_id
      if (req.params.map_id) {
        map_id = Number.parseInt(req.params.map_id, 10)
      } else if (req.body.map_id) {
        map_id = req.body.map_id
      } else if (req.params.map) {
        map_id = Number.parseInt(req.params.map, 10)
      } else if (req.params.id) {
        map_id = Number.parseInt(req.params.id, 10)
      } else {
        apiDataError(res, 'Unable to determine map_id')
      }

      if (map_id && Number.isInteger(map_id) && map_id > 0) {
        if (await check(map_id, user_id)) {
          next()
        } else {
          log.warn('Unauthorized attempt to access map: ' + map_id)
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
        apiDataError(res, 'missing or invalid map_id')
      }
    } catch (err) { nextError(next)(err) }
  })
}

module.exports = {

  check,
  middlewareView: middleware(true),
  middleware: middleware(false)

}
