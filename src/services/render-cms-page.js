// @flow
const Layer = require('../models/layer')
const Group = require('../models/group')
const Map = require('../models/map')
const Story = require('../models/story')
const pageOptions = require('./page-options-helper')
const local = require('../local')

module.exports = async function (app: any, config: Object, req: any, res: any) {
  const results = {}
  let useMailChimp
  // use page config to determine data requests
  if (config.components && Array.isArray(config.components) && config.components.length > 0) {
    await Promise.all(config.components.map(async (component: Object) => {
      if (component.type === 'map') {
        results.map = await Map.getMap(component.map_id)
        results.layers = await Map.getMapLayers(component.map_id, false)
      } else if (component.type === 'storyfeed') {
        if (component.datasets) {
          await Promise.all(component.datasets.map(async (dataset) => {
            const {type, max, tags} = dataset
            const number = max || 6
            if (type === 'trending' || type === 'popular') {
              results.popularStories = await Story.getPopularStories(number)
            } else if (type === 'featured') {
              results.featuredStories = await Story.getFeaturedStories(number)
            } else if (type === 'recent') {
              results.recentStories = await Story.getRecentStories({number, tags})
            }
          }))
        } else {
          results.popularStories = await Story.getPopularStories(5)
          results.featuredStories = await Story.getFeaturedStories(5)
        }
      } else if (component.type === 'carousel') {
        if (component.datasets && Array.isArray(component.datasets) && component.datasets.length > 0) {
          await Promise.all(component.datasets.map(async (dataset) => {
            const {type, filter, max, tags} = dataset
            const number = max || 6
            if (type === 'layer') {
              if (filter === 'featured') {
                results.featuredLayers = await Layer.getFeaturedLayers(number)
              } else if (filter === 'popular') {
                results.popularLayers = await Layer.getPopularLayers(number)
              } else if (filter === 'recent') {
                results.recentLayers = await Layer.getRecentLayers(number)
              }
            } else if (type === 'group') {
              if (filter === 'featured') {
                results.featuredGroups = await Group.getFeaturedGroups(number)
              } else if (filter === 'popular') {
                results.popularGroups = await Group.getPopularGroups(number)
              } else if (filter === 'recent') {
                results.recentGroups = await Group.getRecentGroups(number)
              }
            } else if (type === 'map') {
              if (filter === 'featured') {
                results.featuredMaps = await Map.getFeaturedMaps(number)
              } else if (filter === 'popular') {
                results.popularMaps = await Map.getPopularMaps(number)
              } else if (filter === 'recent') {
                results.recentMaps = await Map.getRecentMaps(number)
              }
            } else if (type === 'story') {
              if (filter === 'featured') {
                results.featuredStories = await Story.getFeaturedStories(number)
              } else if (filter === 'popular') {
                results.popularStories = await Story.getPopularStories(number)
              } else if (filter === 'recent') {
                results.recentStories = await Story.getRecentStories({number, tags})
              }
            }
          }))
        }
      } else if (component.type === 'mailinglist') {
        useMailChimp = true
      }
    }))
  }

  const props = {...results, pageConfig: config, _csrf: req.csrfToken()}

  let title = local.productName
  let description = local.productName
  if (config.title && config.title[req.locale]) {
    title = config.title[req.locale]
  } else if (config.title && config.title.en) {
    title = config.title.en
  }

  if (config.description && config.description[req.locale]) {
    description = config.description[req.locale]
  } else if (config.description && config.description.en) {
    description = config.description.en
  }

  return app.next.render(req, res, '/home', await pageOptions(req, {
    title,
    description,
    mailchimp: useMailChimp,
    props,
    hideFeedback: config.hideFeedback
  }))
}
