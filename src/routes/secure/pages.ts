import csurf from 'csurf'
import login from 'connect-ensure-login'
import Admin from '../../models/admin'
import Page from '../../models/page'
import {
  apiError,
  nextError,
  apiDataError
} from '../../services/error-response'
import isAuthenticated from '../../services/auth-check'
import pageOptions from '../../services/page-options-helper'
import local from '../../local'

const csrfProtection = csurf({
  cookie: false
})

export default function (app): void {
  app.get(
    '/admin/page/edit/:id',
    csrfProtection,
    login.ensureLoggedIn(),
    async (req, res, next) => {
      try {
        const user_id = req.session.user.maphubsUser.id
        const page_id = req.params.id.toLowerCase()

        if (await Admin.checkAdmin(user_id)) {
          const pageConfigs = await Page.getPageConfigs([page_id])
          const pageConfig = pageConfigs[page_id]
          return app.next.render(
            req,
            res,
            '/pageedit',
            await pageOptions(req, {
              title:
                req.__('Edit Page') +
                ' - ' +
                process.env.NEXT_PUBLIC_PRODUCT_NAME,
              props: {
                page_id,
                pageConfig
              }
            })
          )
        } else {
          return res.redirect('/unauthorized')
        }
      } catch (err) {
        nextError(next)(err)
      }
    }
  )
  app.get(
    '/admin/config',
    csrfProtection,
    login.ensureLoggedIn(),
    async (req, res, next) => {
      try {
        const user_id = req.session.user.maphubsUser.id

        if (await Admin.checkAdmin(user_id)) {
          const pageConfigs = await Page.getPageConfigs(['config'])
          const pageConfig = pageConfigs.config
          return app.next.render(
            req,
            res,
            '/configedit',
            await pageOptions(req, {
              title:
                req.__('Edit Config') +
                ' - ' +
                process.env.NEXT_PUBLIC_PRODUCT_NAME,
              props: {
                page_id: 'config',
                pageConfig
              }
            })
          )
        } else {
          return res.redirect('/unauthorized')
        }
      } catch (err) {
        nextError(next)(err)
      }
    }
  )
  app.get(
    '/admin/map',
    csrfProtection,
    login.ensureLoggedIn(),
    async (req, res, next) => {
      try {
        const user_id = req.session.user.maphubsUser.id

        if (await Admin.checkAdmin(user_id)) {
          const pageConfigs = await Page.getPageConfigs(['map'])
          const pageConfig = pageConfigs.map
          return app.next.render(
            req,
            res,
            '/configedit',
            await pageOptions(req, {
              title:
                req.__('Edit Map Config') +
                ' - ' +
                process.env.NEXT_PUBLIC_PRODUCT_NAME,
              props: {
                page_id: 'map',
                pageConfig
              }
            })
          )
        } else {
          return res.redirect('/unauthorized')
        }
      } catch (err) {
        nextError(next)(err)
      }
    }
  )
  app.post(
    '/api/page/save',
    csrfProtection,
    isAuthenticated,
    async (req, res) => {
      try {
        const data = req.body

        if (data && data.page_id && data.pageConfig) {
          if (await Admin.checkAdmin(req.user_id)) {
            const result = await Page.savePageConfig(
              data.page_id,
              data.pageConfig
            )

            return result
              ? res.send({
                  success: true
                })
              : res.send({
                  success: false,
                  error: 'Failed to Save Page'
                })
          } else {
            return res.status(401).send()
          }
        } else {
          apiDataError(res)
        }
      } catch (err) {
        apiError(res, 200)(err)
      }
    }
  )
}
