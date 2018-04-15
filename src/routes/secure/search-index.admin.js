// @flow
const csrfProtection = require('csurf')({cookie: false})
const Admin = require('../../models/admin')
const elasticClient = require('../../services/elasticsearch')
const SearchIndex = require('../../models/search-index')
const nextError = require('../../services/error-response').nextError
const apiError = require('../../services/error-response').apiError
const isAuthenticated = require('../../services/auth-check')
const pageOptions = require('../../services/page-options-helper')

module.exports = (app: any) => {
  app.get('/admin/searchindex', csrfProtection, isAuthenticated, async (req, res, next) => {
    try {
      if (await Admin.checkAdmin(req.user_id)) {
        const indexExistsResult = await SearchIndex.indexExists()
        const indexStatus = JSON.stringify(indexExistsResult)
        return elasticClient.testClient(async (error) => {
          let connectionStatus = 'Active'
          if (error) connectionStatus = error
          app.next.render(req, res, '/searchindexadmin', await pageOptions(req, {
            title: req.__('Search Index Admin') + ' - ' + MAPHUBS_CONFIG.productName,
            props: {connectionStatus, indexStatus}
          }))
        })
      } else {
        return res.redirect('/unauthorized')
      }
    } catch (err) { nextError(next)(err) }
  })

  app.post('/admin/searchindex/create', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      if (await Admin.checkAdmin(req.user_id)) {
        await SearchIndex.initIndex()
        return res.send({success: true})
      } else {
        return res.status(401).send()
      }
    } catch (err) { apiError(res, 200)(err) }
  })

  app.post('/admin/searchindex/delete', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      if (await Admin.checkAdmin(req.user_id)) {
        await SearchIndex.deleteIndex()
        return res.send({success: true})
      } else {
        return res.status(401).send()
      }
    } catch (err) { apiError(res, 200)(err) }
  })

  app.post('/admin/searchindex/rebuild/features', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      if (await Admin.checkAdmin(req.user_id)) {
        await SearchIndex.rebuildFeatures()
        return res.send({success: true})
      } else {
        return res.status(401).send()
      }
    } catch (err) { apiError(res, 200)(err) }
  })
}
