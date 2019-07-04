// @flow
const Layer = require('../models/layer')
const Group = require('../models/group')
const Map = require('../models/map')
const Story = require('../models/story')
const Promise = require('bluebird')
const pageOptions = require('./page-options-helper')

module.exports = function (app: any, config: Object, req: any, res: any) {
  const dataRequests = []
  const dataRequestNames: Array<string> = []
  let useMailChimp
  // use page config to determine data requests
  if (config.components && Array.isArray(config.components) && config.components.length > 0) {
    config.components.forEach((component: Object) => {
      if (component.type === 'map') {
        dataRequests.push(Map.getMap(component.map_id))
        dataRequestNames.push('map')
        dataRequests.push(Map.getMapLayers(component.map_id, false))
        dataRequestNames.push('layers')
      } else if (component.type === 'storyfeed') {
        if (component.datasets) {
          component.datasets.forEach((dataset) => {
            const {type, max} = dataset
            const number = max || 5
            if (type === 'trending' || type === 'popular') {
              dataRequests.push(Story.getPopularStories(number))
              dataRequestNames.push('popularStories')
            } else if (type === 'featured') {
              dataRequests.push(Story.getFeaturedStories(number))
              dataRequestNames.push('featuredStories')
            } else if (type === 'recent') {
              dataRequests.push(Story.getRecentStories(number))
              dataRequestNames.push('recentStories')
            }
          })
        } else {
          dataRequests.push(Story.getPopularStories(5))
          dataRequestNames.push('popularStories')
          dataRequests.push(Story.getFeaturedStories(5))
          dataRequestNames.push('featuredStories')
        }
      } else if (component.type === 'carousel') {
        if (component.datasets && Array.isArray(component.datasets) && component.datasets.length > 0) {
          component.datasets.forEach((dataset) => {
            const {type, filter, max} = dataset
            const number = max || 5
            if (type === 'layer') {
              if (filter === 'featured') {
                dataRequests.push(Layer.getFeaturedLayers(number))
                dataRequestNames.push('popularLayers')
              } else if (filter === 'popular') {
                dataRequests.push(Layer.getPopularLayers(number))
                dataRequestNames.push('popularLayers')
              } else if (filter === 'recent') {
                dataRequests.push(Layer.getRecentLayers(number))
                dataRequestNames.push('recentLayers')
              }
            } else if (type === 'group') {
              if (filter === 'featured') {
                dataRequests.push(Group.getFeaturedGroups(number))
                dataRequestNames.push('featuredGroups')
              } else if (filter === 'popular') {
                dataRequests.push(Group.getPopularGroups(number))
                dataRequestNames.push('popularGroups')
              } else if (filter === 'recent') {
                dataRequests.push(Group.getRecentGroups(number))
                dataRequestNames.push('recentGroups')
              }
            } else if (type === 'map') {
              if (filter === 'featured') {
                dataRequests.push(Map.getFeaturedMaps(number))
                dataRequestNames.push('featuredMaps')
              } else if (filter === 'popular') {
                dataRequests.push(Map.getPopularMaps(number))
                dataRequestNames.push('popularMaps')
              } else if (filter === 'recent') {
                dataRequests.push(Map.getRecentMaps(number))
                dataRequestNames.push('recentMaps')
              }
            } else if (type === 'story') {
              if (filter === 'featured') {
                dataRequests.push(Story.getFeaturedStories(number))
                dataRequestNames.push('featuredStories')
              } else if (filter === 'popular') {
                dataRequests.push(Story.getPopularStories(number))
                dataRequestNames.push('popularStories')
              } else if (filter === 'recent') {
                dataRequests.push(Story.getRecentStories(number))
                dataRequestNames.push('recentStories')
              }
            }
          })
        }
      } else if (component.type === 'mailinglist') {
        useMailChimp = true
      }
    })
  }

  return Promise.all(dataRequests)
    .then(async (results) => {
      const props = {pageConfig: config, _csrf: req.csrfToken()}
      results.forEach((result, i) => {
        props[dataRequestNames[i]] = result
      })
      let title = MAPHUBS_CONFIG.productName
      let description = MAPHUBS_CONFIG.productName
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
    })
}
