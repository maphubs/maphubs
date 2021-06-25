const Page = require('../models/page')

const nextError = require('./error-response').nextError

const csrfProtection = require('csurf')({
  cookie: false
})

const renderCMSPage = require('./render-cms-page')

const log = require('@bit/kriscarle.maphubs-utils.maphubs-utils.log')

module.exports = async function (app: any): Promise<any> {
  const pageConfigs = await Page.getPageConfigs(['config'])

  if (
    pageConfigs.config &&
    Array.isArray(pageConfigs.config) &&
    pageConfigs.config.length > 0
  ) {
    log.info('loading CMS pages')
    return Promise.all(
      pageConfigs.config.map(async (page) => {
        log.info(`creating: ${page.path}`)
        app.get(page.path, csrfProtection, async (req, res, next) => {
          let pageConfig = page

          if (page.config) {
            const result = await Page.getPageConfigs([page.config])
            pageConfig = result[page.config]
          }

          try {
            await renderCMSPage(app, pageConfig, req, res)
          } catch (err) {
            nextError(next)(err)
          }
        })
      })
    )
  } else {
    log.info('No CMS pages found')
  }
}