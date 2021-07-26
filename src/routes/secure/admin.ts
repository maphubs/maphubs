import Admin from '../../models/admin'
import csurf from 'csurf'
import {
  apiError,
  nextError,
  apiDataError
} from '../../services/error-response'
import knex from '../../connection'
import pageOptions from '../../services/page-options-helper'
import local from '../../local'

const csrfProtection = csurf({
  cookie: false
})

// var log = require('@bit/kriscarle.maphubs-utils.maphubs-utils.log');
export default function (app: any) {
  app.get('/admin/manage', csrfProtection, async (req, res, next) => {
    try {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.redirect('/login')
      }

      return (await Admin.checkAdmin(req.session.user.maphubsUser.id))
        ? app.next.render(
            req,
            res,
            '/adminuserinvite',
            await pageOptions(req, {
              title:
                req.__('Manage Users') +
                ' - ' +
                process.env.NEXT_PUBLIC_PRODUCT_NAME,
              props: {
                members: await Admin.getMembers()
              }
            })
          )
        : res.redirect('/login')
    } catch (err) {
      nextError(next)(err)
    }
  })
  app.post('/admin/invite/send', csrfProtection, async (req, res) => {
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
  app.post('/admin/invite/resend', csrfProtection, async (req, res) => {
    try {
      const data = req.body

      if (req.isAuthenticated && req.isAuthenticated()) {
        const user_id = req.session.user.maphubsUser.id

        if (await Admin.checkAdmin(user_id)) {
          if (data && data.key) {
            res.status(200).send({
              success: true,
              key: await Admin.resendInvite(data.key, req.__)
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
  app.post('/admin/invite/deauthorize', csrfProtection, async (req, res) => {
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
