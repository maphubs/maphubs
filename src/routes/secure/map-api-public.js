const Map = require('../../models/map')
const apiError = require('../../services/error-response').apiError
const csrfProtection = require('csurf')({cookie: false})
const apiDataError = require('../../services/error-response').apiDataError

module.exports = function (app: any) {
  app.post('/api/map/info/:map_id', csrfProtection, (req, res) => {
    if (req.body && req.body.map_id) {
      const map_id = req.body.map_id
      if (!req.isAuthenticated || !req.isAuthenticated() ||
      !req.session || !req.session.user) {
      // not logged in
        Map.isPrivate(map_id).then(isPrivate => {
          if (isPrivate) {
            res.status(200).send({success: false})
          } else {
            return Map.getMap(map_id)
              .then(map => {
                return Map.getMapLayers(map_id, false).then(layers => {
                  return res.status(200).send({success: true, map, layers})
                })
              })
          }
        }).catch(apiError(res, 500))
      } else {
      // logged in
        const user_id = req.session.user.maphubsUser.id
        Map.isPrivate(map_id).then(isPrivate => {
          return Map.allowedToModify(map_id, user_id)
            .then(allowed => {
              if (isPrivate && !allowed) {
                return res.status(200).send({success: false})
              } else {
                return Map.getMap(map_id)
                  .then(map => {
                    return Map.getMapLayers(map_id, allowed).then(layers => {
                      return res.status(200).send({success: true, map, layers})
                    })
                  })
              }
            })
        }).catch(apiError(res, 500))
      }
    } else {
      apiDataError(res)
    }
  })
}
