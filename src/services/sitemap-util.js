// @flow
import slugify from 'slugify'
const Layer = require('../models/layer')
const Hub = require('../models/hub')
const Story = require('../models/story')
const Map = require('../models/map')
const Group = require('../models/group')
const urlUtil = require('./url-util')
const Promise = require('bluebird')
const log = require('./log')

module.exports = {

  async getSiteMapIndexFeatureURLs (trx: any) {
    const baseUrl = urlUtil.getBaseUrl()
    const layers = await trx('omh.layers').select('layer_id')
      .whereNot({
        private: true, is_external: true, remote: true
      })
    const urls = []
    await Promise.map(layers, async (layer) => {
      try {
        const count = await Layer.getLayerFeatureCount(layer.layer_id)
        // ignore if layer feature length > 10,000
        if (count < 10000) {
          urls.push(`${baseUrl}/sitemap.${layer.layer_id}.xml`)
        }
        return
      } catch (err) {
        log.error(err.message)
      }
    })
    return urls
  },

  addLayersToSiteMap (sm: any, trx: any) {
    const baseUrl = urlUtil.getBaseUrl()
    return Layer.getAllLayers(false, trx)
      .then((layers) => {
        layers.forEach((layer) => {
          let lastmodISO = null
          if (layer.last_updated) lastmodISO = layer.last_updated.toISOString()
          sm.add({
            url: baseUrl + '/layer/info/' + layer.layer_id + '/' + slugify(layer.name.en),
            changefreq: 'weekly',
            lastmodISO
          })
        })
        return sm
      })
  },

  addStoriesToSiteMap (sm: any, trx: any) {
    return Story.getAllStories(trx).orderBy('omh.stories.updated_at', 'desc')
      .then((stories) => {
        stories.forEach((story) => {
          const title = story.title.replace('&nbsp;', '')
          let story_url = ''
          if (story.display_name) {
            const baseUrl = urlUtil.getBaseUrl()
            story_url = baseUrl + '/user/' + story.display_name
          } else if (story.hub_id) {
            story_url = '/hub/' + story.hub_id
          }
          story_url += '/story/' + story.story_id + '/' + slugify(title)
          let lastmodISO = null
          if (story.updated_at) lastmodISO = story.updated_at.toISOString()
          sm.add({
            url: story_url,
            changefreq: 'daily',
            lastmodISO
          })
        })
        return sm
      })
  },

  addHubsToSiteMap (sm: any, trx: any) {
    return Hub.getAllHubs(trx)
      .then((hubs) => {
        hubs.forEach((hub) => {
          const baseUrl = urlUtil.getBaseUrl()
          const hubUrl = baseUrl + '/hub/' + hub.hub_id
          let lastmodISO = null
          if (hub.updated_at_withTZ) lastmodISO = hub.updated_at_withTZ.toISOString()
          sm.add({
            url: hubUrl,
            changefreq: 'daily',
            lastmodISO
          })
        })
        return sm
      })
  },

  addMapsToSiteMap (sm: any, trx: any) {
    const baseUrl = urlUtil.getBaseUrl()
    return Map.getAllMaps(trx).orderBy('omh.maps.updated_at', 'desc')
      .then((maps) => {
        maps.forEach((map) => {
          const mapUrl = `${baseUrl}/map/view/${map.map_id}/${slugify(map.title.en)}`
          let lastmodISO = null
          if (map.updated_at) lastmodISO = map.updated_at.toISOString()
          sm.add({
            url: mapUrl,
            changefreq: 'daily',
            lastmodISO
          })
        })
        return sm
      })
  },

  addGroupsToSiteMap (sm: any, trx: any) {
    return Group.getAllGroups(trx)
      .then((groups) => {
        groups.forEach((group) => {
          const groupUrl = urlUtil.getBaseUrl() + '/group/' + group.group_id
          sm.add({
            url: groupUrl,
            changefreq: 'daily'
          })
        })
        return sm
      })
  },

  addLayerFeaturesToSiteMap (layer_id: number, sm: any, trx: any) {
    // get all layers
    const baseUrl = urlUtil.getBaseUrl()
    return Layer.getLayerByID(layer_id, trx)
      .then((layer) => {
        if (!layer.is_external && !layer.remote && !layer.private) {
          const layer_id = layer.layer_id
          let lastmodISO = null
          if (layer.last_updated) lastmodISO = layer.last_updated.toISOString()
          return trx(`layers.data_${layer_id}`).select('mhid')
            .then(features => {
              if (features && Array.isArray(features)) {
                features.forEach(feature => {
                  if (feature && feature.mhid) {
                    const featureId = feature.mhid.split(':')[1]
                    sm.add({
                      url: baseUrl + `/feature/${layer_id}/${featureId}/`,
                      changefreq: 'weekly',
                      lastmodISO
                    })
                  }
                })
              }
            })
            .then(() => {
              return sm
            })
        } else {
          return sm
        }
      })
  }
}
