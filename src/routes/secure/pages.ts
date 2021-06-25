const csrfProtection = require('csurf')({
  cookie: false
})

const login = require('connect-ensure-login')

const Admin = require('../../models/admin')

const Page = require('../../models/page')

const nextError = require('../../services/error-response').nextError

const apiError = require('../../services/error-response').apiError

const apiDataError = require('../../services/error-response').apiDataError

const isAuthenticated = require('../../services/auth-check')

const pageOptions = require('../../services/page-options-helper')

module.exports = function (app) {
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
              title: req.__('Edit Page') + ' - ' + MAPHUBS_CONFIG.productName,
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
              title: req.__('Edit Config') + ' - ' + MAPHUBS_CONFIG.productName,
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
                req.__('Edit Map Config') + ' - ' + MAPHUBS_CONFIG.productName,
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

            if (result) {
              return res.send({
                success: true
              })
            } else {
              return res.send({
                success: false,
                error: 'Failed to Save Page'
              })
            }
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