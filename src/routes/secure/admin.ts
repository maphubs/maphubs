import Admin from '../../models/admin'
import {
  apiError,
  nextError,
  apiDataError
} from '../../services/error-response'

// var log = require('@bit/kriscarle.maphubs-utils.maphubs-utils.log');
export default function (app: any) {
  app.post('/admin/invite/send', async (req, res) => {
    try {
      const data = req.body

      if (req.isAuthenticated && req.isAuthenticated()) {
        const user_id = req.session.user.maphubsUser.id

        if (await Admin.checkAdmin(user_id)) {
          if (data && data.email) {
            res.status(200).send({
              success: true,
              key: await Admin.sendInviteEmail(data.email, req.__, undefined)
            })
          } else {
            apiDataError(res)
          }
        } else {
          res.status(401).send('Unauthorized')
        }
      } else {
        res.status(401).send('Unauthorized')
      }
    } catch (err) {
      apiError(res, 200)(err)
    }
  })

  app.post('/admin/invite/deauthorize', async (req, res) => {
    try {
      const data = req.body

      if (
        req.isAuthenticated &&
        req.isAuthenticated() &&
        (await Admin.checkAdmin(req.session.user.maphubsUser.id))
      ) {
        if (data && data.email && data.key) {
          await Admin.deauthorize(data.email, data.key)
          res.status(200).send({
            success: true
          })
        } else {
          apiDataError(res)
        }
      } else {
        res.status(401).send('Unauthorized')
      }
    } catch (err) {
      apiError(res, 200)(err)
    }
  })
}
