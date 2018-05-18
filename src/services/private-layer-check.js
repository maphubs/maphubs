const Layer = require('../models/layer')
const log = require('./log')
const nextError = require('./error-response').nextError
const apiDataError = require('./error-response').apiDataError
const asyncHandler = require('express-async-handler')

const check = async (layer_id, user_id) => {
  if (await Layer.isPrivate(layer_id)) {
    if (user_id <= 0) {
      return false // don't hit the db again if we know the user isn't valid
    } else {
      return Layer.allowedToModify(layer_id, user_id)
    }
  } else {
    return true
  }
}

const middleware = (view) => {
  return asyncHandler(async (req, res, next) => {
    try {
      let user_id = -1
      if (req.isAuthenticated && req.isAuthenticated() && req.session.user) {
        user_id = req.session.user.maphubsUser.id
      }
      let layer_id, shortid
      if (req.params.layer_id) {
        layer_id = parseInt(req.params.layer_id || '', 10)
      } else if (req.body.layer_id) {
        layer_id = req.body.layer_id
      } else if (req.params.id) {
        layer_id = parseInt(req.params.id || '', 10)
      } else {
        if (req.params.shortid) {
          shortid = req.params.shortid
        } else {
          apiDataError(res, 'Unable to determine layer_id')
        }
      }

      if (shortid) {
        const layer = await Layer.getLayerByShortID(shortid)
        layer_id = layer.layer_id
      } else if (!layer_id || !Number.isInteger(layer_id) || layer_id <= 0) {
        apiDataError(res, 'missing or invalid layer id')
      }

      if (await check(layer_id, user_id)) {
        next()
      } else {
        log.warn('Unauthorized attempt to access layer: ' + layer_id)
        if (view) {
          res.redirect('/unauthorized')
        } else {
          res.status(401).send({
            success: false,
            error: 'Unauthorized'
          })
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
