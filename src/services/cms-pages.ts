import Page from '../models/page'
import { nextError } from './error-response'

import renderCMSPage from './render-cms-page'

import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'

export default async function (app: any): Promise<any> {
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
        app.get(page.path, async (req, res, next) => {
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
