import Layer from '../../models/layer'

import Group from '../../models/group'

import Map from '../../models/map'

import Page from '../../models/page'

import Story from '../../models/story'

import { nextError } from '../../services/error-response'

import csurf from 'csurf'

import renderCMSPage from '../../services/render-cms-page'

import pageOptions from '../../services/page-options-helper'

import local from '../../local'

const csrfProtection = csurf({
  cookie: false
})

export default function (app: any) {
  app.get('/', csrfProtection, async (req, res, next) => {
    try {
      const { home } = await Page.getPageConfigs(['home'])
      await renderCMSPage(app, home, req, res)
    } catch (err) {
      nextError(next)(err)
    }
  })
  app.get('/explore', csrfProtection, async (req, res, next) => {
    try {
      return app.next.render(
        req,
        res,
        '/explore',
        await pageOptions(req, {
          title: req.__('Explore') + ' - ' + local.productName,
          props: {
            featuredLayers: await Layer.getFeaturedLayers(10),
            featuredGroups: await Group.getFeaturedGroups(10),
            featuredMaps: await Map.getFeaturedMaps(10),
            featuredStories: await Story.getFeaturedStories(10),
            popularLayers: await Layer.getPopularLayers(10),
            popularGroups: await Group.getPopularGroups(10),
            popularMaps: await Map.getPopularMaps(10),
            popularStories: await Story.getPopularStories(10),
            recentLayers: await Layer.getRecentLayers(10),
            recentGroups: await Group.getRecentGroups(10),
            recentMaps: await Map.getRecentMaps(10),
            recentStories: await Story.getRecentStories({
              number: 10
            })
          }
        })
      )
    } catch (err) {
      nextError(next)(err)
    }
  })
}
