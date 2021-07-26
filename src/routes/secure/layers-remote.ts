import Layer from '../../models/layer'
import login from 'connect-ensure-login'
import Group from '../../models/group'
import {
  apiError,
  nextError,
  apiDataError,
  notAllowedError
} from '../../services/error-response'
import request from 'superagent'
import isAuthenticated from '../../services/auth-check'
import pageOptions from '../../services/page-options-helper'
import local from '../../local'

export default function (app: any): void {
  app.get(
    '/createremotelayer',
    login.ensureLoggedIn(),
    async (req, res, next) => {
      try {
        const user_id = req.session.user.maphubsUser.id
        return app.next.render(
          req,
          res,
          '/createremotelayer',
          await pageOptions(req, {
            title:
              req.__('Remote Layer') +
              ' - ' +
              process.env.NEXT_PUBLIC_PRODUCT_NAME,
            props: {
              groups: await Group.getGroupsForUser(user_id)
            }
          })
        )
      } catch (err) {
        nextError(next)(err)
      }
    }
  )
  app.post('/api/layer/create/remote', isAuthenticated, async (req, res) => {
    try {
      if (req.body.group_id && req.body.layer && req.body.host) {
        if (await Group.allowedToModify(req.body.group_id, req.user_id)) {
          const result = await Layer.createRemoteLayer(
            req.body.group_id,
            req.body.layer,
            req.body.host,
            req.user_id
          )

          return result
            ? res.send({
                success: true,
                layer_id: result[0]
              })
            : res.send({
                success: false,
                error: 'Failed to Create Layer'
              })
        } else {
          return notAllowedError(res, 'layer')
        }
      } else {
        apiDataError(res)
      }
    } catch (err) {
      apiError(res, 500)(err)
    }
  })
  app.post('/api/layer/refresh/remote', isAuthenticated, async (req, res) => {
    try {
      if (req.body.layer_id) {
        if (await Layer.allowedToModify(req.body.layer_id, req.user_id)) {
          const layer = await Layer.getLayerByID(req.body.layer_id)

          if (layer && layer.remote) {
            let url

            url = layer.remote_host === 'localhost' ? 'http://' : 'https://'

            url =
              url +
              layer.remote_host +
              '/api/layer/metadata/' +
              layer.remote_layer_id
            const response = await request.get(url)
            const result = await Layer.updateRemoteLayer(
              layer.layer_id,
              layer.owned_by_group_id,
              response.body.layer,
              layer.remote_host,
              req.user_id
            )

            return result
              ? res.send({
                  success: true
                })
              : res.send({
                  success: false,
                  error: 'Failed to Update Layer'
                })
          } else {
            return res.send({
              success: false,
              error: 'Failed to Update Layer'
            })
          }
        } else {
          return notAllowedError(res, 'layer')
        }
      } else {
        apiDataError(res)
      }
    } catch (err) {
      apiError(res, 500)(err)
    }
  })
}
