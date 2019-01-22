// @flow
const Page = require('../models/page')
const nextError = require('./error-response').nextError
const csrfProtection = require('csurf')({cookie: false})
const renderCMSPage = require('./render-cms-page')
const log = require('@bit/kriscarle.maphubs-utils.maphubs-utils.log')

module.exports = async function (app: any) {
  const pageConfigs = await Page.getPageConfigs(['config'])

  if (pageConfigs.config && Array.isArray(pageConfigs.config) && pageConfigs.config.length > 0) {
    log.info('loading CMS pages')
    pageConfigs.config.forEach((page) => {
      log.info(`creating: ${page.path}`)
      app.get(page.path, csrfProtection, async (req, res, next) => {
        try {
          await renderCMSPage(app, page, req, res)
        } catch (err) { nextError(next)(err) }
      })
    })
  } else {
    log.info('No CMS pages found')
  }
}
