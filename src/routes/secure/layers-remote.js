// @flow
const Layer = require('../../models/layer')
const login = require('connect-ensure-login')
const Group = require('../../models/group')

const apiError = require('../../services/error-response').apiError
const nextError = require('../../services/error-response').nextError
const apiDataError = require('../../services/error-response').apiDataError
const notAllowedError = require('../../services/error-response').notAllowedError
const request = require('superagent')
const isAuthenticated = require('../../services/auth-check')

module.exports = function (app: any) {
  app.get('/createremotelayer', login.ensureLoggedIn(), async (req, res, next) => {
    try {
      const user_id = req.session.user.maphubsUser.id
      return res.render('createremotelayer', {
        title: req.__('Remote Layer') + ' - ' + MAPHUBS_CONFIG.productName,
        props: {
          groups: await Group.getGroupsForUser(user_id)
        },
        req
      })
    } catch (err) { nextError(next)(err) }
  })

  app.post('/api/layer/create/remote', isAuthenticated, async (req, res) => {
    try {
      if (req.body.group_id && req.body.layer && req.body.host) {
        if (await Group.allowedToModify(req.body.group_id, req.user_id)) {
          const result = await Layer.createRemoteLayer(req.body.group_id, req.body.layer, req.body.host, req.user_id)
          if (result) {
            return res.send({success: true, layer_id: result[0]})
          } else {
            return res.send({success: false, error: 'Failed to Create Layer'})
          }
        } else {
          return notAllowedError(res, 'layer')
        }
      } else {
        apiDataError(res)
      }
    } catch (err) { apiError(res, 500)(err) }
  })

  app.post('/api/layer/refresh/remote', isAuthenticated, async (req, res) => {
    try {
      if (req.body.layer_id) {
        if (await Layer.allowedToModify(req.body.layer_id, req.user_id)) {
          const layer = await Layer.getLayerByID(req.body.layer_id)
          if (layer.remote) {
            let url
            if (layer.remote_host === 'localhost') {
              url = 'http://'
            } else {
              url = 'https://'
            }
            url = url + layer.remote_host + '/api/layer/metadata/' + layer.remote_layer_id
            const response = await request.get(url)
            const result = await Layer.updateRemoteLayer(layer.layer_id, layer.owned_by_group_id, response.body.layer, layer.remote_host, req.user_id)
            if (result) {
              return res.send({success: true})
            } else {
              return res.send({success: false, error: 'Failed to Update Layer'})
            }
          } else {
            return res.send({success: false, error: 'Failed to Update Layer'})
          }
        } else {
          return notAllowedError(res, 'layer')
        }
      } else {
        apiDataError(res)
      }
    } catch (err) { apiError(res, 500)(err) }
  })
}
