// @flow
const Layer = require('../models/layer')
const Group = require('../models/group')
const Hub = require('../models/hub')
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
        dataRequests.push(Story.getPopularStories(5))
        dataRequestNames.push('trendingStories')
        dataRequests.push(Story.getFeaturedStories(5))
        dataRequestNames.push('featuredStories')
      } else if (component.type === 'carousel') {
        if (component.datasets && Array.isArray(component.datasets) && component.datasets.length > 0) {
          component.datasets.forEach((dataset) => {
            if (dataset.type === 'layer' && dataset.filter === 'popular') {
              dataRequests.push(Layer.getPopularLayers(5))
              dataRequestNames.push('trendingLayers')
            } else if (dataset.type === 'group' && dataset.filter === 'popular') {
              dataRequests.push(Group.getPopularGroups(5))
              dataRequestNames.push('trendingGroups')
            } else if (dataset.type === 'hub' && dataset.filter === 'popular') {
              dataRequests.push(Hub.getPopularHubs(5))
              dataRequestNames.push('trendingHubs')
            } else if (dataset.type === 'map' && dataset.filter === 'popular') {
              dataRequests.push(Map.getPopularMaps(5))
              dataRequestNames.push('trendingMaps')
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
